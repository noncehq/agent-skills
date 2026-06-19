import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { homedir, platform } from "node:os";
import { join } from "node:path";

import { Command } from "commander";

import { DEFAULT_MCP_ENDPOINT } from "../assets/runtime/src/constants.js";
import { getCliArgv } from "./argv.js";

export const bootstrapCommandName = "nonce bootstrap-runtime";

export const runtimeCheckExitCode = (result: {
  nodeVersionOk: boolean;
  supported: boolean;
  vpEnvCurrentOk: boolean;
}): 0 | 1 => (result.supported && result.vpEnvCurrentOk && result.nodeVersionOk ? 0 : 1);

const resolveVpCommand = (): string => {
  const executable = platform() === "win32" ? "vp.cmd" : "vp";
  const home = process.env.VP_HOME ?? join(homedir(), ".vite-plus");
  const managedVp = join(home, "bin", executable);
  return existsSync(managedVp) ? managedVp : "vp";
};

const run = async (
  command: string,
  args: string[],
): Promise<{ code: number; stdout: string; stderr: string }> =>
  new Promise((resolve) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    child.stdout.on("data", (chunk) => stdout.push(Buffer.from(chunk)));
    child.stderr.on("data", (chunk) => stderr.push(Buffer.from(chunk)));
    child.on("error", (error) => resolve({ code: 127, stdout: "", stderr: error.message }));
    child.on("close", (code) =>
      resolve({
        code: code ?? 1,
        stdout: Buffer.concat(stdout).toString("utf8"),
        stderr: Buffer.concat(stderr).toString("utf8"),
      }),
    );
  });

interface SkillPackageJson {
  devEngines?: {
    runtime?: {
      name?: string;
      version?: string;
    };
  };
}

const readExpectedNodeVersion = async (): Promise<string | undefined> => {
  const packageJson = JSON.parse(
    await readFile(new URL("../package.json", import.meta.url), "utf8"),
  ) as SkillPackageJson;
  const runtime = packageJson.devEngines?.runtime;
  return runtime?.name === "node" ? runtime.version : undefined;
};

const main = async (): Promise<void> => {
  const program = new Command()
    .name("nonce bootstrap-runtime")
    .description("Inspect the local runtime required by the Nonce skill")
    .option("--json", "print JSON output", false);

  program.parse(getCliArgv());
  const options = program.opts<{ json: boolean }>();
  const os = platform();
  const supported = os === "darwin" || os === "win32";
  const vpCommand = resolveVpCommand();
  const expectedNodeVersion = await readExpectedNodeVersion();
  const vpVersion = await run(vpCommand, ["--version"]);
  const envCurrent = await run(vpCommand, ["env", "current", "--json"]);
  const envInfo =
    envCurrent.code === 0
      ? (JSON.parse(envCurrent.stdout) as { node_path?: string; version?: string })
      : {};

  const result = {
    command: bootstrapCommandName,
    endpoint: DEFAULT_MCP_ENDPOINT,
    node: process.version,
    nodePath: process.execPath,
    nodeVersionOk: Boolean(expectedNodeVersion && envInfo.version === expectedNodeVersion),
    platform: os,
    supported,
    vp: vpVersion.stdout.trim(),
    vpCommand,
    vpEnvCurrent: {
      expectedVersion: expectedNodeVersion,
      nodePath: envInfo.node_path,
      version: envInfo.version,
    },
    vpEnvCurrentOk: envCurrent.code === 0,
  };
  const exitCode = runtimeCheckExitCode(result);

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = exitCode;
    return;
  }

  console.log(`Nonce MCP endpoint: ${result.endpoint}`);
  console.log(
    `Platform: ${result.platform}${result.supported ? "" : " (not supported by this skill MVP)"}`,
  );
  console.log(`Vite+: ${result.vp || "not found"}`);
  console.log(`Node: ${result.node} (${result.nodePath})`);
  console.log(
    `Vite+ Node version: ${result.vpEnvCurrent.version ?? "unknown"}${result.nodeVersionOk ? "" : ` (expected ${result.vpEnvCurrent.expectedVersion ?? "unknown"})`}`,
  );
  console.log(`vp env current: ${result.vpEnvCurrentOk ? "ok" : "failed"}`);
  process.exitCode = exitCode;
};

if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}
