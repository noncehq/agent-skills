import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, rm, rmdir, writeFile } from "node:fs/promises";
import { platform } from "node:os";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";

import { getCredentialDirectory } from "../runtime/credential-store.js";
import { DEFAULT_MCP_ENDPOINT, DEFAULT_PROFILE } from "../runtime/constants.js";
import { normalizeProfile } from "../runtime/profile.js";
import { getStateBaseDir, getStateProfileDir } from "../runtime/state-store.js";
import { getCliArgv } from "./argv.js";
import { runCliMain } from "./cli-main.js";
import { isMainModule } from "./main-module.js";

export const bootstrapCommandName = "nonce runtime-check";
export const MINIMUM_NODE_MAJOR_VERSION = 22;
export const SUPPORTED_NODE_MAJOR_VERSIONS = [22, 24] as const;

export const runtimeCheckExitCode = (result: {
  nodeVersionOk: boolean;
  supported: boolean;
}): 0 | 1 => (result.supported && result.nodeVersionOk ? 0 : 1);

export const isSupportedPlatform = (os: NodeJS.Platform): boolean =>
  os === "darwin" || os === "linux" || os === "win32";

export const isNodeVersionSupported = (version: string): boolean => {
  const major = Number(version.replace(/^v/, "").split(".")[0]);
  return SUPPORTED_NODE_MAJOR_VERSIONS.some((supported) => supported === major);
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
  severity: "error";
}

export interface RuntimeWriteDiagnostics {
  credentialDir: string;
  credentialDirWritable: boolean;
  dataDir: string;
  dataDirWritable: boolean;
  diagnostics: WriteDiagnostic[];
  profile: string;
  stateDir: string;
  stateDirWritable: boolean;
  stateProfileDir: string;
  stateProfileDirWritable: boolean;
}

export interface RuntimeWriteProbeSet {
  credentialDirProbe: WriteProbeResult;
  dataDirProbe: WriteProbeResult;
  profile: string;
  stateDirProbe: WriteProbeResult;
  stateProfileDirProbe: WriteProbeResult;
}

const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const probeWritableDirectory = async (directory: string): Promise<WriteProbeResult> => {
  const directoryExisted = existsSync(directory);
  const probeFile = join(directory, `.nonce-write-test-${process.pid}-${randomUUID()}`);

  try {
    await mkdir(directory, { mode: 0o700, recursive: true });
    await writeFile(probeFile, "ok\n", { flag: "wx", mode: 0o600 });
    await rm(probeFile, { force: true });
    if (!directoryExisted) await rmdir(directory).catch(() => undefined);
    return { path: directory, writable: true };
  } catch (error) {
    await rm(probeFile, { force: true }).catch(() => undefined);
    if (!directoryExisted) await rmdir(directory).catch(() => undefined);
    return { error: errorMessage(error), path: directory, writable: false };
  }
};

const failureDetail = (probe: WriteProbeResult): string => (probe.error ? ` ${probe.error}` : "");

export const buildRuntimeWriteDiagnostics = ({
  credentialDirProbe,
  dataDirProbe,
  profile,
  stateDirProbe,
  stateProfileDirProbe,
}: RuntimeWriteProbeSet): RuntimeWriteDiagnostics => {
  const diagnostics: WriteDiagnostic[] = [];

  if (!stateDirProbe.writable) {
    diagnostics.push({
      message: `Cannot write Nonce state base directory.${failureDetail(stateDirProbe)}`,
      path: stateDirProbe.path,
      remediation:
        "Set XDG_STATE_HOME to a writable directory, or on Windows set APPDATA to a writable profile directory.",
      severity: "error",
    });
  }

  if (!stateProfileDirProbe.writable) {
    diagnostics.push({
      message: `Cannot write OAuth state files for profile ${profile}.${failureDetail(stateProfileDirProbe)}`,
      path: stateProfileDirProbe.path,
      remediation:
        "Fix this profile directory's permissions or set XDG_STATE_HOME/APPDATA to a writable directory.",
      severity: "error",
    });
  }

  if (!credentialDirProbe.writable) {
    diagnostics.push({
      message: `Cannot write OAuth credential cache for profile ${profile}.${failureDetail(credentialDirProbe)}`,
      path: credentialDirProbe.path,
      remediation:
        "Fix this credentials directory's permissions or set XDG_STATE_HOME/APPDATA to a writable directory.",
      severity: "error",
    });
  }

  if (!dataDirProbe.writable) {
    diagnostics.push({
      message: `Cannot write project-owned Nonce data.${failureDetail(dataDirProbe)}`,
      path: dataDirProbe.path,
      remediation: "Choose a writable project directory with --project-dir.",
      severity: "error",
    });
  }

  return {
    credentialDir: credentialDirProbe.path,
    credentialDirWritable: credentialDirProbe.writable,
    dataDir: dataDirProbe.path,
    dataDirWritable: dataDirProbe.writable,
    diagnostics,
    profile,
    stateDir: stateDirProbe.path,
    stateDirWritable: stateDirProbe.writable,
    stateProfileDir: stateProfileDirProbe.path,
    stateProfileDirWritable: stateProfileDirProbe.writable,
  };
};

