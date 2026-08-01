import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import ts from "typescript";

import type { OpenApiIndex, OpenApiOperationInfo } from "./openapi.js";
import {
  hasUsefulOutputSchema,
  hasUsefulSchema,
  mergeSchemaMetadata,
  methodNameForTool,
  schemaToTypeScriptDeclaration,
  typeBaseForTool,
  type JsonSchema,
} from "./schema.js";

type SchemaSource = "mcp" | "mcp+openapi" | "openapi" | "observed-mcp" | "unknown";
type OpenApiMatch = "exact" | "create-task-batch-family" | "none";

interface TypeScriptDeclaration {
  kind: "interface" | "type";
  name: string;
  text: string;
}

export interface GeneratedTool {
  annotations?: Tool["annotations"];
  description?: string;
  destructive: boolean;
  inputOptional: boolean;
  inputSchema: JsonSchema;
  inputSchemaSource: SchemaSource;
  methodName: string;
  name: string;
  openapi?: {
    match: OpenApiMatch;
    method: string;
    operationId: string;
    path: string;
  };
  outputSchema?: JsonSchema;
  outputSchemaSource: SchemaSource;
  readOnly: boolean;
  typeBase: string;
}

export interface GeneratedArtifacts {
  clientTypes: string;
  manifest: Record<string, unknown>;
  methodSchemaFiles: Map<string, string>;
  referenceMarkdown: string;
  schemas: Record<string, unknown>;
  signatures: string;
  tools: GeneratedTool[];
}

