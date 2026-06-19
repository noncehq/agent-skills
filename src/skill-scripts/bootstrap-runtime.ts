import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { homedir, platform } from "node:os";
import { join } from "node:path";

import { Command } from "commander";

import { DEFAULT_MCP_ENDPOINT } from "../runtime/index.js";
import { getCliArgv } from "./argv.js";

export const bootstrapCommandName = "nonce bootstrap-runtime";
export const EXPECTED_NODE_VERSION = "24.17.0";

export const runtimeCheckExitCode = (result: {
  nodeVersionOk: boolean;
  supported: boolean;
  vpEnvCurrentOk: boolean;
}): 0 | 1 => (result.supported && result.vpEnvCurrentOk && result.nodeVersionOk ? 0 : 1);

export const isSupportedPlatform = (os: NodeJS.Platform): boolean =>
  os === "darwin" || os === "linux" || os === "win32";

const resolveVpCommand = (): string => {
  const executable = platform() === "win32" ? "vp.cmd" : "vp";
  const home = process.env.VP_HOME ?? join(homedir(), ".vite-plus");
  const managedVp = join(home, "bin", executable);
  return existsSync(managedVp) ? managedVp : "vp";
};

const SUBPROCESS_TIMEOUT_MS = 30_000;

const run = async (
  command: string,
  args: string[],
): Promise<{ code: number; stdout: string; stderr: string }> =>
  new Promise((resolve) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
    const timer = setTimeout(() => {
      child.kill();
      resolve({
        code: 124,
        stdout: "",
        stderr: `${command} timed out after ${SUBPROCESS_TIMEOUT_MS}ms`,
      });
    }, SUBPROCESS_TIMEOUT_MS);
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    child.stdout.on("data", (chunk) => stdout.push(Buffer.from(chunk)));
    child.stderr.on("data", (chunk) => stderr.push(Buffer.from(chunk)));
    child.on("error", (error) => {
      clearTimeout(timer);
      resolve({ code: 127, stdout: "", stderr: error.message });
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({
        code: code ?? 1,
        stdout: Buffer.concat(stdout).toString("utf8"),
        stderr: Buffer.concat(stderr).toString("utf8"),
      });
    });
  });

const main = async (): Promise<void> => {
  const program = new Command()
    .name("nonce bootstrap-runtime")
    .description("Inspect the local runtime required by the Nonce skill")
    .option("--json", "print JSON output", false);

  program.parse(getCliArgv());
  const options = program.opts<{ json: boolean }>();
  const os = platform();
  const supported = isSupportedPlatform(os);
  const vpCommand = resolveVpCommand();
  const expectedNodeVersion = EXPECTED_NODE_VERSION;
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

  console.log(`Nonce endpoint: ${result.endpoint}`);
  console.log(
    `Platform: ${result.platform}${result.supported ? "" : " (supported platforms: macOS, Linux, Windows)"}`,
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
