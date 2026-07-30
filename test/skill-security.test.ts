import { execFile } from "node:child_process";
import { access, readFile, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath, pathToFileURL } from "node:url";

import { describe, expect, it } from "vite-plus/test";

const repoRoot = dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const skillRoot = join(repoRoot, "skills", "nonce");
const execFileAsync = promisify(execFile);

const runExpectingFailure = async (file: string, args: string[]) => {
  try {
    await execFileAsync(process.execPath, [file, ...args]);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "stderr" in error &&
      typeof error.stderr === "string"
    ) {
      return error as { stderr: string };
    }
    throw error;
  }
  throw new Error(`Expected ${file} to fail`);
};

const readSkillFiles = async (directory: string): Promise<string[]> => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return readSkillFiles(path);
      return [await readFile(path, "utf8")];
    }),
  );
  return files.flat();
};

describe("packaged Nonce security boundary", () => {
  it("ships a restricted code client and fixed commands without an arbitrary task runner", async () => {
    await access(join(skillRoot, "scripts", "nonce.mjs"));
    const clientModulePath = join(skillRoot, "scripts", "client.mjs");
    await access(clientModulePath);
    const clientTypesPath = join(skillRoot, "scripts", "client.d.mts");
    await access(clientTypesPath);
    const authCli = join(skillRoot, "scripts", "auth.mjs");

    for (const removedScript of [
      "bootstrap-runtime.sh",
      "bootstrap-runtime.ps1",
      "run-task.mjs",
      "skill-runtime.mjs",
    ]) {
      await expect(access(join(skillRoot, "scripts", removedScript))).rejects.toThrow();
    }

    const packagedText = (await readSkillFiles(skillRoot)).join("\n");
    for (const forbidden of [
      "curl -fsSL https://vite.plus | bash",
      "irm https://vite.plus/ps1 | iex",
      "ExecutionPolicy Bypass",
      "NONCE_SKILL_RUNTIME_URL",
      "node:child_process",
    ]) {
      expect(packagedText).not.toContain(forbidden);
    }

    const [{ stdout: authHelp }, { stdout: nonceHelp }] = await Promise.all([
      execFileAsync(process.execPath, [authCli, "--help"]),
      execFileAsync(process.execPath, [join(skillRoot, "scripts", "nonce.mjs"), "--help"]),
    ]);
    expect(authHelp).not.toContain("--endpoint");
    expect(nonceHelp).not.toContain("--endpoint");

    const clientModule = (await import(
      `${pathToFileURL(clientModulePath).href}?security-test=${Date.now()}`
    )) as {
      createNonceClient(options?: Record<string, unknown>): Promise<unknown>;
    };
    expect(Object.keys(clientModule)).toEqual(["createNonceClient"]);
    const clientTypes = await readFile(clientTypesPath, "utf8");
    const declaredRuntimeExports = [
      ...clientTypes.matchAll(/export declare (?:const|function|class) (\w+)/g),
    ].map((match) => match[1]);
    expect(declaredRuntimeExports).toEqual(Object.keys(clientModule));
    await expect(
      clientModule.createNonceClient({ endpoint: "https://example.test/mcp" }),
    ).rejects.toThrow("Unsupported Nonce client option: endpoint");
  });

  it("retains the complete read and write MCP contract", async () => {
    const manifest = JSON.parse(
      await readFile(join(skillRoot, "assets", "tool-manifest.json"), "utf8"),
    ) as {
      tools: Array<{ destructive: boolean; readOnly: boolean }>;
    };

    expect(manifest.tools).toHaveLength(31);
    expect(manifest.tools.filter((tool) => tool.readOnly)).toHaveLength(19);
    expect(manifest.tools.filter((tool) => tool.destructive)).toHaveLength(12);
    expect(manifest.tools.every((tool) => tool.readOnly !== tool.destructive)).toBe(true);
  });

  it("blocks a packaged destructive call before authentication without both approvals", async () => {
    const cli = join(skillRoot, "scripts", "nonce.mjs");
    const input = JSON.stringify({
      farm_id: "00000000-0000-4000-8000-000000000002",
      miner_ids: ["00000000-0000-4000-8000-000000000003"],
      task_name: "miner.system.reboot",
      workspace_id: "00000000-0000-4000-8000-000000000001",
    });

    await expect(
      execFileAsync(process.execPath, [
        cli,
        "call",
        "createTaskBatchMinerSystemReboot",
        "--input",
        input,
      ]),
    ).rejects.toMatchObject({
      stderr: expect.stringContaining("--allow-destructive"),
    });

    await expect(
      execFileAsync(process.execPath, [
        cli,
        "call",
        "createTaskBatchMinerSystemReboot",
        "--input",
        input,
        "--allow-destructive",
      ]),
    ).rejects.toMatchObject({
      stderr: expect.stringContaining("--confirmation"),
    });

    await expect(
      execFileAsync(process.execPath, [
        cli,
        "call",
        "createTaskBatchMinerSystemReboot",
        "--input",
        input,
        "--allow-destructive",
        "--confirmation",
        "Restart the selected test miner",
        "--output",
        join(skillRoot, "result.json"),
      ]),
    ).rejects.toMatchObject({
      stderr: expect.stringContaining("outside the installed skill directory"),
    });
  });

  it("prints concise messages for expected packaged CLI failures", async () => {
    const nonceCli = join(skillRoot, "scripts", "nonce.mjs");
    const authCli = join(skillRoot, "scripts", "auth.mjs");
    const [nonceError, authError] = await Promise.all([
      runExpectingFailure(nonceCli, ["call", "listFarms", "--input", "{}"]),
      runExpectingFailure(authCli, ["unknown"]),
    ]);

    expect(nonceError.stderr).toBe(
      "Invalid input for listFarms: / must have required property 'workspace_id'\n",
    );
    expect(authError.stderr).toBe("Unknown auth command: unknown\n");
  });

  it("keeps the canonical code-first example aligned with generated schemas", async () => {
    const workflow = await readFile(join(skillRoot, "references", "workflow.md"), "utf8");
    const schemas = JSON.parse(
      await readFile(join(skillRoot, "assets", "tool-schemas.json"), "utf8"),
    ) as {
      tools: {
        ListFarms: {
          output: {
            properties: {
              data: { items: { properties: Record<string, unknown> } };
            };
          };
        };
      };
    };
    const farmProperties = schemas.tools.ListFarms.output.properties.data.items.properties;

    expect(farmProperties).toHaveProperty("id");
    expect(farmProperties).not.toHaveProperty("farm_id");
    expect(workflow).toContain("farm_id: farm.id");
    expect(workflow).not.toContain("farm.farm_id");
    expect(workflow).toContain(
      "notMiningCount: miners.filter((miner) => miner.is_mining === false).length",
    );
    expect(workflow).not.toContain('miner.status === "offline"');
  });
});