export interface GenerateArtifactsOptions {
  mcpEndpoint: string;
  observedOutputSchemas?: Record<string, JsonSchema>;
  openapiOperationCount?: number;
  openapiUrl?: string;
  server?: unknown;
  tools: Tool[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const jsonSchema = (value: unknown): JsonSchema | undefined =>
  isRecord(value) ? value : undefined;

const requiredProperties = (schema: JsonSchema): string[] =>
  Array.isArray(schema.required)
    ? schema.required.filter((value): value is string => typeof value === "string")
    : [];

const toolInputIsOptional = (schema: JsonSchema): boolean =>
  requiredProperties(schema).length === 0;

const matchOpenApiOperation = (
  toolName: string,
  openApiIndex: OpenApiIndex | undefined,
): { info?: OpenApiOperationInfo; match: OpenApiMatch } => {
  const exact = openApiIndex?.operations.get(toolName);
  if (exact) return { info: exact, match: "exact" };
  if (toolName.startsWith("CreateTaskBatch_")) {
    const createTaskBatch = openApiIndex?.operations.get("CreateTaskBatch");
    if (createTaskBatch) return { info: createTaskBatch, match: "create-task-batch-family" };
  }
  return { match: "none" };
};

const schemaSource = (
  primarySource: "mcp" | "openapi" | "unknown",
  supplemented: boolean,
): SchemaSource => {
  if (primarySource === "mcp" && supplemented) return "mcp+openapi";
  return primarySource;
};

const generatedToolFromMcpTool = (
  tool: Tool,
  openApiIndex: OpenApiIndex | undefined,
  observedOutputSchemas: Record<string, JsonSchema> | undefined,
): GeneratedTool => {
  const openapi = matchOpenApiOperation(tool.name, openApiIndex);
  const rawMcpInput = jsonSchema(tool.inputSchema);
  const rawMcpOutput = jsonSchema(tool.outputSchema);
  const openapiInput = openapi.info?.inputSchema;
  const openapiOutput = openapi.info?.outputSchema;
  const observedOutput = observedOutputSchemas?.[tool.name];

  const inputResult = rawMcpInput
    ? mergeSchemaMetadata(rawMcpInput, openapiInput)
    : openapiInput
      ? { schema: openapiInput, supplemented: false }
      : {
          schema: { type: "object", properties: {}, additionalProperties: false },
          supplemented: false,
        };

  const inputSource =
    rawMcpInput && hasUsefulSchema(rawMcpInput)
      ? schemaSource("mcp", inputResult.supplemented)
      : openapiInput
        ? "openapi"
        : "unknown";

  const outputResult =
    rawMcpOutput && hasUsefulOutputSchema(rawMcpOutput)
      ? mergeSchemaMetadata(rawMcpOutput, openapiOutput)
      : undefined;
  const outputSchema = outputResult?.schema ?? openapiOutput ?? observedOutput;
  const outputSource = outputResult
    ? schemaSource("mcp", outputResult.supplemented)
    : openapiOutput
      ? "openapi"
      : observedOutput
        ? "observed-mcp"
        : "unknown";

  const destructive =
    tool.annotations?.destructiveHint === true || tool.name.startsWith("CreateTaskBatch_");
  const readOnly = tool.annotations?.readOnlyHint === true && !destructive;

  return {
    annotations: tool.annotations,
    description: tool.description,
    destructive,
    inputOptional: toolInputIsOptional(inputResult.schema),
    inputSchema: inputResult.schema,
    inputSchemaSource: inputSource,
    methodName: methodNameForTool(tool.name),
    name: tool.name,
    openapi: openapi.info
      ? {
          match: openapi.match,
          method: openapi.info.method,
          operationId: openapi.info.operationId,
          path: openapi.info.path,
        }
      : undefined,
    outputSchema,
    outputSchemaSource: outputSource,
    readOnly,
    typeBase: typeBaseForTool(tool.name),
  };
};

const header = `/* eslint-disable */
// Generated file. Do not edit by hand.
// Source of truth: checked Nonce method definitions; supplemental schemas only fill missing metadata.
`;

const requiredInputSummary = (tool: GeneratedTool): string | undefined => {
  const required = requiredProperties(tool.inputSchema);
  if (required.length === 0) return undefined;
  return `required: ${required.join(", ")}`;
};

const splitTypeScriptDeclarations = (source: string): TypeScriptDeclaration[] => {
  const sourceFile = ts.createSourceFile(
    "generated-nonce-schema.d.ts",
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const declarations: TypeScriptDeclaration[] = [];

  for (const statement of sourceFile.statements) {
    if (ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement)) {
      declarations.push({
        kind: ts.isInterfaceDeclaration(statement) ? "interface" : "type",
        name: statement.name.text,
        text: statement.getFullText(sourceFile).trim(),
      });
      continue;
    }

    const text = statement.getText(sourceFile).trim();
    if (text.length > 0) {
      throw new Error(`Unsupported generated TypeScript declaration: ${text}`);
    }
  }

  return declarations;
};

const dedupeTypeScriptDeclarations = (sources: string[]): string[] => {
  const declarations: string[] = [];
  const seen = new Map<string, TypeScriptDeclaration>();

  for (const source of sources) {
    for (const declaration of splitTypeScriptDeclarations(source)) {
      const existing = seen.get(declaration.name);
      if (!existing) {
        seen.set(declaration.name, declaration);
        declarations.push(declaration.text);
        continue;
      }

      if (existing.kind === declaration.kind && existing.text === declaration.text) continue;

      throw new Error(`Generated TypeScript declaration name conflict: ${declaration.name}`);
    }
  }

  return declarations;
};

const renderClientInterface = (tools: GeneratedTool[]): string => `export interface NonceClient {
  close(): Promise<void>
${tools
  .map((tool) => {
    const input = tool.inputOptional
      ? tool.destructive
        ? `input: ${tool.typeBase}Input | undefined`
        : `input?: ${tool.typeBase}Input`
      : `input: ${tool.typeBase}Input`;
    const options = tool.destructive
      ? "options: NonceDestructiveCallOptions"
      : "options?: NonceReadonlyCallOptions";
    return `  ${tool.methodName}(${input}, ${options}): Promise<${tool.typeBase}Output>`;
  })
  .join("\n")}
}`;

const renderSharedTypes = (): string => `export interface NonceCallOptions {
  signal?: AbortSignal
  timeoutMs?: number
}

export type NonceReadonlyCallOptions = NonceCallOptions

export interface NonceDestructiveCallOptions extends NonceCallOptions {
  confirmDestructive: true
  confirmation: string
}

export interface NonceClientOptions {
  allowDestructive?: boolean
  profile?: string
}`;

const renderMethodSignatures = (tools: GeneratedTool[]): string =>
  `export interface NonceMethodSignatures {
${tools
  .map(
    (tool) => `  ${tool.methodName}: {
    destructive: ${tool.destructive}
    input: ${tool.typeBase}Input
    output: ${tool.typeBase}Output
  }`,
  )
  .join("\n")}
}`;

const renderTypeArtifacts = async (
  tools: GeneratedTool[],
): Promise<{ clientTypes: string; signatures: string }> => {
  const declarationSources = (
    await Promise.all(
      tools.map(async (tool) => [
        (await schemaToTypeScriptDeclaration(`${tool.typeBase}Input`, tool.inputSchema))
          .declaration,
        (await schemaToTypeScriptDeclaration(`${tool.typeBase}Output`, tool.outputSchema))
          .declaration,
      ]),
    )
  ).flat();
  const declarations = dedupeTypeScriptDeclarations(declarationSources);
  const definitions = tools.map((tool) => ({
    destructive: tool.destructive,
    methodName: tool.methodName,
    name: tool.name,
    readOnly: tool.readOnly,
  }));
  const sharedTypes = renderSharedTypes();
  const clientInterface = renderClientInterface(tools);
  const methodSignatures = renderMethodSignatures(tools);

  return {
    clientTypes: `${header}
// Type reference for project code that imports scripts/client.mjs.

${declarations.join("\n")}
${sharedTypes}

${clientInterface}

export declare function createNonceClient(options?: NonceClientOptions): Promise<NonceClient>

${methodSignatures}
`,
    signatures: `${header}
${declarations.join("\n")}
export const nonceToolDefinitions = ${JSON.stringify(definitions, null, 2)} as const

${sharedTypes}

${clientInterface}

${methodSignatures}
`,
  };
};

const methodFileName = (methodName: string): string =>
  `${methodName.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`)}.md`;

const renderTypeScriptBlock = (source: string): string[] => ["```ts", source.trimEnd(), "```"];

const renderMethodSignatureFile = async (tool: GeneratedTool): Promise<string> => {
  const [inputDecl, outputDecl] = await Promise.all([
    schemaToTypeScriptDeclaration(`${tool.typeBase}Input`, tool.inputSchema),
    schemaToTypeScriptDeclaration(`${tool.typeBase}Output`, tool.outputSchema),
  ]);
  const required = requiredProperties(tool.inputSchema);

  const markers = [
    tool.readOnly ? "read-only" : undefined,
    tool.destructive ? "destructive" : undefined,
  ].filter(Boolean);

  const lines = [`# ${tool.methodName}`, "", `${tool.name} — ${markers.join(", ")}`, ""];

  if (required.length > 0) {
    lines.push(`Required: ${required.map((r) => `\`${r}\``).join(", ")}`, "");
  }

  if (tool.description?.trim()) {
    lines.push("## Purpose", "", tool.description.trim(), "");
  }

  lines.push(
    "## Code",
    "",
    "```js",
    tool.destructive
      ? `const result = await nonce.${tool.methodName}(input, {\n  confirmDestructive: true,\n  confirmation: "<confirmed target and effect>",\n})`
      : `const result = await nonce.${tool.methodName}(input)`,
    "```",
    "",
  );

  lines.push(
    "## CLI",
    "",
    "```bash",
    `"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/nonce.mjs" call ${tool.methodName} --input-file ".nonce/requests/${methodFileName(tool.methodName).replace(/\.md$/, ".json")}"${tool.destructive ? ' --allow-destructive --confirmation "<confirmed target and effect>"' : ""}`,
    "```",
    "",
    "## Input",
    "",
    ...renderTypeScriptBlock(inputDecl.declaration),
    "",
    "## Output",
    "",
    ...renderTypeScriptBlock(outputDecl.declaration),
    "",
  );

  return lines.join("\n");
};

