import { chmod, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { platform } from "node:os";
import { dirname, join } from "node:path";

import { normalizeProfile } from "./profile.js";
import { getStateBaseDir } from "./state-store.js";

export type CredentialStoreKind = "local-file";

export interface CredentialStore {
  readonly kind: CredentialStoreKind;
  delete(key: string): Promise<void>;
  get(key: string): Promise<string | undefined>;
  set(key: string, value: string): Promise<void>;
}

export const getCredentialDirectory = (baseDir: string, profile: string): string => {
  const safeProfile = normalizeProfile(profile);
  return join(baseDir, safeProfile, "credentials");
};

const credentialPath = (
  baseDir: string,
  profile: string,
  key: string,
  extension = "secret",
): string => {
  const safeKey = key.replaceAll(/[^a-zA-Z0-9_.-]/g, "-");
  return join(getCredentialDirectory(baseDir, profile), `${safeKey}.${extension}`);
};

export class FileCredentialStore implements CredentialStore {
  readonly kind = "local-file";

  constructor(
    private readonly profile: string,
    private readonly baseDir = getStateBaseDir(),
  ) {}

  async delete(key: string): Promise<void> {
    await rm(credentialPath(this.baseDir, this.profile, key), { force: true });
  }

  async get(key: string): Promise<string | undefined> {
    try {
      return await readFile(credentialPath(this.baseDir, this.profile, key), "utf8");
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "ENOENT") {
        return undefined;
      }
      throw error;
    }
  }

  async set(key: string, value: string): Promise<void> {
    const file = credentialPath(this.baseDir, this.profile, key);
    const directory = dirname(file);
    const profileDirectory = dirname(directory);
    await mkdir(directory, { recursive: true, mode: 0o700 });
    await writeFile(file, value, { mode: 0o600 });
    if (platform() !== "win32") {
      await Promise.all([
        chmod(profileDirectory, 0o700),
        chmod(directory, 0o700),
        chmod(file, 0o600),
      ]);
    }
  }
}

export interface CreateCredentialStoreOptions {
  baseDir?: string;
  profile?: string;
}

export const createCredentialStore = (
  options: CreateCredentialStoreOptions = {},
): CredentialStore => {
  const profile = normalizeProfile(options.profile);
  return new FileCredentialStore(profile, options.baseDir);
};
