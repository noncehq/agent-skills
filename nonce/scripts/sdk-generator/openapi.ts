import type { JsonSchema } from "./schema.js";

export const DEFAULT_OPENAPI_URL = "https://docs.nonce.app/api-reference/openapi.json";

interface OpenApiParameter {
  description?: string;
  in?: string;
  name?: string;
  required?: boolean;
  schema?: unknown;
}

interface OpenApiRequestBody {
  content?: Record<string, { schema?: unknown }>;
  required?: boolean;
}

interface OpenApiResponse {
  content?: Record<string, { schema?: unknown }>;
}

interface OpenApiOperation {
  description?: string;
  operationId?: string;
  parameters?: OpenApiParameter[];
  requestBody?: OpenApiRequestBody;
  responses?: Record<string, OpenApiResponse>;
  summary?: string;
}

export interface OpenApiDocument {
  components?: {
    schemas?: Record<string, unknown>;
  };
  openapi?: string;
  paths?: Record<string, Record<string, OpenApiOperation>>;
}

export interface OpenApiOperationInfo {
  description?: string;
  inputSchema?: JsonSchema;
  method: string;
  operationId: string;
  outputSchema?: JsonSchema;
  path: string;
  summary?: string;
}

export interface OpenApiIndex {
  operationCount: number;
  operations: Map<string, OpenApiOperationInfo>;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asSchema = (value: unknown): JsonSchema | undefined => (isRecord(value) ? value : undefined);

const decodeJsonPointerPart = (value: string): string =>
  value.replaceAll("~1", "/").replaceAll("~0", "~");

const getJsonPointer = (document: unknown, pointer: string): unknown => {
  const parts = pointer.replace(/^#\//, "").split("/").map(decodeJsonPointerPart);
  let current = document;
  for (const part of parts) {
    if (!isRecord(current)) return undefined;
    current = current[part];
  }
  return current;
};

export const resolveOpenApiRefs = (
  value: unknown,
  document: OpenApiDocument,
  seen = new Set<string>(),
): unknown => {
  if (Array.isArray(value)) return value.map((item) => resolveOpenApiRefs(item, document, seen));
  if (!isRecord(value)) return value;

  const ref = typeof value.$ref === "string" ? value.$ref : undefined;
  if (ref) {
    if (!ref.startsWith("#/")) return value;
    if (seen.has(ref)) return {};
    const resolved = resolveOpenApiRefs(
      getJsonPointer(document, ref),
      document,
      new Set([...seen, ref]),
    );
    if (!isRecord(resolved)) return resolved;
    const siblings = Object.fromEntries(Object.entries(value).filter(([key]) => key !== "$ref"));
    const resolvedSiblings = resolveOpenApiRefs(siblings, document, seen);
    return {
      ...resolved,
      ...(isRecord(resolvedSiblings) ? resolvedSiblings : {}),
    };
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, nested]) => [key, resolveOpenApiRefs(nested, document, seen)]),
  );
};

const jsonContentSchema = (
  content: Record<string, { schema?: unknown }> | undefined,
  document: OpenApiDocument,
): JsonSchema | undefined => {
  const schema = content?.["application/json"]?.schema ?? content?.["application/*+json"]?.schema;
  return asSchema(resolveOpenApiRefs(schema, document));
};

const responseSchema = (
  responses: Record<string, OpenApiResponse> | undefined,
  document: OpenApiDocument,
): JsonSchema | undefined => {
  if (!responses) return undefined;
  const response =
    responses["200"] ??
    responses["201"] ??
    responses["202"] ??
    responses.default ??
    Object.entries(responses)
      .filter(([code]) => /^2\d\d$/.test(code))
      .map(([, value]) => value)[0];
  return jsonContentSchema(response?.content, document);
};

const operationInputSchema = (
  operation: OpenApiOperation,
  document: OpenApiDocument,
): JsonSchema | undefined => {
  const properties: Record<string, unknown> = {};
  const required: string[] = [];

  for (const parameter of operation.parameters ?? []) {
    if (!parameter.name || !["path", "query"].includes(parameter.in ?? "")) continue;
    const schema = asSchema(resolveOpenApiRefs(parameter.schema ?? {}, document)) ?? {};
    properties[parameter.name] = {
      ...schema,
      ...(parameter.description && schema.description === undefined
        ? { description: parameter.description }
        : {}),
    };
    if (parameter.required || parameter.in === "path") required.push(parameter.name);
  }

  const bodySchema = jsonContentSchema(operation.requestBody?.content, document);
  if (bodySchema?.type === "object" && isRecord(bodySchema.properties)) {
    Object.assign(properties, bodySchema.properties);
    if (Array.isArray(bodySchema.required)) {
      required.push(
        ...bodySchema.required.filter((value): value is string => typeof value === "string"),
      );
    }
  } else if (bodySchema) {
    properties.body = bodySchema;
    if (operation.requestBody?.required) required.push("body");
  }

  if (Object.keys(properties).length === 0) return undefined;
  return {
    type: "object",
    properties,
    required: [...new Set(required)],
  };
};

export const buildOpenApiIndex = (document: OpenApiDocument): OpenApiIndex => {
  const operations = new Map<string, OpenApiOperationInfo>();
  for (const [path, pathItem] of Object.entries(document.paths ?? {})) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (!operation.operationId) continue;
      operations.set(operation.operationId, {
        description: operation.description,
        inputSchema: operationInputSchema(operation, document),
        method: method.toUpperCase(),
        operationId: operation.operationId,
        outputSchema: responseSchema(operation.responses, document),
        path,
        summary: operation.summary,
      });
    }
  }

  return {
    operationCount: operations.size,
    operations,
  };
};

export const fetchOpenApiDocument = async (url: string): Promise<OpenApiDocument> => {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return (await response.json()) as OpenApiDocument;
    } catch (error) {
      lastError = error;
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 1_000));
      }
    }
  }
  throw new Error(
    `Failed to fetch OpenAPI document from ${url}: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
  );
};