const renderReferenceMarkdown = (
  tools: GeneratedTool[],
  options: GenerateArtifactsOptions,
): string => {
  const lines = [
    "# Tool Signatures",
    "",
    "Generated from checked Nonce method definitions; supplemental schemas only fill missing metadata.",
    "",
    `- Default endpoint: \`${options.mcpEndpoint}\``,
    `- Method count: ${tools.length}`,
    "",
    "This file is a compact index. Before calling a method, read its schema file under `assets/schemas/` for the full `<MethodType>Input` / `<MethodType>Output` interfaces.",
    "",
    "Do not call schema/reference endpoints for business operations. Runtime calls should go through the bundled `scripts/client.mjs` module from project-local code under `.nonce/code/`. Use `scripts/nonce.mjs` only for a one-off call or diagnosis.",
    "",
    "Store agent-authored code and reusable data under the project-owned `.nonce/` directory, never under the installed skill root. Skill updates may replace the entire installed directory.",
    "",
    "The client keeps OAuth credentials internal and fixes the endpoint to `https://mcp.nonce.app/mcp`. Create one client, compose the required methods in the same process, filter or aggregate their results in code, and close the client in the end.",
    "",
    "```js",
    'import { join } from "node:path"',
    'import { pathToFileURL } from "node:url"',
    "",
    "const skillHome = process.argv[2]",
    'if (!skillHome) throw new Error("Pass NONCE_SKILL_HOME as the first script argument")',
    'const clientUrl = pathToFileURL(join(skillHome, "scripts", "client.mjs")).href',
    "const { createNonceClient } = await import(clientUrl)",
    "const nonce = await createNonceClient()",
    "",
    "try {",
    '  const result = await nonce.listFarms({ workspace_id: "..." })',
    "  const rows = result?.data?.data ?? result?.data ?? []",
    "  console.log(JSON.stringify({ farmCount: rows.length }))",
    "} finally {",
    "  await nonce.close()",
    "}",
    "```",
    "",
    "Log only the compact result needed for the next decision. Do not print full MCP responses. Keep large intermediate data inside the process or write it under `.nonce/` when it must persist.",
    "",
    "The fixed CLI remains available for one-off calls:",
    "",
    "```bash",
    '"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/nonce.mjs" call listFarms \\',
    '  --input-file ".nonce/requests/list-farms.json" \\',
    '  --output ".nonce/results/list-farms.json"',
    "```",
    "",
    'For a destructive method, first present the exact target and expected effect and obtain explicit user confirmation. In code, create the client with `allowDestructive: true` and pass `confirmDestructive: true` plus the confirmation to that one method call. In the CLI, add both `--allow-destructive` and `--confirmation "<confirmed target and effect>"`.',
    "",
    "## Shared Types",
    "",
    "The complete generated client declaration is available at `scripts/client.d.mts`. These are the shared options used by every method:",
    "",
    ...renderTypeScriptBlock(
      [
        "interface NonceCallOptions {",
        "  signal?: AbortSignal",
        "  timeoutMs?: number",
        "}",
        "",
        "type NonceReadonlyCallOptions = NonceCallOptions",
        "",
        "interface NonceDestructiveCallOptions extends NonceCallOptions {",
        "  confirmDestructive: true",
        "  confirmation: string",
        "}",
        "",
        "interface NonceClientOptions {",
        "  allowDestructive?: boolean",
        "  profile?: string",
        "}",
      ].join("\n"),
    ),
    "",
    "## Methods",
    "",
  ];

  for (const tool of tools) {
    const markers = [
      tool.readOnly ? "read-only" : undefined,
      tool.destructive ? "destructive" : undefined,
      requiredInputSummary(tool),
    ].filter(Boolean);
    const fileName = methodFileName(tool.methodName);
    lines.push(
      `- \`${tool.methodName}\` — ${tool.name} (${markers.join(", ")}) → [schemas/${fileName}](../assets/schemas/${fileName})`,
    );
  }

  return `${lines.join("\n")}\n`;
};

