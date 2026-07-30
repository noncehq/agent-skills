import { mkdir, readdir, unlink, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import {
  discoverOAuthServerInfo,
  refreshAuthorization,
  registerClient,
  selectResourceURL,
} from "@modelcontextprotocol/sdk/client/auth.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { Command } from "commander";

import { DEFAULT_MCP_ENDPOINT, DEFAULT_PROFILE } from "../src/runtime/constants.js";
import { createOAuthProvider, type NonceOAuthProvider } from "../src/runtime/oauth-provider.js";
import { normalizeProfile } from "../src/runtime/profile.js";
import { generateArtifacts } from "../src/sdk-generator/artifacts.js";
import {
  buildOpenApiIndex,
  DEFAULT_OPENAPI_URL,
  type OpenApiIndex,
  fetchOpenApiDocument,
} from "../src/sdk-generator/openapi.js";
import {
  hasUsefulOutputSchema,
  inferJsonSchemaFromValue,
  type JsonSchema,
} from "../src/sdk-generator/schema.js";

export const generateSdkCommandName = "nonce generate-sdk";

interface GenerateSdkOptions {
  clientTypesOutput?: string;
  endpoint?: string;
  openapiUrl?: string;
  outputDir?: string;
  profile?: string;
  referenceOutput?: string;
  schemasDir?: string;
  skipObservedOutputs?: boolean;
}

interface McpInspection {
  observedOutputSchemas: Record<string, JsonSchema>;
  server: unknown;
  tools: Tool[];
}

const getCliArgv = (): string[] => {
  const argv = [...process.argv];
  const separatorIndex = argv.indexOf("--", 2);
  if (separatorIndex !== -1) {
    argv.splice(separatorIndex, 1);
  }
  return argv;
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

const shouldObserveOutputSchema = (tool: Tool, openApiIndex: OpenApiIndex): boolean => {
  if (tool.name !== "ListWorkspaces") return false;
  if (tool.annotations?.readOnlyHint !== true) return false;
  if (hasUsefulOutputSchema(tool.outputSchema)) return false;
  return !openApiIndex.operations.has(tool.name);
};

interface AuthorizationRefreshDependencies {
  discoverOAuthServerInfo: typeof discoverOAuthServerInfo;
  refreshAuthorization: typeof refreshAuthorization;
  registerClient: typeof registerClient;
  selectResourceURL: typeof selectResourceURL;
}

const authorizationRefreshDependencies: AuthorizationRefreshDependencies = {
  discoverOAuthServerInfo,
  refreshAuthorization,
  registerClient,
  selectResourceURL,
};

const authLoginHint =
  "Run `vp node -- skills/nonce/scripts/auth.mjs login` from the repository root first.";

const networkErrorCodes = new Set([
  "ECONNABORTED",
  "ECONNREFUSED",
  "ECONNRESET",
  "ENETUNREACH",
  "ENOTFOUND",
  "EPIPE",
  "ETIMEDOUT",
]);

const isNetworkError = (error: unknown): boolean => {
  let current = error;
  const seen = new Set<unknown>();

  while (current instanceof Error && !seen.has(current)) {
    seen.add(current);
    if (
      ("code" in current &&
        typeof current.code === "string" &&
        networkErrorCodes.has(current.code)) ||
      current.message.toLowerCase().includes("fetch failed")
    ) {
      return true;
    }
    current = current.cause;
  }

  return false;
};

export const refreshNonceAccessToken = async (
  provider: NonceOAuthProvider,
  dependencies: AuthorizationRefreshDependencies = authorizationRefreshDependencies,
): Promise<void> => {
  const tokens = await provider.tokens();
  if (!tokens?.refresh_token) {
    throw new Error(`Not authenticated with a refresh token. ${authLoginHint}`);
  }

  const serverInfo = await dependencies.discoverOAuthServerInfo(provider.endpoint);
  await provider.saveDiscoveryState?.({
    authorizationServerMetadata: serverInfo.authorizationServerMetadata,
    authorizationServerUrl: serverInfo.authorizationServerUrl,
    resourceMetadata: serverInfo.resourceMetadata,
  });

  const resource = await dependencies.selectResourceURL(
    provider.endpoint,
    provider,
    serverInfo.resourceMetadata,
  );
  const scope =
    serverInfo.resourceMetadata?.scopes_supported?.join(" ") || provider.clientMetadata.scope;
  let clientInformation = await provider.clientInformation();
  if (!clientInformation) {
    if (!provider.saveClientInformation) {
      throw new Error("OAuth client information is missing and cannot be saved.");
    }
    clientInformation = await dependencies.registerClient(serverInfo.authorizationServerUrl, {
      clientMetadata: provider.clientMetadata,
      metadata: serverInfo.authorizationServerMetadata,
      scope,
    });
    await provider.saveClientInformation(clientInformation);
  }

  try {
    const refreshedTokens = await dependencies.refreshAuthorization(
      serverInfo.authorizationServerUrl,
      {
        addClientAuthentication: provider.addClientAuthentication,
        clientInformation,
        metadata: serverInfo.authorizationServerMetadata,
        refreshToken: tokens.refresh_token,
        resource,
      },
    );
    await provider.saveTokens(refreshedTokens);
  } catch (error) {
    if (isNetworkError(error)) {
      throw new Error(
        "Could not reach the Nonce OAuth server while refreshing saved credentials. Check network or TLS connectivity and retry; the saved refresh token was not classified as invalid.",
        { cause: error },
      );
    }
    throw new Error(`Saved Nonce OAuth refresh token is invalid or expired. ${authLoginHint}`, {
      cause: error,
    });
  }
};

const observeOutputSchemas = async (
  client: Client,
  tools: Tool[],
  openApiIndex: OpenApiIndex,
): Promise<Record<string, JsonSchema>> => {
  const observed: Record<string, JsonSchema> = {};
  for (const tool of tools) {
    if (!shouldObserveOutputSchema(tool, openApiIndex)) continue;
    const result = await client.callTool({
      arguments: {},
      name: tool.name,
    });
    observed[tool.name] = {
      ...inferJsonSchemaFromValue(parseToolResult(result)),
      description: `Observed output from read-only MCP tool ${tool.name}.`,
    };
  }
  return observed;
};

const inspectMcp = async (
  options: Required<Pick<GenerateSdkOptions, "endpoint" | "profile">> &
    Pick<GenerateSdkOptions, "skipObservedOutputs"> & {
      openApiIndex: OpenApiIndex;
    },
): Promise<McpInspection> => {
  const provider = createOAuthProvider({
    endpoint: options.endpoint,
    profile: normalizeProfile(options.profile),
  });
  await refreshNonceAccessToken(provider);

  const client = new Client({ name: "nonce-sdk-generator", version: "0.0.0" });
  const transport = new StreamableHTTPClientTransport(new URL(provider.endpoint), {
    authProvider: provider,
  });

  try {
    await client.connect(transport);
    const result = await client.listTools();
    const observedOutputSchemas = options.skipObservedOutputs
      ? {}
      : await observeOutputSchemas(client, result.tools, options.openApiIndex);
    return {
      observedOutputSchemas,
      server: client.getServerVersion(),
      tools: result.tools,
    };
  } finally {
    await client.close();
  }
};

const writeJson = async (path: string, value: unknown): Promise<void> => {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
};

const writeText = async (path: string, value: string): Promise<void> => {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, value);
};

export const removeStaleGeneratedSchemas = async (
  schemasDir: string,
  currentFileNames: Iterable<string>,
): Promise<void> => {
  const current = new Set(currentFileNames);
  let entries;
  try {
    entries = await readdir(schemasDir, { withFileTypes: true });
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") return;
    throw error;
  }

  await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".md") && !current.has(entry.name))
      .map((entry) => unlink(join(schemasDir, entry.name))),
  );
};

