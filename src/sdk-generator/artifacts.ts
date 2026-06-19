import type { Tool } from "@modelcontextprotocol/sdk/types.js";

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

const optionsType = (tool: GeneratedTool): string =>
  tool.destructive ? "DestructiveCallOptions" : "ReadonlyCallOptions";

const methodSignature = (tool: GeneratedTool): string => {
  const inputType = `${tool.typeBase}Input`;
  const outputType = `${tool.typeBase}Output`;
  const input = tool.inputOptional ? `input?: ${inputType}` : `input: ${inputType}`;
  const options = tool.destructive
    ? `options: ${optionsType(tool)}`
    : `options?: ${optionsType(tool)}`;
  return `  ${tool.methodName}(${input}, ${options}): Promise<${outputType}>`;
};

const requiredInputSummary = (tool: GeneratedTool): string | undefined => {
  const required = requiredProperties(tool.inputSchema);
  if (required.length === 0) return undefined;
  return `required: ${required.join(", ")}`;
};

const renderSignatures = (tools: GeneratedTool[]): string => {
  const declarations = tools.flatMap((tool) => [
    schemaToTypeScriptDeclaration(`${tool.typeBase}Input`, tool.inputSchema).declaration,
    schemaToTypeScriptDeclaration(`${tool.typeBase}Output`, tool.outputSchema).declaration,
  ]);

  const definitions = tools.map((tool) => ({
    destructive: tool.destructive,
    methodName: tool.methodName,
    name: tool.name,
    readOnly: tool.readOnly,
  }));

  return `${header}
export interface CallOptions {
  signal?: AbortSignal
  timeoutMs?: number
}

export type ReadonlyCallOptions = CallOptions

export interface DestructiveCallOptions extends CallOptions {
  confirmDestructive: true
  confirmation: string
}

${declarations.join("\n")}
export const nonceToolDefinitions = ${JSON.stringify(definitions, null, 2)} as const

export interface NonceClient {
  close(): Promise<void>
${tools.map(methodSignature).join("\n")}
}
`;
};

const methodFileName = (methodName: string): string =>
  `${methodName.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`)}.md`;

const declarationSemicolonLine =
  /^(\s*(?:(?:export\s+)?(?:type|interface)\b|(?:[A-Za-z_$][\w$]*|"(?:[^"\\]|\\.)+"|'(?:[^'\\]|\\.)+'|\[[^\]]+\])\??:|\[key:[^\]]+\]:|[A-Za-z_$][\w$]*\([^)]*\):).+);(\s*)$/;

const normalizeTypeScriptSnippet = (source: string): string =>
  source
    .split("\n")
    .map((line) => line.replace(declarationSemicolonLine, "$1$2"))
    .join("\n");

const renderTypeScriptBlock = (source: string): string[] => [
  "```ts",
  normalizeTypeScriptSnippet(source).trimEnd(),
  "```",
];

const renderMethodSignatureFile = (tool: GeneratedTool): string => {
  const inputDecl = schemaToTypeScriptDeclaration(`${tool.typeBase}Input`, tool.inputSchema);
  const outputDecl = schemaToTypeScriptDeclaration(`${tool.typeBase}Output`, tool.outputSchema);
  const required = requiredProperties(tool.inputSchema);

  const inputType = `${tool.typeBase}Input`;
  const outputType = `${tool.typeBase}Output`;
  const input = tool.inputOptional ? `input?: ${inputType}` : `input: ${inputType}`;
  const options = tool.destructive
    ? `options: DestructiveCallOptions`
    : `options?: ReadonlyCallOptions`;

  const markers = [
    tool.readOnly ? "read-only" : undefined,
    tool.destructive ? "destructive" : undefined,
  ].filter(Boolean);

  const lines = [`# ${tool.methodName}`, "", `${tool.name} — ${markers.join(", ")}`, ""];

  if (required.length > 0) {
    lines.push(`Required: ${required.map((r) => `\`${r}\``).join(", ")}`, "");
  }

  lines.push(
    "## Signature",
    "",
    ...renderTypeScriptBlock(`${tool.methodName}(${input}, ${options}): Promise<${outputType}>`),
    "",
    "## Input",
    "",
    ...renderTypeScriptBlock(inputDecl.declaration.replace(/^export /gm, "")),
    "",
    "## Output",
    "",
    ...renderTypeScriptBlock(outputDecl.declaration.replace(/^export /gm, "")),
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
    "This file is a compact index. Before writing JavaScript task code, read the method's schema file under `assets/schemas/` for the full `<MethodType>Input` / `<MethodType>Output` interfaces.",
    "",
    "Do not call schema/reference endpoints for business operations. Runtime calls must go through the local SDK.",
    "",
    "The example below assumes the task file is `<installed skill root>/.nonce-skill/tasks/query.mjs`. Runner task code should receive profile and endpoint selection from runner flags rather than hardcoding them.",
    "",
    "If a task file is placed elsewhere, adjust the import path to the installed `scripts/skill-runtime.mjs` location using the recorded skill root value.",
    "",
    "```js",
    'import { createNonceClient } from "../../scripts/skill-runtime.mjs";',
    "",
    "const client = await createNonceClient();",
    "try {",
    '  const farms = await client.listFarms({ workspace_id: "..." });',
    "  console.log(JSON.stringify({ farms }));",
    "} finally {",
    "  await client.close();",
    "}",
    "```",
    "",
    "## Shared Types",
    "",
    ...renderTypeScriptBlock(
      [
        "interface CallOptions {",
        "  signal?: AbortSignal",
        "  timeoutMs?: number",
        "}",
        "",
        "type ReadonlyCallOptions = CallOptions",
        "",
        "interface DestructiveCallOptions extends CallOptions {",
        "  confirmDestructive: true",
        "  confirmation: string",
        "}",
      ].join("\n"),
    ),
    "",
    "## Methods",
    "",
  ];

  for (const tool of tools) {
    const input = tool.inputOptional
      ? `input?: ${tool.typeBase}Input`
      : `input: ${tool.typeBase}Input`;
    const options = tool.destructive
      ? `options: DestructiveCallOptions`
      : `options?: ReadonlyCallOptions`;
    const markers = [
      tool.readOnly ? "read-only" : undefined,
      tool.destructive ? "destructive" : undefined,
      requiredInputSummary(tool),
    ].filter(Boolean);
    const fileName = methodFileName(tool.methodName);
    lines.push(
      `- \`${tool.methodName}(${input}, ${options}): Promise<${tool.typeBase}Output>\` — ${tool.name} (${markers.join(", ")}) → [schemas/${fileName}](../assets/schemas/${fileName})`,
    );
  }

  return `${lines.join("\n")}\n`;
};

export const generateArtifacts = (
  options: GenerateArtifactsOptions,
  openApiIndex?: OpenApiIndex,
): GeneratedArtifacts => {
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

  const methodSchemaFiles = new Map<string, string>();
  for (const tool of tools) {
    methodSchemaFiles.set(methodFileName(tool.methodName), renderMethodSignatureFile(tool));
  }

  return {
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
    signatures: renderSignatures(tools),
    tools,
  };
};
