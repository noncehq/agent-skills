import { spawn } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { platform, userInfo } from "node:os";
import { dirname, join } from "node:path";

import { OAUTH_SERVICE_NAME } from "./constants.js";
import { normalizeProfile } from "./profile.js";
import { getStateBaseDir } from "./state-store.js";

export type CredentialStoreKind = "local-file" | "macos-keychain" | "windows-dpapi";

export interface CredentialStore {
  readonly kind: CredentialStoreKind;
  delete(key: string): Promise<void>;
  get(key: string): Promise<string | undefined>;
  set(key: string, value: string): Promise<void>;
}

const run = async (
  command: string,
  args: string[],
  input?: string,
  options: { env?: NodeJS.ProcessEnv } = {},
): Promise<{ code: number; stdout: string; stderr: string }> =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      env: options.env === undefined ? undefined : { ...process.env, ...options.env },
      stdio: ["pipe", "pipe", "pipe"],
    });
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    child.stdout.on("data", (chunk) => stdout.push(Buffer.from(chunk)));
    child.stderr.on("data", (chunk) => stderr.push(Buffer.from(chunk)));
    child.on("error", reject);
    child.on("close", (code) =>
      resolve({
        code: code ?? 1,
        stdout: Buffer.concat(stdout).toString("utf8"),
        stderr: Buffer.concat(stderr).toString("utf8"),
      }),
    );
    if (input !== undefined) {
      child.stdin.end(input);
    } else {
      child.stdin.end();
    }
  });

const namespacedKey = (profile: string, key: string): string =>
  `${normalizeProfile(profile)}:${key}`;

const MACOS_KEYCHAIN_EXPECT = "/usr/bin/expect";

const MACOS_KEYCHAIN_SET_SCRIPT = [
  "set timeout 30",
  "log_user 0",
  "set secret [read stdin]",
  "set service $env(NONCE_KEYCHAIN_SERVICE)",
  "set account $env(NONCE_KEYCHAIN_ACCOUNT)",
  "spawn security add-generic-password -U -s $service -a $account -w",
  "expect {",
  "  -re {(?i)password.*:} {",
  '    send -- "$secret\\r"',
  "    exp_continue",
  "  }",
  "  eof {}",
  "  timeout { exit 124 }",
  "}",
  "set waitResult [wait]",
  "exit [lindex $waitResult 3]",
].join("\n");

