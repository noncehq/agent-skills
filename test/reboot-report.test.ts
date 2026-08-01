import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { access, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vite-plus/test";

const execFileAsync = promisify(execFile);
const repoRoot = dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const reportRoot = join(repoRoot, "skills", "reboot-report");
const readReportFile = (relativePath: string) => readFile(join(reportRoot, relativePath), "utf8");

describe("Reboot report skill", () => {
  it("ships self-contained assets", async () => {
    await Promise.all([
      access(join(reportRoot, "agents/openai.yaml")),
      access(join(reportRoot, "assets/nonce-logo.svg")),
      access(join(reportRoot, "assets/template.html")),
      access(join(reportRoot, "scripts/validate-report.mjs")),
    ]);
  });

  it("preserves the supplied HTML template and its comments byte for byte", async () => {
    const template = await readReportFile("assets/template.html");

    expect(createHash("sha256").update(template).digest("hex")).toBe(
      "b074ec39b6740aa4d63491f2c69ea57f59c0680b3a8b62dae9741a20dec1d138",
    );
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
