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
    expect(toolNames).toContain("CreateTagsUpdateTaskBatch");
    expect(toolNames).toContain("CreateRecordDeleteTaskBatch");
    expect(toolNames).not.toContain("CreateAssetUpdateTaskBatch");
    expect(toolNames).not.toContain("CreateAssetDeleteTaskBatch");

    await Promise.all([
      access(nonceSchemaPath("create-tags-update-task-batch.md")),
      access(nonceSchemaPath("create-record-delete-task-batch.md")),
    ]);
    await expect(access(nonceSchemaPath("create-asset-update-task-batch.md"))).rejects.toThrow();
    await expect(access(nonceSchemaPath("create-asset-delete-task-batch.md"))).rejects.toThrow();

    const listMiners = await readText("../skills/nonce/assets/schemas/list-miners.md");
    expect(listMiners).toContain("Current hashrate in H/s");
    expect(listMiners).toContain("expected_hashrate: number | null");
    expect(listMiners).toContain("tags: string[]");
  });

  it("routes reboot queries without conflating observed events and requested tasks", async () => {
    const skill = await readText("../skills/nonce/SKILL.md");
    const manifest = JSON.parse(await readText("../skills/nonce/assets/tool-manifest.json")) as {
      tools: { name: string }[];
    };
    const toolNames = manifest.tools.map((tool) => tool.name);

    expect(skill).toContain("For observed miner restarts");
    expect(skill).toContain("For reboot requests issued through Nonce for one miner");
    expect(skill).toContain("For farm-wide reboot request batches");
    expect(skill).toContain("`task_name.eq` set to");
    expect(skill).toContain("`miner.system.reboot`");
    expect(skill).toMatch(/A Reboot\s+Event records an observed restart/);
    expect(skill).toMatch(/a Task Batch records a Nonce request and\s+its execution state/);

    for (const toolName of [
      "ListMinerRebootEvents",
      "ListMinerRebootTasks",
      "SearchTaskBatches",
      "GetTaskBatch",
      "ListTaskBatchTasks",
    ]) {
      expect(skill).toContain(`\`${toolName}\``);
      expect(toolNames).toContain(toolName);
    }
  });
});