const saveMacOSKeychainCredential = async (account: string, value: string): Promise<void> => {
  let result: { code: number; stdout: string; stderr: string };
  try {
    result = await run(MACOS_KEYCHAIN_EXPECT, ["-c", MACOS_KEYCHAIN_SET_SCRIPT], value, {
      env: {
        NONCE_KEYCHAIN_ACCOUNT: account,
        NONCE_KEYCHAIN_SERVICE: OAUTH_SERVICE_NAME,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Failed to save credential in macOS Keychain: ${MACOS_KEYCHAIN_EXPECT} is required to avoid exposing secrets in process arguments. ${message}`,
    );
  }

  if (result.code !== 0) {
    const detail = result.stderr.trim() || result.stdout.trim() || `exit code ${result.code}`;
    throw new Error(`Failed to save credential in macOS Keychain: ${detail}`);
  }
};

export class MacOSKeychainCredentialStore implements CredentialStore {
  readonly kind = "macos-keychain";

  constructor(private readonly profile: string) {}

  async delete(key: string): Promise<void> {
    await run("security", [
      "delete-generic-password",
      "-s",
      OAUTH_SERVICE_NAME,
      "-a",
      namespacedKey(this.profile, key),
    ]);
  }

  async get(key: string): Promise<string | undefined> {
    const result = await run("security", [
      "find-generic-password",
      "-s",
      OAUTH_SERVICE_NAME,
      "-a",
      namespacedKey(this.profile, key),
      "-w",
    ]);
    if (result.code !== 0) return undefined;
    return result.stdout.replace(/\n$/, "");
  }

  async set(key: string, value: string): Promise<void> {
    await saveMacOSKeychainCredential(namespacedKey(this.profile, key), value);
  }
}

const credentialPath = (profile: string, key: string, extension = "secret"): string => {
  const safeProfile = normalizeProfile(profile);
  const safeKey = key.replaceAll(/[^a-zA-Z0-9_.-]/g, "-");
  return join(getStateBaseDir(), safeProfile, "credentials", `${safeKey}.${extension}`);
};

const restrictWindowsFileToCurrentUser = async (file: string): Promise<void> => {
  const username = userInfo().username;
  if (!username) return;
  const result = await run("icacls", [file, "/inheritance:r", "/grant:r", `${username}:F`]);
  if (result.code !== 0) {
    throw new Error(
      `Failed to restrict Windows credential file permissions: ${result.stderr.trim()}`,
    );
  }
};

const runWindowsPowerShell = async (script: string, input?: string): Promise<string> => {
  const result = await run(
    "powershell.exe",
    ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-Command", script],
    input,
  );
  if (result.code !== 0) {
    throw new Error(
      `Windows DPAPI credential operation failed: ${result.stderr.trim() || result.stdout.trim()}`,
    );
  }
  return result.stdout;
};

const protectWindowsSecret = async (value: string): Promise<string> =>
  (
    await runWindowsPowerShell(
      [
        "$ErrorActionPreference = 'Stop'",
        "$plain = [Console]::In.ReadToEnd()",
        "$bytes = [System.Text.Encoding]::UTF8.GetBytes($plain)",
        "$protected = [System.Security.Cryptography.ProtectedData]::Protect($bytes, $null, [System.Security.Cryptography.DataProtectionScope]::CurrentUser)",
        "[Console]::Out.Write([Convert]::ToBase64String($protected))",
      ].join("\n"),
      value,
    )
  ).trim();

const unprotectWindowsSecret = async (value: string): Promise<string> =>
  runWindowsPowerShell(
    [
      "$ErrorActionPreference = 'Stop'",
      "$encoded = [Console]::In.ReadToEnd().Trim()",
      "$protected = [Convert]::FromBase64String($encoded)",
      "$bytes = [System.Security.Cryptography.ProtectedData]::Unprotect($protected, $null, [System.Security.Cryptography.DataProtectionScope]::CurrentUser)",
      "[Console]::Out.Write([System.Text.Encoding]::UTF8.GetString($bytes))",
    ].join("\n"),
    value,
  );

export class FileCredentialStore implements CredentialStore {
  readonly kind = "local-file";

  constructor(private readonly profile: string) {}

  async delete(key: string): Promise<void> {
    await rm(credentialPath(this.profile, key), { force: true });
  }

  async get(key: string): Promise<string | undefined> {
    try {
      return await readFile(credentialPath(this.profile, key), "utf8");
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "ENOENT") {
        return undefined;
      }
      throw error;
    }
  }

  async set(key: string, value: string): Promise<void> {
    const file = credentialPath(this.profile, key);
    await mkdir(dirname(file), { recursive: true, mode: 0o700 });
    await writeFile(file, value, { mode: 0o600 });
    if (platform() === "win32") {
      await restrictWindowsFileToCurrentUser(file);
    }
  }
}

export class WindowsDpapiCredentialStore implements CredentialStore {
  readonly kind = "windows-dpapi";

  constructor(private readonly profile: string) {}

  async delete(key: string): Promise<void> {
    await rm(credentialPath(this.profile, key, "dpapi"), { force: true });
  }

  async get(key: string): Promise<string | undefined> {
    try {
      return await unprotectWindowsSecret(
        await readFile(credentialPath(this.profile, key, "dpapi"), "utf8"),
      );
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "ENOENT") {
        return undefined;
      }
      throw error;
    }
  }

  async set(key: string, value: string): Promise<void> {
    const file = credentialPath(this.profile, key, "dpapi");
    await mkdir(dirname(file), { recursive: true, mode: 0o700 });
    await writeFile(file, `${await protectWindowsSecret(value)}\n`, { mode: 0o600 });
    await restrictWindowsFileToCurrentUser(file);
  }
}

export interface CreateCredentialStoreOptions {
  profile?: string;
  preferFile?: boolean;
}

export const credentialStoreKindForPlatform = (
  os: NodeJS.Platform,
  preferFile = false,
): CredentialStoreKind => {
  if (preferFile) return "local-file";
  if (os === "darwin") return "macos-keychain";
  if (os === "win32") return "windows-dpapi";
  return "local-file";
};

export const createCredentialStore = (
  options: CreateCredentialStoreOptions = {},
): CredentialStore => {
  const profile = normalizeProfile(options.profile);
  switch (credentialStoreKindForPlatform(platform(), options.preferFile)) {
    case "macos-keychain":
      return new MacOSKeychainCredentialStore(profile);
    case "windows-dpapi":
      return new WindowsDpapiCredentialStore(profile);
    case "local-file":
      return new FileCredentialStore(profile);
  }
};
