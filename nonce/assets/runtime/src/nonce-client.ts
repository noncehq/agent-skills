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
  endpoint?: string;
  fileCredentials?: boolean;
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
): void => {
  if (!definition.destructive) return;
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

export const createNonceClient = async (
  options: CreateNonceClientOptions = {},
): Promise<NonceMcpClient> => {
  const endpoint = options.endpoint ?? DEFAULT_MCP_ENDPOINT;
  const provider = createOAuthProvider({
    endpoint,
    openBrowser: options.openBrowser ?? false,
    preferFileCredentials: options.fileCredentials,
    profile: normalizeProfile(options.profile ?? DEFAULT_PROFILE),
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
      assertDestructiveConfirmation(definition, callOptions);
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
