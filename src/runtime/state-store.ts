import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { homedir, platform } from "node:os";
import { dirname, join } from "node:path";

import { OAUTH_SERVICE_NAME } from "./constants.js";
import { restrictFileToCurrentUser } from "./credential-store.js";
import { normalizeProfile } from "./profile.js";

export interface StateStore {
  delete(key: string): Promise<void>;
  getJson<T>(key: string): Promise<T | undefined>;
  setJson<T>(key: string, value: T): Promise<void>;
}

export const getStateBaseDir = (): string => {
  const env = process.env;
  if (platform() === "darwin") {
    return join(homedir(), "Library", "Application Support", OAUTH_SERVICE_NAME);
  }
  if (platform() === "win32") {
    return join(env.APPDATA ?? join(homedir(), "AppData", "Roaming"), "NonceSkill");
  }
  return join(env.XDG_STATE_HOME ?? join(homedir(), ".local", "state"), OAUTH_SERVICE_NAME);
};

const statePath = (baseDir: string, profile: string, key: string): string => {
  const safeProfile = normalizeProfile(profile);
  const safeKey = key.replaceAll(/[^a-zA-Z0-9_.-]/g, "-");
  return join(baseDir, safeProfile, `${safeKey}.json`);
};

export class FileStateStore implements StateStore {
  constructor(
    private readonly profile: string,
    private readonly baseDir = getStateBaseDir(),
  ) {}

  async delete(key: string): Promise<void> {
    await rm(statePath(this.baseDir, this.profile, key), { force: true });
  }

  async getJson<T>(key: string): Promise<T | undefined> {
    try {
      return JSON.parse(await readFile(statePath(this.baseDir, this.profile, key), "utf8")) as T;
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "ENOENT") {
        return undefined;
      }
      throw error;
    }
  }

  async setJson<T>(key: string, value: T): Promise<void> {
    const file = statePath(this.baseDir, this.profile, key);
    await mkdir(dirname(file), { recursive: true, mode: 0o700 });
    await writeFile(file, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
    if (platform() === "win32") {
      await restrictFileToCurrentUser(file);
    }
  }
}

export const createStateStore = (profile = "default", baseDir?: string): StateStore =>
  new FileStateStore(profile, baseDir);
