import { access, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vite-plus/test";

const readText = (path: string) => readFile(new URL(path, import.meta.url), "utf8");
const repoRoot = dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const nonceSchemaPath = (fileName: string) =>
  join(repoRoot, "skills", "nonce", "assets", "schemas", fileName);

describe("Nonce skill metadata", () => {
  it("points OpenAI skill icons at bundled assets", async () => {
    const metadata = await readText("../skills/nonce/agents/openai.yaml");
    const iconPaths = [...metadata.matchAll(/^\s+icon_(?:small|large):\s+"(.+)"$/gm)]
      .map((match) => match[1])
      .filter((path): path is string => path !== undefined);

    expect(iconPaths).toEqual(["./assets/nonce-logo.svg", "./assets/nonce-logo.svg"]);

    await Promise.all(
      iconPaths.map((iconPath) => access(join(repoRoot, "skills", "nonce", iconPath))),
    );
  });

  it("packages the current miner tag and record task contract", async () => {
    const manifest = JSON.parse(await readText("../skills/nonce/assets/tool-manifest.json")) as {
      toolCount: number;
      tools: { name: string }[];
    };
    const schemas = JSON.parse(await readText("../skills/nonce/assets/tool-schemas.json")) as {
      tools: {
        ListMiners: {
          output: {
            properties: {
              data: { items: { properties: Record<string, unknown> } };
            };
          };
        };
      };
    };
    const toolNames = manifest.tools.map((tool) => tool.name);
    const minerProperties = schemas.tools.ListMiners.output.properties.data.items.properties;

    expect(manifest.toolCount).toBe(manifest.tools.length);
    expect(toolNames).toContain("CreateTaskBatch_MinerTagsUpdate");
    expect(toolNames).toContain("CreateTaskBatch_MinerRecordDelete");
    expect(toolNames).not.toContain("CreateTaskBatch_MinerAssetUpdate");
    expect(toolNames).not.toContain("CreateTaskBatch_MinerAssetDelete");

    await Promise.all([
      access(nonceSchemaPath("create-task-batch-miner-tags-update.md")),
      access(nonceSchemaPath("create-task-batch-miner-record-delete.md")),
    ]);
    await expect(
      access(nonceSchemaPath("create-task-batch-miner-asset-update.md")),
    ).rejects.toThrow();
    await expect(
      access(nonceSchemaPath("create-task-batch-miner-asset-delete.md")),
    ).rejects.toThrow();

    expect(minerProperties).toHaveProperty("expected_hashrate");
    expect(minerProperties).toHaveProperty("reboot_count");
    expect(minerProperties).toHaveProperty("tags");
  });
});
