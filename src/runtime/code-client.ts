import { DEFAULT_MCP_ENDPOINT, DEFAULT_PROFILE } from "./constants.js";
import {
  createNonceClient,
  type CreateNonceClientOptions,
  type NonceClient,
} from "./nonce-client.js";
import { normalizeProfile } from "./profile.js";

export interface CodeClientOptions {
  allowDestructive?: boolean;
  profile?: string;
}

export interface CodeClientDependencies {
  createNonceClient?: (options: CreateNonceClientOptions) => Promise<NonceClient>;
}

const allowedOptions = new Set<keyof CodeClientOptions>(["allowDestructive", "profile"]);

const validateOptions = (options: CodeClientOptions): void => {
  for (const key of Object.keys(options)) {
    if (!allowedOptions.has(key as keyof CodeClientOptions)) {
      throw new Error(`Unsupported Nonce client option: ${key}`);
    }
  }
  if (options.allowDestructive !== undefined && typeof options.allowDestructive !== "boolean") {
    throw new Error("allowDestructive must be a boolean");
  }
  if (options.profile !== undefined && typeof options.profile !== "string") {
    throw new Error("profile must be a string");
  }
};

export const createNonceCodeClientWithDependencies = async (
  options: CodeClientOptions = {},
  dependencies: CodeClientDependencies = {},
): Promise<NonceClient> => {
  validateOptions(options);
  return (dependencies.createNonceClient ?? createNonceClient)({
    allowDestructive: options.allowDestructive === true,
    endpoint: DEFAULT_MCP_ENDPOINT,
    name: "nonce-skill-code",
    profile: normalizeProfile(options.profile ?? DEFAULT_PROFILE),
    version: "0.0.0",
  });
};

export const createNonceCodeClient = async (
  options: CodeClientOptions = {},
): Promise<NonceClient> => createNonceCodeClientWithDependencies(options);
