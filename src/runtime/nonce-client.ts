import { readFile } from "node:fs/promises";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { RequestOptions } from "@modelcontextprotocol/sdk/shared/protocol.js";

import { DEFAULT_MCP_ENDPOINT, DEFAULT_PROFILE } from "./constants.js";
import { createOAuthProvider } from "./oauth-provider.js";
import { normalizeProfile } from "./profile.js";

export interface CreateNonceClientOptions {
  allowDestructive?: boolean;
  endpoint?: string;
  name?: string;
  profile?: string;
  version?: string;
}

export interface CallOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
}

export type ReadonlyCallOptions = CallOptions;

export interface DestructiveCallOptions extends CallOptions {
  confirmDestructive: true;
  confirmation: string;
}

export interface NonceClient {
  close(): Promise<void>;
  [methodName: string]: unknown;
}

export interface ToolDefinition {
  destructive: boolean;
  methodName: string;
  name: string;
}

interface McpClientLike {
  callTool(
    request: { arguments: Record<string, unknown>; name: string },
    resultSchema?: unknown,
    options?: RequestOptions,
  ): Promise<Record<string, unknown>>;
  close(): Promise<void>;
  connect(transport: unknown): Promise<void>;
}

interface ClientMetadata {
  name: string;
  version: string;
}

export interface NonceClientRuntimeDependencies {
  createClient?: (metadata: ClientMetadata) => McpClientLike;
  createProvider?: typeof createOAuthProvider;
  createTransport?: (endpoint: string, provider: ReturnType<typeof createOAuthProvider>) => unknown;
  toolDefinitions?: readonly ToolDefinition[];
}

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
): void => {
  if (!definition.destructive) return;
  if (!allowDestructive) {
    throw new Error(
      `Tool ${definition.name} is destructive. Enable it only after explicit user confirmation.`,
    );
  }
  const destructiveOptions = options as DestructiveCallOptions | undefined;
  if (destructiveOptions?.confirmDestructive !== true || !destructiveOptions.confirmation?.trim()) {
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
    throw new Error(textContent(result.content) ?? "Nonce method returned an error");
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

const isToolDefinition = (value: unknown): value is ToolDefinition =>
  typeof value === "object" &&
  value !== null &&
  "destructive" in value &&
  typeof value.destructive === "boolean" &&
  "methodName" in value &&
  typeof value.methodName === "string" &&
  "name" in value &&
  typeof value.name === "string";

const loadGeneratedToolDefinitions = async (): Promise<readonly ToolDefinition[]> => {
  const manifestPath = "../assets/tool-manifest.json";
  const manifestUrl = new URL(manifestPath, import.meta.url);
  const manifest = JSON.parse(await readFile(manifestUrl, "utf8")) as { tools?: unknown };
  const tools = Array.isArray(manifest.tools) ? manifest.tools.filter(isToolDefinition) : [];
  if (tools.length === 0) {
    throw new Error(`Generated Nonce tool manifest is missing or empty: ${manifestUrl.toString()}`);
  }
  return tools;
};

export const resolveDestructiveAllowance = (allowDestructiveOption: boolean | undefined): boolean =>
  allowDestructiveOption === true;

const createDefaultClient = (metadata: ClientMetadata): McpClientLike =>
  new Client(metadata) as unknown as McpClientLike;

const createDefaultTransport = (
  endpoint: string,
  provider: ReturnType<typeof createOAuthProvider>,
): unknown =>
  new StreamableHTTPClientTransport(new URL(endpoint), {
    authProvider: provider,
  });

export const createNonceClientWithDependencies = async (
  options: CreateNonceClientOptions = {},
  dependencies: NonceClientRuntimeDependencies = {},
): Promise<NonceClient> => {
  const endpoint = options.endpoint ?? DEFAULT_MCP_ENDPOINT;
  const toolDefinitions = dependencies.toolDefinitions ?? (await loadGeneratedToolDefinitions());
  const allowDestructive = resolveDestructiveAllowance(options.allowDestructive);
  const provider = (dependencies.createProvider ?? createOAuthProvider)({
    endpoint,
    profile: normalizeProfile(options.profile ?? DEFAULT_PROFILE),
  });
  const client = (dependencies.createClient ?? createDefaultClient)({
    name: options.name ?? "nonce-skill-runtime",
    version: options.version ?? "0.0.0",
  });
  const transport = (dependencies.createTransport ?? createDefaultTransport)(endpoint, provider);

  await client.connect(transport);

  const sdk: Record<string, unknown> = {
    close: async () => {
      await client.close();
    },
  };

  for (const definition of toolDefinitions) {
    sdk[definition.methodName] = async (
      input: Record<string, unknown> | undefined,
      callOptions: ReadonlyCallOptions | DestructiveCallOptions | undefined,
    ): Promise<unknown> => {
      assertDestructiveConfirmation(definition, callOptions, allowDestructive);
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

  return sdk as unknown as NonceClient;
};

export const createNonceClient = async (
  options: CreateNonceClientOptions = {},
): Promise<NonceClient> => createNonceClientWithDependencies(options);
