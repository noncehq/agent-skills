import {
  compile as compileJsonSchema,
  type JSONSchema as TypeScriptJsonSchema,
  type Options as JsonSchemaToTypeScriptOptions,
} from "json-schema-to-typescript";

export type JsonSchema = Record<string, unknown>;

export interface SchemaMergeResult {
  schema: JsonSchema;
  supplemented: boolean;
}

export interface TypeScriptTypeResult {
  declaration: string;
  typeName: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asSchema = (value: unknown): JsonSchema | undefined => (isRecord(value) ? value : undefined);

const asSchemaArray = (value: unknown): JsonSchema[] =>
  Array.isArray(value) ? value.filter(isRecord) : [];

const unique = <T>(values: T[]): T[] => [...new Set(values)];

export const hasUsefulSchema = (schema: JsonSchema | undefined): schema is JsonSchema => {
  if (!schema) return false;
  if (schema.const !== undefined || Array.isArray(schema.enum)) return true;
  if (Array.isArray(schema.anyOf) || Array.isArray(schema.oneOf) || Array.isArray(schema.allOf)) {
    return true;
  }
  if (isRecord(schema.properties) && Object.keys(schema.properties).length > 0) return true;
  if (schema.additionalProperties !== undefined) return true;
  return schema.type !== undefined;
};

export const hasUsefulOutputSchema = (schema: JsonSchema | undefined): schema is JsonSchema => {
  if (!schema) return false;
  if (isRecord(schema.properties) && Object.keys(schema.properties).length > 0) return true;
  if (Array.isArray(schema.anyOf) || Array.isArray(schema.oneOf) || Array.isArray(schema.allOf)) {
    return true;
  }
  return schema.const !== undefined || Array.isArray(schema.enum);
};

const copyMissingMetadata = (
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): boolean => {
  let supplemented = false;
  for (const key of [
    "description",
    "title",
    "default",
    "examples",
    "format",
    "minimum",
    "maximum",
  ]) {
    if (target[key] === undefined && source[key] !== undefined) {
      target[key] = source[key];
      supplemented = true;
    }
  }
  return supplemented;
};

export const mergeSchemaMetadata = (
  primary: JsonSchema,
  supplemental: JsonSchema | undefined,
): SchemaMergeResult => {
  const next = structuredClone(primary) as JsonSchema;
  if (!supplemental) return { schema: next, supplemented: false };

  let supplemented = copyMissingMetadata(next, supplemental);

  const nextProperties = asSchema(next.properties);
  const supplementalProperties = asSchema(supplemental.properties);
  if (nextProperties && supplementalProperties) {
    for (const [name, value] of Object.entries(nextProperties)) {
      const property = asSchema(value);
      const supplementalProperty = asSchema(supplementalProperties[name]);
      if (!property || !supplementalProperty) continue;
      const nested = mergeSchemaMetadata(property, supplementalProperty);
      nextProperties[name] = nested.schema;
      supplemented = supplemented || nested.supplemented;
    }
  }

  const nextItems = asSchema(next.items);
  const supplementalItems = asSchema(supplemental.items);
  if (nextItems && supplementalItems) {
    const nested = mergeSchemaMetadata(nextItems, supplementalItems);
    next.items = nested.schema;
    supplemented = supplemented || nested.supplemented;
  }

  for (const keyword of ["anyOf", "oneOf", "allOf"]) {
    const primaryItems = asSchemaArray(next[keyword]);
    const supplementalItemsForKeyword = asSchemaArray(supplemental[keyword]);
    if (primaryItems.length === 0 || supplementalItemsForKeyword.length === 0) continue;
    const merged = primaryItems.map((item, index) => {
      const nested = mergeSchemaMetadata(item, supplementalItemsForKeyword[index]);
      supplemented = supplemented || nested.supplemented;
      return nested.schema;
    });
    next[keyword] = merged;
  }

  return { schema: next, supplemented };
};

const schemaFingerprint = (schema: JsonSchema): string => JSON.stringify(schema);

const mergeInferredObjectSchemas = (schemas: JsonSchema[]): JsonSchema => {
  const propertySchemas = new Map<string, JsonSchema[]>();
  let required = new Set<string>(
    schemas.length > 0 && isRecord(schemas[0]?.properties)
      ? Object.keys(schemas[0].properties)
      : [],
  );

  for (const schema of schemas) {
    const properties = asSchema(schema.properties) ?? {};
    const propertyNames = new Set(Object.keys(properties));
    required = new Set([...required].filter((name) => propertyNames.has(name)));
    for (const [name, property] of Object.entries(properties)) {
      const existing = propertySchemas.get(name) ?? [];
      propertySchemas.set(name, [...existing, asSchema(property) ?? {}]);
    }
  }

  return {
    type: "object",
    properties: Object.fromEntries(
      [...propertySchemas.entries()].map(([name, propertySchemaList]) => [
        name,
        mergeInferredSchemas(propertySchemaList),
      ]),
    ),
    required: [...required],
    additionalProperties: false,
  };
};

const mergeInferredSchemas = (schemas: JsonSchema[]): JsonSchema => {
  if (schemas.length === 0) return {};

  const objectSchemas = schemas.filter((schema) => schema.type === "object");
  if (objectSchemas.length === schemas.length) return mergeInferredObjectSchemas(objectSchemas);

  const arraySchemas = schemas.filter((schema) => schema.type === "array");
  if (arraySchemas.length === schemas.length) {
    return {
      type: "array",
      items: mergeInferredSchemas(arraySchemas.map((schema) => asSchema(schema.items) ?? {})),
    };
  }

  const uniqueSchemas = unique(schemas.map(schemaFingerprint)).map(
    (fingerprint) => JSON.parse(fingerprint) as JsonSchema,
  );
  return uniqueSchemas.length === 1 ? (uniqueSchemas[0] ?? {}) : { anyOf: uniqueSchemas };
};

export const inferJsonSchemaFromValue = (value: unknown): JsonSchema => {
  if (value === null) return { type: "null" };
  if (typeof value === "string") return { type: "string" };
  if (typeof value === "number") return { type: Number.isInteger(value) ? "integer" : "number" };
  if (typeof value === "boolean") return { type: "boolean" };
  if (Array.isArray(value)) {
    return {
      type: "array",
      items: mergeInferredSchemas(value.map(inferJsonSchemaFromValue)),
    };
  }
  if (isRecord(value)) {
    return {
      type: "object",
      properties: Object.fromEntries(
        Object.entries(value).map(([name, nested]) => [name, inferJsonSchemaFromValue(nested)]),
      ),
      required: Object.keys(value),
      additionalProperties: false,
    };
  }
  return {};
};

const words = (value: string): string[] =>
  value
    .split(/[^A-Za-z0-9]+/)
    .flatMap((part) => part.match(/[A-Z]+(?![a-z])|[A-Z]?[a-z]+|\d+/g) ?? [])
    .filter(Boolean);

const capitalize = (value: string): string => `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`;

export const methodNameForTool = (toolName: string): string => {
  const parts = words(toolName);
  if (parts.length === 0) return "callTool";
  const first = parts[0] ?? "call";
  const rest = parts.slice(1);
  return `${first.toLowerCase()}${rest.map((part) => capitalize(part.toLowerCase())).join("")}`;
};

export const typeBaseForTool = (toolName: string): string => {
  const parts = words(toolName);
  const base = parts.map((part) => capitalize(part.toLowerCase())).join("");
  return base || "Tool";
};

const typeScriptDeclarationOptions: Partial<JsonSchemaToTypeScriptOptions> = {
  additionalProperties: false,
  bannerComment: "",
  style: {
    printWidth: 120,
    semi: false,
    singleQuote: false,
    trailingComma: "none",
  },
  unknownAny: true,
};

const schemaTitleName = (title: unknown): string | undefined => {
  if (typeof title !== "string") return undefined;
  const name = words(title)
    .map((part) => capitalize(part.toLowerCase()))
    .join("");
  return name || undefined;
};

const schemaForDeclaration = (schema: JsonSchema | undefined): TypeScriptJsonSchema => {
  const compilerSchema = structuredClone(schema ?? { tsType: "unknown" }) as TypeScriptJsonSchema;
  delete compilerSchema.title;
  return compilerSchema;
};

export const schemaToTypeScriptDeclaration = async (
  name: string,
  schema: JsonSchema | undefined,
): Promise<TypeScriptTypeResult> => {
  return {
    declaration: await compileJsonSchema(schemaForDeclaration(schema), name, {
      ...typeScriptDeclarationOptions,
      customName: (nestedSchema) => {
        const nestedName = schemaTitleName(nestedSchema.title);
        return nestedName ? `${name}${nestedName}` : undefined;
      },
    }),
    typeName: name,
  };
};
