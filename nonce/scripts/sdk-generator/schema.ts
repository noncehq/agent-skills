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

const sanitizeComment = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const text = value.replaceAll("*/", "* /").trim();
  return text.length > 0 ? text : undefined;
};

const renderComment = (description: unknown, indent = ""): string => {
  const text = sanitizeComment(description);
  if (!text) return "";
  const lines = text.split(/\r?\n/).map((line) => `${indent} * ${line.trim()}`);
  return `${indent}/**\n${lines.join("\n")}\n${indent} */\n`;
};

const isIdentifier = (value: string): boolean => /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(value);

const propertyKey = (value: string): string =>
  isIdentifier(value) ? value : JSON.stringify(value);

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

const literalType = (value: unknown): string => {
  if (value === null) return "null";
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number" || typeof value === "boolean") return JSON.stringify(value);
  return "unknown";
};

const union = (types: string[]): string => {
  let flattened = unique(types.filter(Boolean));
  if (flattened.length === 0) return "unknown";
  if (flattened.includes("unknown")) return "unknown";
  if (flattened.includes("string")) {
    flattened = flattened.filter((type) => !(type.startsWith('"') && type.endsWith('"')));
  }
  if (flattened.includes("number")) {
    flattened = flattened.filter((type) => !/^-?\d+(\.\d+)?$/.test(type));
  }
  return flattened.length === 1 ? (flattened[0] ?? "unknown") : flattened.join(" | ");
};

const parenthesizeUnion = (type: string): string => (type.includes(" | ") ? `(${type})` : type);

const objectType = (schema: JsonSchema, indentLevel: number): string => {
  const properties = asSchema(schema.properties);
  if (properties && Object.keys(properties).length > 0) {
    const required = new Set(
      Array.isArray(schema.required)
        ? schema.required.filter((value) => typeof value === "string")
        : [],
    );
    const indent = "  ".repeat(indentLevel);
    const childIndent = "  ".repeat(indentLevel + 1);
    const lines = ["{"];
    for (const [name, rawProperty] of Object.entries(properties)) {
      const property = asSchema(rawProperty);
      const type = property ? schemaToType(property, indentLevel + 1) : "unknown";
      lines.push(
        `${renderComment(property?.description, childIndent)}${childIndent}${propertyKey(name)}${required.has(name) ? "" : "?"}: ${type}`,
      );
    }
    const additional = schema.additionalProperties;
    if (isRecord(additional)) {
      lines.push(`${childIndent}[key: string]: ${schemaToType(additional, indentLevel + 1)}`);
    } else if (additional === true) {
      lines.push(`${childIndent}[key: string]: unknown`);
    }
    lines.push(`${indent}}`);
    return lines.join("\n");
  }

  const additional = schema.additionalProperties;
  if (additional === false) return "Record<string, never>";
  if (isRecord(additional)) return `Record<string, ${schemaToType(additional, indentLevel)}>`;
  return "Record<string, unknown>";
};

export const schemaToType = (schema: JsonSchema | undefined, indentLevel = 0): string => {
  if (!schema) return "unknown";
  if (schema.const !== undefined) return literalType(schema.const);
  if (Array.isArray(schema.enum)) return union(schema.enum.map(literalType));

  const combinator = Array.isArray(schema.oneOf)
    ? schema.oneOf
    : Array.isArray(schema.anyOf)
      ? schema.anyOf
      : undefined;
  if (combinator)
    return union(asSchemaArray(combinator).map((item) => schemaToType(item, indentLevel)));

  if (Array.isArray(schema.allOf)) {
    const parts = asSchemaArray(schema.allOf).map((item) =>
      parenthesizeUnion(schemaToType(item, indentLevel)),
    );
    return parts.length > 0 ? parts.join(" & ") : "unknown";
  }

  if (Array.isArray(schema.type)) {
    return union(
      schema.type.map((type) =>
        schemaToType(
          {
            ...schema,
            type,
          },
          indentLevel,
        ),
      ),
    );
  }

  if (schema.type === "string") return "string";
  if (schema.type === "integer" || schema.type === "number") return "number";
  if (schema.type === "boolean") return "boolean";
  if (schema.type === "null") return "null";
  if (schema.type === "array") {
    const itemType = schemaToType(asSchema(schema.items), indentLevel);
    return `${parenthesizeUnion(itemType)}[]`;
  }
  if (
    schema.type === "object" ||
    isRecord(schema.properties) ||
    schema.additionalProperties !== undefined
  ) {
    return objectType(schema, indentLevel);
  }

  return "unknown";
};

export const schemaToTypeScriptDeclaration = (
  name: string,
  schema: JsonSchema | undefined,
): TypeScriptTypeResult => {
  if (!schema) {
    return {
      declaration: `export type ${name} = unknown\n`,
      typeName: name,
    };
  }

  const description = renderComment(schema.description);
  const properties = asSchema(schema.properties);
  if (
    (schema.type === "object" || properties) &&
    properties &&
    Object.keys(properties).length > 0
  ) {
    const required = new Set(
      Array.isArray(schema.required)
        ? schema.required.filter((value) => typeof value === "string")
        : [],
    );
    const lines = [`${description}export interface ${name} {`];
    for (const [propertyName, rawProperty] of Object.entries(properties)) {
      const property = asSchema(rawProperty);
      const type = property ? schemaToType(property, 1) : "unknown";
      lines.push(
        `${renderComment(property?.description, "  ")}  ${propertyKey(propertyName)}${required.has(propertyName) ? "" : "?"}: ${type}`,
      );
    }
    const additional = schema.additionalProperties;
    if (isRecord(additional)) {
      lines.push(`  [key: string]: ${schemaToType(additional, 1)}`);
    } else if (additional === true) {
      lines.push("  [key: string]: unknown");
    }
    lines.push("}\n");
    return { declaration: lines.join("\n"), typeName: name };
  }

  return {
    declaration: `${description}export type ${name} = ${schemaToType(schema)}\n`,
    typeName: name,
  };
};
