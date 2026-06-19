import { spawn } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { platform, userInfo } from "node:os";
import { dirname, join } from "node:path";

import { OAUTH_SERVICE_NAME } from "./constants.js";
import { normalizeProfile } from "./profile.js";
import { getStateBaseDir } from "./state-store.js";

export interface CredentialStore {
  readonly kind: string;
  delete(key: string): Promise<void>;
  get(key: string): Promise<string | undefined>;
  set(key: string, value: string): Promise<void>;
}

const run = async (
  command: string,
  args: string[],
  input?: string,
): Promise<{ code: number; stdout: string; stderr: string }> =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["pipe", "pipe", "pipe"] });
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
    const result = await run("security", [
      "add-generic-password",
      "-U",
      "-s",
      OAUTH_SERVICE_NAME,
      "-a",
      namespacedKey(this.profile, key),
      "-w",
      value,
    ]);
    if (result.code !== 0) {
      throw new Error(`Failed to save credential in macOS Keychain: ${result.stderr.trim()}`);
    }
  }
}

const credentialPath = (profile: string, key: string): string => {
  const safeProfile = normalizeProfile(profile);
  const safeKey = key.replaceAll(/[^a-zA-Z0-9_.-]/g, "-");
  return join(getStateBaseDir(), safeProfile, "credentials", `${safeKey}.secret`);
};

const restrictWindowsFileToCurrentUser = async (file: string): Promise<void> => {
  const username = userInfo().username;
  if (!username) return;
  await run("icacls", [file, "/inheritance:r", "/grant:r", `${username}:F`]);
};

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

export interface CreateCredentialStoreOptions {
  profile?: string;
  preferFile?: boolean;
}

export const createCredentialStore = (
  options: CreateCredentialStoreOptions = {},
): CredentialStore => {
  const profile = normalizeProfile(options.profile);
  if (!options.preferFile && platform() === "darwin") {
    return new MacOSKeychainCredentialStore(profile);
  }
  return new FileCredentialStore(profile);
};
