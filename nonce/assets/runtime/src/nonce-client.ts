import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { RequestOptions } from "@modelcontextprotocol/sdk/shared/protocol.js";

import { DEFAULT_MCP_ENDPOINT, DEFAULT_PROFILE } from "./constants.js";
import {
  type DestructiveCallOptions,
  type NonceMcpClient,
  nonceToolDefinitions,
  type ReadonlyCallOptions,
} from "./generated/tool-signatures.js";
import { createOAuthProvider } from "./oauth-provider.js";
import { normalizeProfile } from "./profile.js";

export interface CreateNonceClientOptions {
  allowDestructive?: boolean;
  endpoint?: string;
  name?: string;
  openBrowser?: boolean;
  profile?: string;
  version?: string;
}

interface ToolDefinition {
  destructive: boolean;
  methodName: string;
  name: string;
}

interface RunnerAuthorizationSnapshot {
  allowDestructive: boolean;
  runnerMode: boolean;
}

const RUNNER_AUTHORIZATION_GLOBAL = "__nonceSkillRunnerAuthorization";

const createRunnerAuthorizationSnapshot = (): RunnerAuthorizationSnapshot =>
  Object.freeze({
    allowDestructive: process.env.NONCE_ALLOW_DESTRUCTIVE === "1",
    runnerMode: process.env.NONCE_RUNNER_MODE === "1",
  });

const getRunnerAuthorizationSnapshot = (): RunnerAuthorizationSnapshot => {
  const globalRecord = globalThis as typeof globalThis & {
    [RUNNER_AUTHORIZATION_GLOBAL]?: RunnerAuthorizationSnapshot;
  };
  if (globalRecord[RUNNER_AUTHORIZATION_GLOBAL]) {
    return globalRecord[RUNNER_AUTHORIZATION_GLOBAL];
  }

  const snapshot = createRunnerAuthorizationSnapshot();
  Object.defineProperty(globalThis, RUNNER_AUTHORIZATION_GLOBAL, {
    configurable: false,
    enumerable: false,
    value: snapshot,
    writable: false,
  });
  return snapshot;
};

export const nonceRunnerAuthorizationSnapshot = getRunnerAuthorizationSnapshot();

const toRequestOptions = (
  options: ReadonlyCallOptions | DestructiveCallOptions | undefined,
): RequestOptions | undefined => {
  if (!options) return undefined;
  return {
    signal: options.signal,
    timeout: options.timeoutMs,
  };
};

const assertDestructiveConfirmation = (
  definition: ToolDefinition,
  options: ReadonlyCallOptions | DestructiveCallOptions | undefined,
  allowDestructive: boolean,
  runnerMode: boolean,
): void => {
  if (!definition.destructive) return;
  if (!allowDestructive) {
    const enablement = runnerMode
      ? "Run nonce:run with --allow-destructive after explicit user confirmation"
      : "Create the client with allowDestructive: true after explicit user confirmation";
    throw new Error(`Tool ${definition.name} is destructive. ${enablement}.`);
  }
  const destructiveOptions = options as DestructiveCallOptions | undefined;
  if (destructiveOptions?.confirmDestructive !== true || !destructiveOptions.confirmation) {
    throw new Error(
      `Tool ${definition.name} is destructive. Pass { confirmDestructive: true, confirmation: "..." } after explicit user confirmation.`,
    );
  }
};

const textContent = (content: unknown): string | undefined => {
  if (!Array.isArray(content)) return undefined;
  const text = content
    .map((item) => {
      if (
        typeof item === "object" &&
        item !== null &&
        "type" in item &&
        item.type === "text" &&
        "text" in item
      ) {
        return typeof item.text === "string" ? item.text : undefined;
      }
      return undefined;
    })
    .filter((value): value is string => Boolean(value))
    .join("\n");
  return text.length > 0 ? text : undefined;
};

const parseToolResult = (result: Record<string, unknown>): unknown => {
  if (result.isError === true) {
    throw new Error(textContent(result.content) ?? "Nonce MCP tool returned an error");
  }
  if (result.structuredContent !== undefined) return result.structuredContent;
  if (result.toolResult !== undefined) return result.toolResult;

  const text = textContent(result.content);
  if (!text) return result;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
};

export const resolveDestructiveAllowance = (
  allowDestructiveOption: boolean | undefined,
  runnerAuthorization: RunnerAuthorizationSnapshot = nonceRunnerAuthorizationSnapshot,
): boolean => {
  if (runnerAuthorization.runnerMode) {
    if (allowDestructiveOption === true && !runnerAuthorization.allowDestructive) {
      throw new Error(
        "Destructive calls through nonce:run require the runner --allow-destructive flag.",
      );
    }
    return runnerAuthorization.allowDestructive;
  }
  return allowDestructiveOption ?? process.env.NONCE_ALLOW_DESTRUCTIVE === "1";
};

export const createNonceClient = async (
  options: CreateNonceClientOptions = {},
): Promise<NonceMcpClient> => {
  const endpoint = options.endpoint ?? process.env.NONCE_MCP_ENDPOINT ?? DEFAULT_MCP_ENDPOINT;
  const allowDestructive = resolveDestructiveAllowance(options.allowDestructive);
  const provider = createOAuthProvider({
    endpoint,
    openBrowser: options.openBrowser ?? false,
    profile: normalizeProfile(options.profile ?? process.env.NONCE_PROFILE ?? DEFAULT_PROFILE),
  });
  const client = new Client({
    name: options.name ?? "nonce-skill-runtime",
    version: options.version ?? "0.0.0",
  });
  const transport = new StreamableHTTPClientTransport(new URL(endpoint), {
    authProvider: provider,
  });

  await client.connect(transport);

  const sdk: Record<string, unknown> = {
    close: async () => {
      await client.close();
    },
  };

  for (const definition of nonceToolDefinitions) {
    sdk[definition.methodName] = async (
      input: Record<string, unknown> | undefined,
      callOptions: ReadonlyCallOptions | DestructiveCallOptions | undefined,
    ): Promise<unknown> => {
      assertDestructiveConfirmation(
        definition,
        callOptions,
        allowDestructive,
        nonceRunnerAuthorizationSnapshot.runnerMode,
      );
      const result = await client.callTool(
        {
          arguments: input ?? {},
          name: definition.name,
        },
        undefined,
        toRequestOptions(callOptions),
      );
      return parseToolResult(result);
    };
  }

  return sdk as unknown as NonceMcpClient;
};
