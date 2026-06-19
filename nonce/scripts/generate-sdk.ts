import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { Command } from "commander";

import { DEFAULT_MCP_ENDPOINT, DEFAULT_PROFILE } from "../assets/runtime/src/constants.js";
import { createOAuthProvider } from "../assets/runtime/src/oauth-provider.js";
import { normalizeProfile } from "../assets/runtime/src/profile.js";
import { getCliArgv } from "./argv.js";
import { generateArtifacts } from "./sdk-generator/artifacts.js";
import {
  buildOpenApiIndex,
  DEFAULT_OPENAPI_URL,
  fetchOpenApiDocument,
} from "./sdk-generator/openapi.js";

export const generateSdkCommandName = "nonce generate-sdk";

interface GenerateSdkOptions {
  endpoint?: string;
  fileCredentials?: boolean;
  openapiUrl?: string;
  outputDir?: string;
  profile?: string;
  referenceOutput?: string;
}

const listMcpTools = async (
  options: Required<Pick<GenerateSdkOptions, "endpoint" | "profile">> &
    Pick<GenerateSdkOptions, "fileCredentials">,
): Promise<{ server: unknown; tools: Tool[] }> => {
  const provider = createOAuthProvider({
    endpoint: options.endpoint,
    openBrowser: false,
    preferFileCredentials: options.fileCredentials,
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
    return {
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

  const [{ server, tools }, openApiDocument] = await Promise.all([
    listMcpTools({
      endpoint,
      fileCredentials: options.fileCredentials,
      profile,
    }),
    fetchOpenApiDocument(openapiUrl),
  ]);
  const openApiIndex = buildOpenApiIndex(openApiDocument);
  const artifacts = generateArtifacts(
    {
      mcpEndpoint: endpoint,
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
    .option("--file-credentials", "read OAuth credentials from the local file fallback")
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
    .action(generate);

  program.parse(getCliArgv());
};

if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}
