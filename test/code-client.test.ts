import { describe, expect, it } from "vite-plus/test";

import {
  createNonceCodeClientWithDependencies,
  type CodeClientOptions,
} from "../src/runtime/code-client.js";
import type { CreateNonceClientOptions, NonceClient } from "../src/runtime/nonce-client.js";

describe("Nonce code client", () => {
  it("exposes the full MCP client through a fixed endpoint and narrow options", async () => {
    let receivedOptions: CreateNonceClientOptions | undefined;
    const fakeClient = { close: async () => {} } as NonceClient;

    const client = await createNonceCodeClientWithDependencies(
      { allowDestructive: true, profile: "analysis" },
      {
        createNonceClient: async (options) => {
          receivedOptions = options;
          return fakeClient;
        },
      },
    );

    expect(client).toBe(fakeClient);
    expect(receivedOptions).toEqual({
      allowDestructive: true,
      endpoint: "https://mcp.nonce.app/mcp",
      name: "nonce-skill-code",
      profile: "analysis",
      version: "0.0.0",
    });

    await expect(
      createNonceCodeClientWithDependencies(
        { endpoint: "https://example.test/mcp" } as CodeClientOptions,
        {
          createNonceClient: async () => fakeClient,
        },
      ),
    ).rejects.toThrow("Unsupported Nonce client option: endpoint");
  });

  it("supports multi-method analysis without rendering raw MCP rows", async () => {
    const calls: string[] = [];
    const rawMiners = Array.from({ length: 10_000 }, (_, index) => ({
      hashrate: index % 2 === 0 ? 100 : 0,
      id: `raw-miner-${index}`,
      status: index % 2 === 0 ? "online" : "offline",
    }));
    const fakeClient = {
      close: async () => {
        calls.push("close");
      },
      listFarms: async () => {
        calls.push("listFarms");
        return { data: [{ id: "farm-1" }] };
      },
      listMiners: async () => {
        calls.push("listMiners");
        return { data: rawMiners };
      },
      listWorkspaces: async () => {
        calls.push("listWorkspaces");
        return { data: [{ id: "workspace-1" }] };
      },
    } as unknown as NonceClient & {
      listFarms(): Promise<{ data: Array<{ id: string }> }>;
      listMiners(): Promise<{ data: typeof rawMiners }>;
      listWorkspaces(): Promise<{ data: Array<{ id: string }> }>;
    };

    const client = (await createNonceCodeClientWithDependencies(
      {},
      { createNonceClient: async () => fakeClient },
    )) as typeof fakeClient;
    const workspaces = await client.listWorkspaces();
    const farms = await client.listFarms();
    const miners = await client.listMiners();
    const summary = JSON.stringify({
      farmCount: farms.data.length,
      offline: miners.data.filter((miner) => miner.status === "offline").length,
      workspaceCount: workspaces.data.length,
    });
    await client.close();

    expect(calls).toEqual(["listWorkspaces", "listFarms", "listMiners", "close"]);
    expect(summary).toBe('{"farmCount":1,"offline":5000,"workspaceCount":1}');
    expect(summary).not.toContain("raw-miner-9999");
    expect(summary.length).toBeLessThan(100);
  });
});
