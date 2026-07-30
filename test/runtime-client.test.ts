import { describe, expect, it } from "vite-plus/test";

import {
  createNonceClientWithDependencies,
  type NonceClientRuntimeDependencies,
} from "../src/runtime/nonce-client.js";

interface CreateTaskBatchMinerSystemRebootInput {
  farm_id: string;
  miner_ids: string[];
  task_name: string;
  workspace_id: string;
}

interface ToolCallRecord {
  options: unknown;
  request: {
    arguments: Record<string, unknown>;
    name: string;
  };
}

interface RuntimeClientForTest {
  close(): Promise<void>;
  createTaskBatchMinerSystemReboot(
    input: CreateTaskBatchMinerSystemRebootInput,
    options: {
      confirmDestructive: true;
      confirmation: string;
    },
  ): Promise<unknown>;
  listWorkspaces(
    input?: Record<string, unknown>,
    options?: Record<string, unknown>,
  ): Promise<unknown>;
}

const createHarness = (results: Record<string, unknown>[]) => {
  const calls: ToolCallRecord[] = [];
  let closed = false;
  let connectedTransport: unknown;
  let metadata: unknown;
  let providerOptions: unknown;

  const dependencies: NonceClientRuntimeDependencies = {
    createClient: (clientMetadata) => {
      metadata = clientMetadata;
      return {
        callTool: async (request, _resultSchema, options) => {
          calls.push({ options, request });
          const next = results.shift();
          if (!next) throw new Error("Missing fake MCP result");
          return next;
        },
        close: async () => {
          closed = true;
        },
        connect: async (transport) => {
          connectedTransport = transport;
        },
      };
    },
    createProvider: (options) => {
      const providerInput = options ?? {};
      providerOptions = providerInput;
      return { endpoint: providerInput.endpoint } as never;
    },
    createTransport: (endpoint, provider) => ({ endpoint, provider }),
    toolDefinitions: [
      { destructive: false, methodName: "listWorkspaces", name: "ListWorkspaces" },
      {
        destructive: true,
        methodName: "createTaskBatchMinerSystemReboot",
        name: "CreateTaskBatch_MinerSystemReboot",
      },
    ],
  };

  return {
    calls,
    dependencies,
    get closed() {
      return closed;
    },
    get connectedTransport() {
      return connectedTransport;
    },
    get metadata() {
      return metadata;
    },
    get providerOptions() {
      return providerOptions;
    },
  };
};

describe("runtime SDK client", () => {
  it("connects with the requested profile and dispatches typed methods to MCP tools", async () => {
    const harness = createHarness([{ structuredContent: { data: [], success: true } }]);
    const signal = new AbortController().signal;

    const client = (await createNonceClientWithDependencies(
      {
        endpoint: "https://example.test/mcp",
        name: "runtime-test",
        profile: "test-local",
        version: "1.2.3",
      },
      harness.dependencies,
    )) as unknown as RuntimeClientForTest;
    const result = await client.listWorkspaces({ scope: "all" }, { signal, timeoutMs: 1234 });

    expect(result).toEqual({ data: [], success: true });
    expect(harness.metadata).toEqual({ name: "runtime-test", version: "1.2.3" });
    expect(harness.providerOptions).toMatchObject({
      endpoint: "https://example.test/mcp",
      profile: "test-local",
    });
    expect(harness.connectedTransport).toMatchObject({ endpoint: "https://example.test/mcp" });
    expect(harness.calls).toEqual([
      {
        options: { signal, timeout: 1234 },
        request: {
          arguments: { scope: "all" },
          name: "ListWorkspaces",
        },
      },
    ]);

    await client.close();
    expect(harness.closed).toBe(true);
  });

  it("parses structured content, JSON text content, plain text, and MCP errors", async () => {
    const harness = createHarness([
      { content: [{ text: '{"ok":true}', type: "text" }] },
      { content: [{ text: "plain text", type: "text" }] },
      { content: [{ text: "remote failure", type: "text" }], isError: true },
    ]);
    const client = await createNonceClientWithDependencies({}, harness.dependencies);
    const readOnlyClient = client as unknown as {
      listWorkspaces(input?: Record<string, unknown>): Promise<unknown>;
    };

    await expect(readOnlyClient.listWorkspaces()).resolves.toEqual({ ok: true });
    await expect(readOnlyClient.listWorkspaces()).resolves.toBe("plain text");
    await expect(readOnlyClient.listWorkspaces()).rejects.toThrow("remote failure");
  });

  it("blocks destructive tools before callTool unless both guard layers are satisfied", async () => {
    const input: CreateTaskBatchMinerSystemRebootInput = {
      farm_id: "farm-1",
      miner_ids: ["miner-1"],
      task_name: "miner.system.reboot",
      workspace_id: "workspace-1",
    };
    const blockedHarness = createHarness([{ structuredContent: { success: true } }]);
    const blockedClient = (await createNonceClientWithDependencies(
      {},
      blockedHarness.dependencies,
    )) as unknown as RuntimeClientForTest;

    await expect(
      blockedClient.createTaskBatchMinerSystemReboot(input, {
        confirmDestructive: true,
        confirmation: "confirmed by user",
      }),
    ).rejects.toThrow("CreateTaskBatch_MinerSystemReboot is destructive");
    expect(blockedHarness.calls).toHaveLength(0);

    const allowedHarness = createHarness([{ structuredContent: { success: true } }]);
    const allowedClient = (await createNonceClientWithDependencies(
      { allowDestructive: true },
      allowedHarness.dependencies,
    )) as unknown as RuntimeClientForTest;

    await expect(
      allowedClient.createTaskBatchMinerSystemReboot(input, {
        confirmDestructive: true,
        confirmation: "confirmed by user",
      }),
    ).resolves.toEqual({ success: true });
    expect(allowedHarness.calls[0]?.request).toEqual({
      arguments: input,
      name: "CreateTaskBatch_MinerSystemReboot",
    });
  });
});
