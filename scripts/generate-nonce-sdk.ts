import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { Command } from "commander";

import { DEFAULT_MCP_ENDPOINT, DEFAULT_PROFILE } from "../nonce/assets/runtime/src/constants.js";
import { createOAuthProvider } from "../nonce/assets/runtime/src/oauth-provider.js";
import { normalizeProfile } from "../nonce/assets/runtime/src/profile.js";
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
  endpoint?: string;
  openapiUrl?: string;
  outputDir?: string;
  profile?: string;
  referenceOutput?: string;
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

const shouldObserveOutputSchema = (tool: Tool, openApiIndex: OpenApiIndex): boolean => {
  if (tool.name !== "ListWorkspaces") return false;
  if (tool.annotations?.readOnlyHint !== true) return false;
  if (hasUsefulOutputSchema(tool.outputSchema)) return false;
  return !openApiIndex.operations.has(tool.name);
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
    openBrowser: false,
    profile: normalizeProfile(options.profile),
  });
  const tokens = await provider.tokens();
  if (!tokens?.access_token && !tokens?.refresh_token) {
    throw new Error("Not authenticated. Run `vp run nonce:auth -- login` first.");
  }

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

const generate = async (options: GenerateSdkOptions): Promise<void> => {
  const endpoint = options.endpoint ?? DEFAULT_MCP_ENDPOINT;
  const profile = normalizeProfile(options.profile ?? DEFAULT_PROFILE);
  const outputDir = options.outputDir ?? "nonce/assets/runtime/src/generated";
  const openapiUrl = options.openapiUrl ?? DEFAULT_OPENAPI_URL;
  const referenceOutput = options.referenceOutput ?? "nonce/references/tool-signatures.md";

  const openApiDocument = await fetchOpenApiDocument(openapiUrl);
  const openApiIndex = buildOpenApiIndex(openApiDocument);
  const { observedOutputSchemas, server, tools } = await inspectMcp({
    endpoint,
    openApiIndex,
    profile,
    skipObservedOutputs: options.skipObservedOutputs,
  });
  const artifacts = generateArtifacts(
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

  await Promise.all([
    writeText(join(outputDir, "tool-signatures.ts"), artifacts.signatures),
    writeJson(join(outputDir, "tool-manifest.json"), artifacts.manifest),
    writeJson(join(outputDir, "tool-schemas.json"), artifacts.schemas),
    writeText(referenceOutput, artifacts.referenceMarkdown),
  ]);

  console.log(
    JSON.stringify(
      {
        command: generateSdkCommandName,
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
    .description("Generate TypeScript interfaces and SDK method signatures from Nonce MCP tools")
    .option("--endpoint <url>", "Nonce MCP endpoint", DEFAULT_MCP_ENDPOINT)
    .option("--openapi-url <url>", "OpenAPI supplement URL", DEFAULT_OPENAPI_URL)
    .option(
      "--output-dir <path>",
      "generated runtime output directory",
      "nonce/assets/runtime/src/generated",
    )
    .option("--profile <name>", "credential profile", DEFAULT_PROFILE)
    .option(
      "--reference-output <path>",
      "generated Markdown signature reference",
      "nonce/references/tool-signatures.md",
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