export const generateArtifacts = async (
  options: GenerateArtifactsOptions,
  openApiIndex?: OpenApiIndex,
): Promise<GeneratedArtifacts> => {
  const tools = options.tools.map((tool) =>
    generatedToolFromMcpTool(tool, openApiIndex, options.observedOutputSchemas),
  );
  const manifestTools = tools.map((tool) => ({
    annotations: tool.annotations,
    description: tool.description,
    destructive: tool.destructive,
    inputSchemaSource: tool.inputSchemaSource,
    methodName: tool.methodName,
    name: tool.name,
    openapi: tool.openapi,
    outputSchemaSource: tool.outputSchemaSource,
    readOnly: tool.readOnly,
    typeBase: tool.typeBase,
  }));

  const methodSchemaFileEntries: Array<[string, string]> = await Promise.all(
    tools.map(async (tool) => [
      methodFileName(tool.methodName),
      await renderMethodSignatureFile(tool),
    ]),
  );
  const methodSchemaFiles = new Map(methodSchemaFileEntries);
  const typeArtifacts = await renderTypeArtifacts(tools);

  return {
    clientTypes: typeArtifacts.clientTypes,
    manifest: {
      mcpEndpoint: options.mcpEndpoint,
      openapiOperationCount: options.openapiOperationCount,
      openapiUrl: options.openapiUrl,
      server: options.server,
      sourcePriority: ["mcp-tools-list", "openapi-supplement", "observed-readonly-mcp-output"],
      toolCount: tools.length,
      tools: manifestTools,
    },
    methodSchemaFiles,
    referenceMarkdown: renderReferenceMarkdown(tools, options),
    schemas: {
      tools: Object.fromEntries(
        tools.map((tool) => [
          tool.name,
          {
            input: tool.inputSchema,
            inputSchemaSource: tool.inputSchemaSource,
            output: tool.outputSchema,
            outputSchemaSource: tool.outputSchemaSource,
          },
        ]),
      ),
    },
    signatures: typeArtifacts.signatures,
    tools,
  };
};
