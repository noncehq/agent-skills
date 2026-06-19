import { spawn } from "node:child_process";
import { access } from "node:fs/promises";
import { isAbsolute, resolve } from "node:path";

import { Command } from "commander";

import { DEFAULT_MCP_ENDPOINT, DEFAULT_PROFILE } from "../assets/runtime/src/constants.js";
import { normalizeProfile } from "../assets/runtime/src/profile.js";
import { getCliArgv } from "./argv.js";

export const runTaskCommandName = "nonce run-task";

interface RunTaskOptions {
  allowDestructive?: boolean;
  cwd?: string;
  endpoint?: string;
  fileCredentials?: boolean;
  profile?: string;
  timeoutMs?: string;
}

const resolveTaskPath = (taskFile: string, cwd: string): string =>
  isAbsolute(taskFile) ? taskFile : resolve(cwd, taskFile);

const runnerPreloadUrl = new URL("../assets/runtime/src/runner-preload.ts", import.meta.url).href;

const runTask = async (taskFile: string, options: RunTaskOptions): Promise<void> => {
  const cwd = resolve(options.cwd ?? process.cwd());
  const taskPath = resolveTaskPath(taskFile, cwd);
  await access(taskPath);

  const child = spawn("tsx", ["--import", runnerPreloadUrl, taskPath], {
    cwd,
    env: {
      ...process.env,
      NONCE_ALLOW_DESTRUCTIVE: options.allowDestructive ? "1" : "0",
      NONCE_FILE_CREDENTIALS: options.fileCredentials ? "1" : "0",
      NONCE_MCP_ENDPOINT: options.endpoint ?? DEFAULT_MCP_ENDPOINT,
      NONCE_PROFILE: normalizeProfile(options.profile ?? DEFAULT_PROFILE),
      NONCE_RUNNER_MODE: "1",
    },
    shell: process.platform === "win32",
    stdio: "inherit",
  });

  const timeout = Number(options.timeoutMs ?? 60_000);
  const timer = Number.isFinite(timeout)
    ? setTimeout(() => {
        child.kill();
      }, timeout)
    : undefined;

  const code = await new Promise<number>((resolveCode, reject) => {
    child.on("error", reject);
    child.on("close", (exitCode) => resolveCode(exitCode ?? 1));
  });
  if (timer) clearTimeout(timer);
  if (code !== 0) {
    throw new Error(`Task exited with code ${code}`);
  }
};

const main = async (): Promise<void> => {
  const program = new Command()
    .name("nonce run-task")
    .description("Run a TypeScript task against the local Nonce MCP SDK runtime")
    .argument("<task-file>", "TypeScript task file to execute")
    .option("--allow-destructive", "allow destructive CreateTaskBatch_* SDK methods", false)
    .option("--cwd <path>", "task working directory", process.cwd())
    .option("--endpoint <url>", "Nonce MCP endpoint", DEFAULT_MCP_ENDPOINT)
    .option("--file-credentials", "read OAuth credentials from the local file fallback")
    .option("--profile <name>", "credential profile", DEFAULT_PROFILE)
    .option("--timeout-ms <ms>", "task timeout in milliseconds", "60000")
    .action(runTask);

  program.parse(getCliArgv());
};

if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}
