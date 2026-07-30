import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

import { Ajv, type AnySchema, type ErrorObject } from "ajv";
import * as ajvFormats from "ajv-formats";
import type { FormatsPlugin } from "ajv-formats";

import {
  createNonceClient,
  type DestructiveCallOptions,
  type NonceClient,
  type ReadonlyCallOptions,
} from "../runtime/nonce-client.js";
import { DEFAULT_MCP_ENDPOINT, DEFAULT_PROFILE } from "../runtime/constants.js";
import { normalizeProfile } from "../runtime/profile.js";
import { getCliArgv } from "./argv.js";
import { parseTimeoutMs } from "./cli-options.js";

export const nonceCliCommandName = "nonce";

export interface CliToolDefinition {
  destructive: boolean;
  inputSchema: AnySchema;
  methodName: string;
  name: string;
  readOnly: boolean;
}

export interface ToolCallApproval {
  allowDestructive?: boolean;
  confirmation?: string;
}

interface CliCallOptions extends ToolCallApproval {
  input?: string;
  inputFile?: string;
  output?: string;
  profile?: string;
  timeoutMs?: string;
}

interface ManifestTool {
  destructive: boolean;
  methodName: string;
  name: string;
  readOnly: boolean;
}

interface ToolSchemaEntry {
  input?: unknown;
}

type CallableNonceClient = NonceClient &
  Record<
    string,
    (
      input: Record<string, unknown>,
      options: ReadonlyCallOptions | DestructiveCallOptions,
    ) => Promise<unknown>
  >;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isManifestTool = (value: unknown): value is ManifestTool =>
  isRecord(value) &&
  typeof value.destructive === "boolean" &&
  typeof value.methodName === "string" &&
  typeof value.name === "string" &&
  typeof value.readOnly === "boolean";

const readJson = async (url: URL): Promise<unknown> => JSON.parse(await readFile(url, "utf8"));

export const loadToolCatalog = async (): Promise<CliToolDefinition[]> => {
  const manifestUrl = new URL("../assets/tool-manifest.json", import.meta.url);
  const schemasUrl = new URL("../assets/tool-schemas.json", import.meta.url);
  const [manifestValue, schemasValue] = await Promise.all([
    readJson(manifestUrl),
    readJson(schemasUrl),
  ]);
  const manifestTools =
    isRecord(manifestValue) && Array.isArray(manifestValue.tools)
      ? manifestValue.tools.filter(isManifestTool)
      : [];
  const schemaTools =
    isRecord(schemasValue) && isRecord(schemasValue.tools) ? schemasValue.tools : {};

  if (manifestTools.length === 0) {
    throw new Error(`Generated Nonce tool manifest is missing or empty: ${manifestUrl.toString()}`);
  }

  return manifestTools.map((tool) => {
    const schemaEntry = schemaTools[tool.name] as ToolSchemaEntry | undefined;
    if (!schemaEntry || !isRecord(schemaEntry.input)) {
      throw new Error(`Generated input schema is missing for ${tool.name}`);
    }
    return {
      destructive: tool.destructive,
      inputSchema: schemaEntry.input,
      methodName: tool.methodName,
      name: tool.name,
      readOnly: tool.readOnly,
    };
  });
};

export const resolveTool = (
  tools: readonly CliToolDefinition[],
  identifier: string,
): CliToolDefinition => {
  const tool = tools.find(
    (candidate) => candidate.methodName === identifier || candidate.name === identifier,
  );
  if (!tool) {
    throw new Error(
      `Unknown Nonce method "${identifier}". Run the bundled \`nonce.mjs tools\` command to list available methods.`,
    );
  }
  return tool;
};

const formatValidationErrors = (errors: ErrorObject[] | null | undefined): string =>
  (errors ?? [])
    .map((error) => `${error.instancePath || "/"} ${error.message ?? "is invalid"}`)
    .join("; ");

export const validateToolInput = (
  tool: CliToolDefinition,
  input: Record<string, unknown>,
): void => {
  const ajv = new Ajv({ allErrors: true, strict: false });
  const addFormats = ajvFormats.default as unknown as FormatsPlugin;
  addFormats(ajv);
  const validate = ajv.compile(tool.inputSchema);
  if (!validate(input)) {
    throw new Error(
      `Invalid input for ${tool.methodName}: ${formatValidationErrors(validate.errors)}`,
    );
  }
};

export const assertToolCallAllowed = (
  tool: CliToolDefinition,
  approval: ToolCallApproval,
): void => {
  if (!tool.destructive) return;
  if (approval.allowDestructive !== true) {
    throw new Error(
      `${tool.methodName} is destructive. Re-run with --allow-destructive only after explicit user confirmation.`,
    );
  }
  if (!approval.confirmation?.trim()) {
    throw new Error(
      `${tool.methodName} is destructive. Pass --confirmation with the user's confirmed target and effect.`,
    );
  }
};

const parseInputObject = (value: string, source: string): Record<string, unknown> => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch (error) {
    throw new Error(`${source} must contain valid JSON`, { cause: error });
  }
  if (!isRecord(parsed)) {
    throw new Error(`${source} must contain a JSON object`);
  }
  return parsed;
};