export const createRuntimeWriteDiagnostics = async (
  projectDir = process.cwd(),
  profile = DEFAULT_PROFILE,
): Promise<RuntimeWriteDiagnostics> => {
  const normalizedProfile = normalizeProfile(profile);
  const stateDir = getStateBaseDir();
  const stateProfileDir = getStateProfileDir(stateDir, normalizedProfile);
  const credentialDir = getCredentialDirectory(stateDir, normalizedProfile);
  const dataDir = join(resolve(projectDir), ".nonce");
  const stateDirProbe = await probeWritableDirectory(stateDir);
  const stateProfileDirProbe = await probeWritableDirectory(stateProfileDir);
  const credentialDirProbe = await probeWritableDirectory(credentialDir);
  const dataDirProbe = await probeWritableDirectory(dataDir);

  return buildRuntimeWriteDiagnostics({
    credentialDirProbe,
    dataDirProbe,
    profile: normalizedProfile,
    stateDirProbe,
    stateProfileDirProbe,
  });
};

const main = async (): Promise<void> => {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    args: getCliArgv().slice(2),
    options: {
      json: { default: false, type: "boolean" },
      profile: { default: DEFAULT_PROFILE, type: "string" },
      "project-dir": { default: process.cwd(), type: "string" },
    },
    strict: true,
  });
  if (positionals.length > 0) {
    throw new Error(`Unexpected runtime-check arguments: ${positionals.join(" ")}`);
  }
  const options = {
    json: values.json,
    profile: values.profile,
    projectDir: values["project-dir"],
  };
  const os = platform();
  const supported = isSupportedPlatform(os);
  const writeDiagnostics = await createRuntimeWriteDiagnostics(options.projectDir, options.profile);
  const result = {
    command: bootstrapCommandName,
    credentialDir: writeDiagnostics.credentialDir,
    credentialDirWritable: writeDiagnostics.credentialDirWritable,
    dataDir: writeDiagnostics.dataDir,
    dataDirWritable: writeDiagnostics.dataDirWritable,
    diagnostics: writeDiagnostics.diagnostics,
    endpoint: DEFAULT_MCP_ENDPOINT,
    node: process.version,
    nodePath: process.execPath,
    nodeVersionOk: isNodeVersionSupported(process.version),
    platform: os,
    profile: writeDiagnostics.profile,
    recommendedRunner: process.execPath,
    stateDir: writeDiagnostics.stateDir,
    stateDirWritable: writeDiagnostics.stateDirWritable,
    stateProfileDir: writeDiagnostics.stateProfileDir,
    stateProfileDirWritable: writeDiagnostics.stateProfileDirWritable,
    supported,
    supportedNodeMajorVersions: SUPPORTED_NODE_MAJOR_VERSIONS,
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
  console.log(
    `Node: ${result.node} (${result.nodePath})${result.nodeVersionOk ? "" : ` (supported majors: ${result.supportedNodeMajorVersions.join(", ")})`}`,
  );
  console.log(`Recommended runner: ${result.recommendedRunner}`);
  console.log(`Profile: ${result.profile}`);
  console.log(`OAuth state directory writable: ${result.stateProfileDirWritable ? "yes" : "no"}`);
  console.log(`OAuth credential cache writable: ${result.credentialDirWritable ? "yes" : "no"}`);
  console.log(`Project data directory: ${result.dataDir}`);
  console.log(`Project data directory writable: ${result.dataDirWritable ? "yes" : "no"}`);
  for (const diagnostic of result.diagnostics) {
    console.log(
      `${diagnostic.severity.toUpperCase()}: ${diagnostic.message} ${diagnostic.remediation}`,
    );
  }
  process.exitCode = exitCode;
};

if (isMainModule(import.meta.url)) {
  await runCliMain(main);
}
