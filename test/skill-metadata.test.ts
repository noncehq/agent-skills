import { access, readFile } from "node:fs/promises";

import { describe, expect, it } from "vite-plus/test";

interface TriggerEvalQuery {
  query: string;
  reason: string;
  shouldTrigger: boolean;
}

interface TriggerEvalFixture {
  passingThreshold: number;
  runsPerQuery: number;
  skill: string;
  train: TriggerEvalQuery[];
  validation: TriggerEvalQuery[];
}

const readText = (path: string) => readFile(new URL(path, import.meta.url), "utf8");

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

const countByExpectedTrigger = (queries: TriggerEvalQuery[], shouldTrigger: boolean): number =>
  queries.filter((query) => query.shouldTrigger === shouldTrigger).length;

describe("Nonce skill metadata", () => {
  it("keeps the installable skill artifact free of package metadata", async () => {
    await expect(access(new URL("../skills/package.json", import.meta.url))).rejects.toThrow();
  });

  it("keeps the trigger description concise and user-intent oriented", async () => {
    const skill = await readText("../skills/SKILL.md");
    const description = extractFrontmatterValue(skill, "description");

    expect(description.length).toBeLessThanOrEqual(1024);
    expect(description).toMatch(/^Use this skill when/);
    expect(description).toContain("Nonce mining resources");
    expect(description).toContain("Do not use it for generic Bitcoin mining questions");
    expect(description).not.toContain("desktop app");
    expect(description).not.toContain("MCP-backed");
  });

  it("documents a balanced trigger eval fixture", async () => {
    const fixture = JSON.parse(
      await readText("./evals/nonce-skill-trigger.json"),
    ) as TriggerEvalFixture;

    expect(fixture.skill).toBe("nonce");
    expect(fixture.runsPerQuery).toBeGreaterThanOrEqual(3);
    expect(fixture.passingThreshold).toBeGreaterThan(0);
    expect(fixture.passingThreshold).toBeLessThanOrEqual(1);
    expect(fixture.train).toHaveLength(10);
    expect(fixture.validation).toHaveLength(10);

    for (const split of [fixture.train, fixture.validation]) {
      expect(countByExpectedTrigger(split, true)).toBe(5);
      expect(countByExpectedTrigger(split, false)).toBe(5);
      for (const query of split) {
        expect(query.query.length).toBeGreaterThan(0);
        expect(query.reason.length).toBeGreaterThan(0);
      }
    }
  });
});
