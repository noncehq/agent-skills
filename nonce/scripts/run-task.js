import { a as DEFAULT_MCP_ENDPOINT, c as Command, o as DEFAULT_PROFILE, r as normalizeProfile, t as getCliArgv } from "./argv-aCa5riKo.js";
import { t as parseTimeoutMs } from "./cli-options-d-GOT468.js";
import { spawn } from "node:child_process";
import { isAbsolute, join, resolve } from "node:path";
import { existsSync } from "node:fs";
import { access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
//#region src/skill-scripts/run-task.ts
const runTaskCommandName = "nonce run-task";
const resolveTaskPath = (taskFile, cwd) => isAbsolute(taskFile) ? taskFile : resolve(cwd, taskFile);
const runnerPreloadUrl = new URL("./skill-runtime.js", import.meta.url).href;
const skillDir = fileURLToPath(new URL("..", import.meta.url));
const resolveTsxCommand = () => {
	const localTsx = join(skillDir, "node_modules", ".bin", process.platform === "win32" ? "tsx.cmd" : "tsx");
	return existsSync(localTsx) ? localTsx : "tsx";
};
const runTask = async (taskFile, options) => {
	const cwd = resolve(options.cwd ?? process.cwd());
	const taskPath = resolveTaskPath(taskFile, cwd);
	await access(taskPath);
	const child = spawn(resolveTsxCommand(), [
		"--import",
		runnerPreloadUrl,
		taskPath
	], {
		cwd,
		env: {
			...process.env,
			NONCE_ALLOW_DESTRUCTIVE: options.allowDestructive ? "1" : "0",
			NONCE_MCP_ENDPOINT: options.endpoint ?? "https://mcp.nonce.app/mcp",
			NONCE_PROFILE: normalizeProfile(options.profile ?? "default"),
			NONCE_RUNNER_MODE: "1"
		},
		shell: process.platform === "win32",
		stdio: "inherit"
	});
	const timeout = parseTimeoutMs(options.timeoutMs, "--timeout-ms", 6e4);
	const timer = setTimeout(() => {
		child.kill();
	}, timeout);
	const code = await new Promise((resolveCode, reject) => {
		child.on("error", reject);
		child.on("close", (exitCode) => resolveCode(exitCode ?? 1));
	});
	if (timer) clearTimeout(timer);
	if (code !== 0) throw new Error(`Task exited with code ${code}`);
};
const main = async () => {
	new Command().name("nonce run-task").description("Run a TypeScript task against the local Nonce MCP SDK runtime").argument("<task-file>", "TypeScript task file to execute").option("--allow-destructive", "allow destructive CreateTaskBatch_* SDK methods", false).option("--cwd <path>", "task working directory", process.cwd()).option("--endpoint <url>", "Nonce MCP endpoint", DEFAULT_MCP_ENDPOINT).option("--profile <name>", "credential profile", DEFAULT_PROFILE).option("--timeout-ms <ms>", "task timeout in milliseconds", "60000").action(runTask).parse(getCliArgv());
};
if (import.meta.url === `file://${process.argv[1]}`) await main();
//#endregion
export { runTaskCommandName };
