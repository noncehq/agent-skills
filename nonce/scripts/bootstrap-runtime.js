import { a as DEFAULT_MCP_ENDPOINT, c as Command, t as getCliArgv } from "./argv-aCa5riKo.js";
import { spawn } from "node:child_process";
import { join } from "node:path";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { homedir, platform } from "node:os";
//#region src/skill-scripts/bootstrap-runtime.ts
const bootstrapCommandName = "nonce bootstrap-runtime";
const runtimeCheckExitCode = (result) => result.supported && result.vpEnvCurrentOk && result.nodeVersionOk ? 0 : 1;
const resolveVpCommand = () => {
	const executable = platform() === "win32" ? "vp.cmd" : "vp";
	const managedVp = join(process.env.VP_HOME ?? join(homedir(), ".vite-plus"), "bin", executable);
	return existsSync(managedVp) ? managedVp : "vp";
};
const run = async (command, args) => new Promise((resolve) => {
	const child = spawn(command, args, { stdio: [
		"ignore",
		"pipe",
		"pipe"
	] });
	const stdout = [];
	const stderr = [];
	child.stdout.on("data", (chunk) => stdout.push(Buffer.from(chunk)));
	child.stderr.on("data", (chunk) => stderr.push(Buffer.from(chunk)));
	child.on("error", (error) => resolve({
		code: 127,
		stdout: "",
		stderr: error.message
	}));
	child.on("close", (code) => resolve({
		code: code ?? 1,
		stdout: Buffer.concat(stdout).toString("utf8"),
		stderr: Buffer.concat(stderr).toString("utf8")
	}));
});
const readExpectedNodeVersion = async () => {
	const runtime = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8")).devEngines?.runtime;
	return runtime?.name === "node" ? runtime.version : void 0;
};
const main = async () => {
	const program = new Command().name("nonce bootstrap-runtime").description("Inspect the local runtime required by the Nonce skill").option("--json", "print JSON output", false);
	program.parse(getCliArgv());
	const options = program.opts();
	const os = platform();
	const supported = os === "darwin" || os === "win32";
	const vpCommand = resolveVpCommand();
	const expectedNodeVersion = await readExpectedNodeVersion();
	const vpVersion = await run(vpCommand, ["--version"]);
	const envCurrent = await run(vpCommand, [
		"env",
		"current",
		"--json"
	]);
	const envInfo = envCurrent.code === 0 ? JSON.parse(envCurrent.stdout) : {};
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
			version: envInfo.version
		},
		vpEnvCurrentOk: envCurrent.code === 0
	};
	const exitCode = runtimeCheckExitCode(result);
	if (options.json) {
		console.log(JSON.stringify(result, null, 2));
		process.exitCode = exitCode;
		return;
	}
	console.log(`Nonce MCP endpoint: ${result.endpoint}`);
	console.log(`Platform: ${result.platform}${result.supported ? "" : " (not supported by this skill MVP)"}`);
	console.log(`Vite+: ${result.vp || "not found"}`);
	console.log(`Node: ${result.node} (${result.nodePath})`);
	console.log(`Vite+ Node version: ${result.vpEnvCurrent.version ?? "unknown"}${result.nodeVersionOk ? "" : ` (expected ${result.vpEnvCurrent.expectedVersion ?? "unknown"})`}`);
	console.log(`vp env current: ${result.vpEnvCurrentOk ? "ok" : "failed"}`);
	process.exitCode = exitCode;
};
if (import.meta.url === `file://${process.argv[1]}`) await main();
//#endregion
export { bootstrapCommandName, runtimeCheckExitCode };
