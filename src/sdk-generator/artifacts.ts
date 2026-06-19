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

const renderSignatures = async (tools: GeneratedTool[]): Promise<string> => {
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

const renderTypeScriptBlock = (source: string): string[] => ["```ts", source.trimEnd(), "```"];

const renderMethodSignatureFile = async (tool: GeneratedTool): Promise<string> => {
  const [inputDecl, outputDecl] = await Promise.all([
    schemaToTypeScriptDeclaration(`${tool.typeBase}Input`, tool.inputSchema),
    schemaToTypeScriptDeclaration(`${tool.typeBase}Output`, tool.outputSchema),
  ]);
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
    "This file is a compact index. Before writing JavaScript task code, read the method's schema file under `assets/schemas/` for the full `<MethodType>Input` / `<MethodType>Output` interfaces.",
    "",
    "Do not call schema/reference endpoints for business operations. Runtime calls must go through the local SDK.",
    "",
    "Task files can live under `<installed skill root>/.nonce-skill/tasks/` when the runtime check reports `taskDirWritable: true`, or under `recommendedTaskDir` / another writable directory when the installed skill root is read-only.",
    "",
    "Import the runtime SDK from the runner-provided `NONCE_SKILL_RUNTIME_URL` so task files do not depend on their filesystem location. Runner task code should receive profile and endpoint selection from runner flags rather than hardcoding them.",
    "",
    "```js",
    "const { createNonceClient } = await import(process.env.NONCE_SKILL_RUNTIME_URL);",
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
    signatures: await renderSignatures(tools),
    tools,
  };
};
