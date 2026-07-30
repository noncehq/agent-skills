import { describe, expect, it } from "vite-plus/test";

import {
  assertOutputOutsideSkillRoot,
  assertToolCallAllowed,
  resolveTool,
  validateToolInput,
  type CliToolDefinition,
} from "../src/skill-scripts/nonce-cli.js";

const readTool: CliToolDefinition = {
  destructive: false,
  inputSchema: {
    additionalProperties: false,
    properties: {},
    type: "object",
  },
  methodName: "listWorkspaces",
  name: "ListWorkspaces",
  readOnly: true,
};

const writeTool: CliToolDefinition = {
  destructive: true,
  inputSchema: {
    additionalProperties: false,
    properties: {
      workspace_id: { type: "string" },
    },
    required: ["workspace_id"],
    type: "object",
  },
  methodName: "createTaskBatchMinerSystemReboot",
  name: "CreateTaskBatch_MinerSystemReboot",
  readOnly: false,
};

describe("declarative Nonce CLI", () => {
  it("resolves both generated method names and MCP tool names", () => {
    const tools = [readTool, writeTool];

    expect(resolveTool(tools, "listWorkspaces")).toBe(readTool);
    expect(resolveTool(tools, "CreateTaskBatch_MinerSystemReboot")).toBe(writeTool);
    expect(() => resolveTool(tools, "unknown")).toThrow("Unknown Nonce method");
  });

  it("validates input against the selected MCP JSON Schema", () => {
    expect(() => validateToolInput(writeTool, { workspace_id: "workspace-1" })).not.toThrow();
    expect(() => validateToolInput(writeTool, {})).toThrow("workspace_id");
    expect(() =>
      validateToolInput(writeTool, {
        unexpected: true,
        workspace_id: "workspace-1",
      }),
    ).toThrow("additional properties");
  });

  it("allows reads without approval but requires both write approval layers", () => {
    expect(() => assertToolCallAllowed(readTool, {})).not.toThrow();
    expect(() => assertToolCallAllowed(writeTool, {})).toThrow("--allow-destructive");
    expect(() =>
      assertToolCallAllowed(writeTool, {
        allowDestructive: true,
      }),
    ).toThrow("--confirmation");
    expect(() =>
      assertToolCallAllowed(writeTool, {
        allowDestructive: true,
        confirmation: "User confirmed rebooting the selected miners.",
      }),
    ).not.toThrow();
  });

  it("keeps durable output outside the installer-owned skill directory", () => {
    expect(() =>
      assertOutputOutsideSkillRoot(
        "/project/.agents/skills/nonce/result.json",
        "/project/.agents/skills/nonce",
      ),
    ).toThrow("outside the installed skill directory");
    expect(() =>
      assertOutputOutsideSkillRoot(
        "/project/.nonce/results/result.json",
        "/project/.agents/skills/nonce",
      ),
    ).not.toThrow();
  });
});
