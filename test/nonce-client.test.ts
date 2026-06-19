import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { describe, expect, it } from "vite-plus/test";

import { resolveDestructiveAllowance } from "../src/runtime/nonce-client.js";

const run = async (
  command: string,
  args: string[],
  options: { cwd: string },
): Promise<{ code: number; stderr: string; stdout: string }> =>
  new Promise((resolveRun, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      shell: process.platform === "win32",
      stdio: ["ignore", "pipe", "pipe"],
    });
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    child.stdout.on("data", (chunk) => stdout.push(Buffer.from(chunk)));
    child.stderr.on("data", (chunk) => stderr.push(Buffer.from(chunk)));
    child.on("error", reject);
    child.on("close", (code) =>
      resolveRun({
        code: code ?? 1,
        stderr: Buffer.concat(stderr).toString("utf8"),
        stdout: Buffer.concat(stdout).toString("utf8"),
      }),
    );
  });

describe("nonce client destructive allowance", () => {
  it("does not allow task code to bypass the runner destructive gate", () => {
    expect(() =>
      resolveDestructiveAllowance(true, {
        allowDestructive: false,
        runnerMode: true,
      }),
    ).toThrow("runner --allow-destructive");
  });

  it("allows destructive calls in runner mode only when the runner enables them", () => {
    expect(
      resolveDestructiveAllowance(undefined, {
        allowDestructive: true,
        runnerMode: true,
      }),
    ).toBe(true);
  });

  it("uses the runner startup snapshot even if the task mutates env later", () => {
    process.env.NONCE_ALLOW_DESTRUCTIVE = "1";
    try {
      expect(
        resolveDestructiveAllowance(undefined, {
          allowDestructive: false,
          runnerMode: true,
        }),
      ).toBe(false);
    } finally {
      delete process.env.NONCE_ALLOW_DESTRUCTIVE;
    }
  });

  it("keeps explicit SDK allowance available outside the runner", () => {
    expect(resolveDestructiveAllowance(true, { allowDestructive: false, runnerMode: false })).toBe(
      true,
    );
  });

  it("prevents cache-busted imports from bypassing the runner destructive gate", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "nonce-runner-gate-"));
    const taskPath = join(tempDir, "attempt-bypass.ts");
    const moduleUrl = pathToFileURL(resolve("nonce/scripts/skill-runtime.js")).toString();
    const cacheBustedModuleUrl = `${moduleUrl}?bypass=${Date.now()}`;

    await writeFile(
      taskPath,
      [
        "void (async () => {",
        '  process.env.NONCE_ALLOW_DESTRUCTIVE = "1";',
        `  const normal = await import(${JSON.stringify(moduleUrl)});`,
        `  const busted = await import(${JSON.stringify(cacheBustedModuleUrl)});`,
        "  console.log(JSON.stringify({",
        "    normal: normal.resolveDestructiveAllowance(undefined),",
        "    busted: busted.resolveDestructiveAllowance(undefined),",
        "  }));",
        "})().catch((error) => {",
        "  console.error(error);",
        "  process.exit(1);",
        "});",
      ].join("\n"),
    );

    try {
      const command = process.platform === "win32" ? "vp.cmd" : "vp";
      const result = await run(command, ["run", "nonce:run", "--", taskPath], {
        cwd: resolve("nonce"),
      });
      expect(result.code, result.stderr).toBe(0);
      const jsonLine = result.stdout
        .split(/\r?\n/)
        .reverse()
        .find((line) => line.startsWith("{"));
      expect(jsonLine).toBeTruthy();
      expect(JSON.parse(jsonLine ?? "{}")).toEqual({ busted: false, normal: false });
    } finally {
      await rm(tempDir, { force: true, recursive: true });
    }
  });

  it("injects runner profile, endpoint, and authorization flags into task code", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "nonce-runner-env-"));
    const taskPath = join(tempDir, "read-env.ts");

    await writeFile(
      taskPath,
      [
        "console.log(JSON.stringify({",
        "  allowDestructive: process.env.NONCE_ALLOW_DESTRUCTIVE,",
        "  endpoint: process.env.NONCE_MCP_ENDPOINT,",
        "  profile: process.env.NONCE_PROFILE,",
        "  runnerMode: process.env.NONCE_RUNNER_MODE,",
        "}));",
      ].join("\n"),
    );

    try {
      const command = process.platform === "win32" ? "vp.cmd" : "vp";
      const result = await run(
        command,
        [
          "run",
          "nonce:run",
          "--",
          "--profile",
          "test-local",
          "--endpoint",
          "https://example.test/mcp",
          "--timeout-ms",
          "5000",
          taskPath,
        ],
        {
          cwd: resolve("nonce"),
        },
      );
      expect(result.code, result.stderr).toBe(0);
      const jsonLine = result.stdout
        .split(/\r?\n/)
        .reverse()
        .find((line) => line.startsWith("{"));
      expect(jsonLine).toBeTruthy();
      expect(JSON.parse(jsonLine ?? "{}")).toEqual({
        allowDestructive: "0",
        endpoint: "https://example.test/mcp",
        profile: "test-local",
        runnerMode: "1",
      });
    } finally {
      await rm(tempDir, { force: true, recursive: true });
    }
  });
});
