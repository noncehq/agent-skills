import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, rm, rmdir, writeFile } from "node:fs/promises";
import { homedir, platform, tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { Command } from "commander";

import { DEFAULT_MCP_ENDPOINT } from "../runtime/index.js";
import { getStateBaseDir } from "../runtime/state-store.js";
import { getCliArgv } from "./argv.js";

export const bootstrapCommandName = "nonce bootstrap-runtime";
export const EXPECTED_NODE_VERSION = "24.17.0";
export const MINIMUM_NODE_MAJOR_VERSION = 22;

export const runtimeCheckExitCode = (result: {
  nodeVersionOk: boolean;
  supported: boolean;
}): 0 | 1 => (result.supported && result.nodeVersionOk ? 0 : 1);

export const isSupportedPlatform = (os: NodeJS.Platform): boolean =>
  os === "darwin" || os === "linux" || os === "win32";

export const isNodeVersionSupported = (version: string): boolean => {
  const major = Number(version.replace(/^v/, "").split(".")[0]);
  return Number.isInteger(major) && major >= MINIMUM_NODE_MAJOR_VERSION;
};

export interface WriteProbeResult {
  error?: string;
  path: string;
  writable: boolean;
}

export interface WriteDiagnostic {
  message: string;
  path: string;
  remediation: string;
  severity: "error" | "warning";
}

export interface SandboxWriteDiagnostics {
  diagnostics: WriteDiagnostic[];
  recommendedTaskDir?: string;
  skillRoot: string;
  skillRootWritable: boolean;
  stateDir: string;
  stateDirWritable: boolean;
  taskDir: string;
  taskDirWritable: boolean;
}

export interface SandboxWriteProbeSet {
  fallbackTaskDir: WriteProbeResult;
  skillRoot: string;
  skillRootProbe: WriteProbeResult;
  stateDirProbe: WriteProbeResult;
  taskDirProbe: WriteProbeResult;
}

export const resolveInstalledSkillRoot = (): string =>
  dirname(dirname(fileURLToPath(import.meta.url)));

const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const probeWritableDirectory = async (directory: string): Promise<WriteProbeResult> => {
  const directoryExisted = existsSync(directory);
  const parent = dirname(directory);
  const parentExisted = existsSync(parent);
  const probeFile = join(directory, `.nonce-write-test-${process.pid}-${randomUUID()}`);

  try {
    await mkdir(directory, { mode: 0o700, recursive: true });
    await writeFile(probeFile, "ok\n", { flag: "wx", mode: 0o600 });
    await rm(probeFile, { force: true });
    if (!directoryExisted) await rmdir(directory).catch(() => undefined);
    if (!parentExisted) await rmdir(parent).catch(() => undefined);
    return { path: directory, writable: true };
  } catch (error) {
    await rm(probeFile, { force: true }).catch(() => undefined);
    if (!directoryExisted) await rmdir(directory).catch(() => undefined);
    if (!parentExisted) await rmdir(parent).catch(() => undefined);
    return { error: errorMessage(error), path: directory, writable: false };
  }
};

const failureDetail = (probe: WriteProbeResult): string => (probe.error ? ` ${probe.error}` : "");

export const buildSandboxWriteDiagnostics = ({
  fallbackTaskDir,
  skillRoot,
  skillRootProbe,
  stateDirProbe,
  taskDirProbe,
}: SandboxWriteProbeSet): SandboxWriteDiagnostics => {
  const diagnostics: WriteDiagnostic[] = [];

  if (!skillRootProbe.writable) {
    diagnostics.push({
      message: `Cannot write runtime diagnostics under the installed skill root.${failureDetail(skillRootProbe)}`,
      path: skillRootProbe.path,
      remediation:
        "Keep using the installed skill root for scripts, but create task files in an external writable directory.",
      severity: "warning",
    });
  }

  if (!stateDirProbe.writable) {
    diagnostics.push({
      message: `Cannot write Nonce state or credential files.${failureDetail(stateDirProbe)}`,
      path: stateDirProbe.path,
      remediation:
        "Set XDG_STATE_HOME to a writable directory before auth, or on Windows set APPDATA to a writable profile directory.",
      severity: "error",
    });
  }

  if (!taskDirProbe.writable) {
    diagnostics.push({
      message: `Cannot write task files under the default task directory.${failureDetail(taskDirProbe)}`,
      path: taskDirProbe.path,
      remediation: fallbackTaskDir.writable
        ? `Create task files under ${fallbackTaskDir.path} and run them with an absolute path or --cwd.`
        : "Create task files in another writable directory and run them with an absolute path or --cwd.",
      severity: fallbackTaskDir.writable ? "warning" : "error",
    });
  }

  return {
    diagnostics,
    recommendedTaskDir: taskDirProbe.writable
      ? taskDirProbe.path
      : fallbackTaskDir.writable
        ? fallbackTaskDir.path
        : undefined,
    skillRoot,
    skillRootWritable: skillRootProbe.writable,
    stateDir: stateDirProbe.path,
    stateDirWritable: stateDirProbe.writable,
    taskDir: taskDirProbe.path,
    taskDirWritable: taskDirProbe.writable,
  };
};

export const createSandboxWriteDiagnostics = async (
  skillRoot = resolveInstalledSkillRoot(),
): Promise<SandboxWriteDiagnostics> => {
  const stateDir = getStateBaseDir();
  const taskDir = join(skillRoot, ".nonce-skill", "tasks");
  const fallbackTaskDir = join(tmpdir(), "nonce-skill-tasks");
  const [skillRootProbe, stateDirProbe, taskDirProbe, fallbackTaskDirProbe] = await Promise.all([
    probeWritableDirectory(join(skillRoot, ".nonce-skill", "diagnostics")),
    probeWritableDirectory(stateDir),
    probeWritableDirectory(taskDir),
    probeWritableDirectory(fallbackTaskDir),
  ]);

  return buildSandboxWriteDiagnostics({
    fallbackTaskDir: fallbackTaskDirProbe,
    skillRoot,
    skillRootProbe,
    stateDirProbe,
    taskDirProbe,
  });
};

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
  const envDoctor = await run(vpCommand, ["env", "doctor"]);
  const envInfo =
    envCurrent.code === 0
      ? (JSON.parse(envCurrent.stdout) as { node_path?: string; version?: string })
      : {};
  const vpManagedNodeVersionOk = envInfo.version === expectedNodeVersion;
  const writeDiagnostics = await createSandboxWriteDiagnostics();

  const result = {
    command: bootstrapCommandName,
    diagnostics: writeDiagnostics.diagnostics,
    endpoint: DEFAULT_MCP_ENDPOINT,
    minimumNodeMajorVersion: MINIMUM_NODE_MAJOR_VERSION,
    node: process.version,
    nodePath: process.execPath,
    nodeVersionOk: isNodeVersionSupported(process.version),
    platform: os,
    recommendedRunner: "node",
    recommendedTaskDir: writeDiagnostics.recommendedTaskDir,
    skillRoot: writeDiagnostics.skillRoot,
    skillRootWritable: writeDiagnostics.skillRootWritable,
    stateDir: writeDiagnostics.stateDir,
    stateDirWritable: writeDiagnostics.stateDirWritable,
    supported,
    taskDir: writeDiagnostics.taskDir,
    taskDirWritable: writeDiagnostics.taskDirWritable,
    vp: vpVersion.stdout.trim(),
    vpCommand,
    vpEnvDoctorOk: envDoctor.code === 0,
    vpEnvCurrent: {
      expectedVersion: expectedNodeVersion,
      nodePath: envInfo.node_path,
      version: envInfo.version,
    },
    vpEnvCurrentOk: envCurrent.code === 0,
    vpManagedNodeVersionOk,
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
  console.log(
    `Node: ${result.node} (${result.nodePath})${result.nodeVersionOk ? "" : ` (expected >=${result.minimumNodeMajorVersion})`}`,
  );
  console.log(
    `Vite+ Node version: ${result.vpEnvCurrent.version ?? "unknown"}${result.vpManagedNodeVersionOk ? "" : ` (recommended ${result.vpEnvCurrent.expectedVersion ?? "unknown"})`}`,
  );
  console.log(`vp env current: ${result.vpEnvCurrentOk ? "ok" : "failed"}`);
  console.log(`vp env doctor: ${result.vpEnvDoctorOk ? "ok" : "failed"}`);
  console.log(`Recommended runner: ${result.recommendedRunner}`);
  console.log(`State directory writable: ${result.stateDirWritable ? "yes" : "no"}`);
  console.log(`Task directory writable: ${result.taskDirWritable ? "yes" : "no"}`);
  if (result.recommendedTaskDir) {
    console.log(`Recommended task directory: ${result.recommendedTaskDir}`);
  }
  for (const diagnostic of result.diagnostics) {
    console.log(
      `${diagnostic.severity.toUpperCase()}: ${diagnostic.message} ${diagnostic.remediation}`,
    );
  }
  process.exitCode = exitCode;
};

if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}