const generate = async (options: GenerateSdkOptions): Promise<void> => {
  const endpoint = options.endpoint ?? DEFAULT_MCP_ENDPOINT;
  const clientTypesOutput = options.clientTypesOutput ?? "skills/nonce/scripts/client.d.mts";
  const profile = normalizeProfile(options.profile ?? DEFAULT_PROFILE);
  const outputDir = options.outputDir ?? "skills/nonce/assets";
  const openapiUrl = options.openapiUrl ?? DEFAULT_OPENAPI_URL;
  const referenceOutput = options.referenceOutput ?? "skills/nonce/references/tool-signatures.md";
  const schemasDir = options.schemasDir ?? "skills/nonce/assets/schemas";

  const openApiDocument = await fetchOpenApiDocument(openapiUrl);
  const openApiIndex = buildOpenApiIndex(openApiDocument);
  const { observedOutputSchemas, server, tools } = await inspectMcp({
    endpoint,
    openApiIndex,
    profile,
    skipObservedOutputs: options.skipObservedOutputs,
  });
  const artifacts = await generateArtifacts(
    {
      mcpEndpoint: endpoint,
      observedOutputSchemas,
      openapiOperationCount: openApiIndex.operationCount,
      openapiUrl,
      server,
      tools,
    },
    openApiIndex,
  );

  const signatureFileWrites = [...artifacts.methodSchemaFiles.entries()].map(
    ([fileName, content]) => writeText(join(schemasDir, fileName), content),
  );

  await removeStaleGeneratedSchemas(schemasDir, artifacts.methodSchemaFiles.keys());

  await Promise.all([
    writeText(join(outputDir, "tool-signatures.ts"), artifacts.signatures),
    writeText(clientTypesOutput, artifacts.clientTypes),
    writeJson(join(outputDir, "tool-manifest.json"), artifacts.manifest),
    writeJson(join(outputDir, "tool-schemas.json"), artifacts.schemas),
    writeText(referenceOutput, artifacts.referenceMarkdown),
    ...signatureFileWrites,
  ]);

  console.log(
    JSON.stringify(
      {
        command: generateSdkCommandName,
        clientTypesOutput,
        endpoint,
        openapiOperationCount: openApiIndex.operationCount,
        openapiUrl,
        outputDir,
        observedOutputSchemaCount: Object.keys(observedOutputSchemas).length,
        profile,
        referenceOutput,
        toolCount: tools.length,
      },
      null,
      2,
    ),
  );
};

const main = async (): Promise<void> => {
  const program = new Command()
    .name("nonce generate-sdk")
    .description(
      "Generate TypeScript interfaces and SDK method signatures from Nonce method definitions",
    )
    .option(
      "--client-types-output <path>",
      "generated declaration file for scripts/client.mjs",
      "skills/nonce/scripts/client.d.mts",
    )
    .option("--endpoint <url>", "Nonce endpoint", DEFAULT_MCP_ENDPOINT)
    .option("--openapi-url <url>", "OpenAPI supplement URL", DEFAULT_OPENAPI_URL)
    .option("--output-dir <path>", "generated runtime output directory", "skills/nonce/assets")
    .option("--profile <name>", "credential profile", DEFAULT_PROFILE)
    .option(
      "--reference-output <path>",
      "generated Markdown signature reference",
      "skills/nonce/references/tool-signatures.md",
    )
    .option(
      "--schemas-dir <path>",
      "generated per-method Markdown schema directory",
      "skills/nonce/assets/schemas",
    )
    .option(
      "--skip-observed-outputs",
      "skip read-only MCP calls used to infer missing output schemas",
    )
    .action(generate);

  program.parse(getCliArgv());
};

if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}
