import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vite-plus/test";

const execFileAsync = promisify(execFile);
const repoRoot = dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const nonceRoot = join(repoRoot, "skills", "nonce");
const reportRoot = join(repoRoot, "skills", "reboot-report");
const readReportFile = (relativePath: string) => readFile(join(reportRoot, relativePath), "utf8");

describe("Reboot report skill", () => {
  it("is a sibling skill with an explicit nonce dependency boundary", async () => {
    const [nonceSkill, reportSkill] = await Promise.all([
      readFile(join(nonceRoot, "SKILL.md"), "utf8"),
      readReportFile("SKILL.md"),
    ]);

    expect(nonceSkill).toContain("name: nonce");
    expect(nonceSkill).toContain("activate the sibling `reboot-report` skill");
    expect(reportSkill).toContain("name: reboot-report");
    expect(reportSkill).toContain("Activate the `nonce` skill");
    expect(reportSkill).toMatch(/It does not contain a\s+Nonce client/);
    expect(reportSkill).toMatch(/Never call a\s+`createTaskBatch\.\.\.`/);
    expect(reportSkill).toContain("This workflow is read-only");
  });

  it("uses current nonce SDK method names and keeps attribution datasets separate", async () => {
    const [reportSkill, analysis] = await Promise.all([
      readReportFile("SKILL.md"),
      readReportFile("references/analysis.md"),
    ]);

    for (const method of [
      "listMinerRebootEvents",
      "searchTaskBatches",
      "getTaskBatchTasks",
      "listBtcNetworkHistory",
    ]) {
      expect(reportSkill).toContain(`\`${method}\``);
    }

    expect(analysis).toContain("Nonce 下发");
    expect(analysis).toContain("Nonce 对齐重启");
    expect(analysis).toContain("每个任务和事件最多使用一次");
    expect(analysis).toContain("单位是 H/s");
    expect(analysis).toContain("分类可重叠，不能相加");
    expect(analysis).toContain("默认最近 7 天");
    expect(analysis).not.toContain("`ListMinerRebootEvents`");
  });

  it("ships metadata and self-contained assets", async () => {
    const metadata = await readReportFile("agents/openai.yaml");

    expect(metadata).toContain('display_name: "Reboot Report"');
    expect(metadata).toContain("$reboot-report");
    expect(metadata).toContain('icon_small: "./assets/nonce-logo.svg"');

    await Promise.all([
      readReportFile("assets/nonce-logo.svg"),
      readReportFile("assets/template.html"),
      readReportFile("scripts/validate-report.mjs"),
    ]);
  });

  it("preserves the supplied HTML template and its comments byte for byte", async () => {
    const template = await readReportFile("assets/template.html");

    expect(createHash("sha256").update(template).digest("hex")).toBe(
      "b074ec39b6740aa4d63491f2c69ea57f59c0680b3a8b62dae9741a20dec1d138",
    );
    expect(template).toContain("复制后只换数据与文案，保留 style / class");
    expect(template.match(/<!--/g)).toHaveLength(18);
    expect(template.match(/<section class="slide"/g)).toHaveLength(17);
  });

  it("rejects the unchanged template and accepts a customized report", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "reboot-report-test-"));
    const templatePath = join(reportRoot, "assets", "template.html");
    const outputPath = join(tempDir, "report.html");
    const template = await readFile(templatePath, "utf8");
    const resolved = template.replace(
      "<title>ETH01-01 重启现状分析 · 06/23</title>",
      "<title>Example Farm Reboot Report</title>",
    );

    try {
      await expect(
        execFileAsync(process.execPath, [
          join(reportRoot, "scripts", "validate-report.mjs"),
          templatePath,
        ]),
      ).rejects.toMatchObject({
        stderr: expect.stringContaining("report is identical to the bundled example template"),
      });

      await writeFile(outputPath, resolved);
      const result = await execFileAsync(process.execPath, [
        join(reportRoot, "scripts", "validate-report.mjs"),
        outputPath,
      ]);

      expect(JSON.parse(result.stdout)).toMatchObject({ ok: true, slideCount: 17 });
    } finally {
      await rm(tempDir, { force: true, recursive: true });
    }
  });
});