const loadCallInput = async (options: Pick<CliCallOptions, "input" | "inputFile">) => {
  if (options.input !== undefined && options.inputFile !== undefined) {
    throw new Error("Pass only one of --input or --input-file");
  }
  if (options.inputFile !== undefined) {
    return parseInputObject(await readFile(resolve(options.inputFile), "utf8"), "--input-file");
  }
  return parseInputObject(options.input ?? "{}", "--input");
};

export const assertOutputOutsideSkillRoot = (outputPath: string, skillRoot: string): void => {
  const relativePath = relative(resolve(skillRoot), resolve(outputPath));
  if (relativePath === "" || (!relativePath.startsWith("..") && !isAbsolute(relativePath))) {
    throw new Error(
      "Nonce output files must be stored outside the installed skill directory so updates cannot overwrite them.",
    );
  }
};

const serialize = (value: unknown, pretty: boolean): string =>
  `${JSON.stringify(value ?? null, null, pretty ? 2 : undefined)}\n`;

const writeResult = async (value: unknown, output: string | undefined): Promise<void> => {
  if (!output) {
    process.stdout.write(serialize(value, false));
    return;
  }

  const outputPath = resolve(output);
  const installedSkillRoot = dirname(dirname(fileURLToPath(import.meta.url)));
  assertOutputOutsideSkillRoot(outputPath, installedSkillRoot);
  await mkdir(dirname(outputPath), { mode: 0o700, recursive: true });
  await writeFile(outputPath, serialize(value, true), { mode: 0o600 });
  process.stdout.write(`${JSON.stringify({ output: outputPath })}\n`);
};

const validateOutputOption = (output: string | undefined): void => {
  if (!output) return;
  const installedSkillRoot = dirname(dirname(fileURLToPath(import.meta.url)));
  assertOutputOutsideSkillRoot(resolve(output), installedSkillRoot);
};

const listTools = async (): Promise<void> => {
  const tools = await loadToolCatalog();
  await writeResult(
    tools.map(({ destructive, methodName, name, readOnly }) => ({
      destructive,
      methodName,
      name,
      readOnly,
    })),
    undefined,
  );
};

const describeTool = async (identifier: string): Promise<void> => {
  const tool = resolveTool(await loadToolCatalog(), identifier);
  await writeResult(tool, undefined);
};

const callTool = async (identifier: string, options: CliCallOptions): Promise<void> => {
  const tool = resolveTool(await loadToolCatalog(), identifier);
  const input = await loadCallInput(options);
  validateToolInput(tool, input);
  assertToolCallAllowed(tool, options);
  validateOutputOption(options.output);
  const timeoutMs = parseTimeoutMs(options.timeoutMs, "--timeout-ms", 60_000);
  const client = (await createNonceClient({
    allowDestructive: options.allowDestructive,
    endpoint: DEFAULT_MCP_ENDPOINT,
    name: "nonce-skill-cli",
    profile: normalizeProfile(options.profile ?? DEFAULT_PROFILE),
  })) as CallableNonceClient;
  const method = client[tool.methodName];
  if (typeof method !== "function") {
    await client.close();
    throw new Error(`Generated Nonce client method is unavailable: ${tool.methodName}`);
  }

  try {
    const callOptions: ReadonlyCallOptions | DestructiveCallOptions = tool.destructive
      ? {
          confirmDestructive: true,
          confirmation: options.confirmation?.trim() ?? "",
          timeoutMs,
        }
      : { timeoutMs };
    await writeResult(await method(input, callOptions), options.output);
  } finally {
    await client.close();
  }
};

const printHelp = (): void => {
  console.log(`Nonce MCP CLI

Usage:
  nonce.mjs tools
  nonce.mjs describe <method>
  nonce.mjs call <method> [--input <json> | --input-file <path>] [--output <path>]
    [--profile <name>] [--timeout-ms <ms>]
    [--allow-destructive --confirmation <text>]`);
};

const main = async (): Promise<void> => {
  const [command, ...args] = getCliArgv().slice(2);
  if (!command || command === "--help" || command === "-h" || command === "help") {
    printHelp();
    return;
  }

  if (command === "tools") {
    const { positionals } = parseArgs({ allowPositionals: true, args, strict: true });
    if (positionals.length > 0) throw new Error("tools does not accept positional arguments");
    await listTools();
    return;
  }

  if (command === "describe") {
    const { positionals } = parseArgs({ allowPositionals: true, args, strict: true });
    if (positionals.length !== 1) throw new Error("describe expects exactly one method");
    await describeTool(positionals[0] ?? "");
    return;
  }

  if (command === "call") {
    const { positionals, values } = parseArgs({
      allowPositionals: true,
      args,
      options: {
        "allow-destructive": { default: false, type: "boolean" },
        confirmation: { type: "string" },
        input: { type: "string" },
        "input-file": { type: "string" },
        output: { type: "string" },
        profile: { default: DEFAULT_PROFILE, type: "string" },
        "timeout-ms": { default: "60000", type: "string" },
      },
      strict: true,
    });
    if (positionals.length !== 1) throw new Error("call expects exactly one method");
    await callTool(positionals[0] ?? "", {
      allowDestructive: values["allow-destructive"],
      confirmation: values.confirmation,
      input: values.input,
      inputFile: values["input-file"],
      output: values.output,
      profile: values.profile,
      timeoutMs: values["timeout-ms"],
    });
    return;
  }

  throw new Error(`Unknown Nonce command: ${command}`);
};

if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}
