import { access, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vite-plus/test";

const readText = (path: string) => readFile(new URL(path, import.meta.url), "utf8");
const repoRoot = dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const nonceSchemaPath = (fileName: string) =>
  join(repoRoot, "skills", "nonce", "assets", "schemas", fileName);

const extractFrontmatterValue = (markdown: string, key: string): string => {
  const frontmatter = markdown.match(/^---\n([\s\S]*?)\n---\n/)?.[1];
  if (!frontmatter) throw new Error("Missing frontmatter");

  const inlineMatch = frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
  if (inlineMatch?.[1] && !inlineMatch[1].startsWith(">-")) return inlineMatch[1].trim();

  const blockMatch = frontmatter.match(new RegExp(`^${key}:\\s*>-\\n((?:  .+\\n?)+)`, "m"));
  if (!blockMatch?.[1]) throw new Error(`Missing ${key} in frontmatter`);
  return blockMatch[1]
    .split("\n")
    .map((line) => line.replace(/^  /, "").trim())
    .filter(Boolean)
    .join(" ");
};

describe("Nonce skill metadata", () => {
  it("keeps the trigger description concise and user-intent oriented", async () => {
    const skill = await readText("../skills/nonce/SKILL.md");
    const description = extractFrontmatterValue(skill, "description");

    expect(description.length).toBeLessThanOrEqual(1024);
    expect(description).toMatch(/^Use this skill when/);
    expect(description).toContain("Nonce mining resources");
    expect(description).toContain("Do not use it for generic Bitcoin mining questions");
  });

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
    const toolNames = manifest.tools.map((tool) => tool.name);

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

    const listMiners = await readText("../skills/nonce/assets/schemas/list-miners.md");
    expect(listMiners).toContain("Real-time hashrate in H/s");
    expect(listMiners).toContain("expected_hashrate: number | null");
    expect(listMiners).toContain("reboot_count: number | null");
    expect(listMiners).toContain("tags?: string[]");
  });
});
