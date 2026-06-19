import { a as DEFAULT_MCP_ENDPOINT, c as Command, d as auth, i as DEFAULT_CALLBACK_PORT, l as StreamableHTTPClientTransport, n as createOAuthProvider, o as DEFAULT_PROFILE, r as normalizeProfile, s as OAUTH_CALLBACK_PATH, t as getCliArgv, u as Client } from "./argv-aCa5riKo.js";
import { t as parseTimeoutMs } from "./cli-options-d-GOT468.js";
import { createServer } from "node:http";
//#region src/skill-scripts/auth.ts
const authCommandName = "nonce auth";
const createProviderFromOptions = (options) => {
	const port = Number(options.port ?? 33418);
	return createOAuthProvider({
		endpoint: options.endpoint ?? "https://mcp.nonce.app/mcp",
		openBrowser: shouldOpenBrowser(options),
		profile: normalizeProfile(options.profile ?? "default"),
		redirectUrl: `http://127.0.0.1:${port}${OAUTH_CALLBACK_PATH}`
	});
};
const shouldOpenBrowser = (options) => options.open !== false;
const parseCallback = (value) => {
	if (!value.includes("://")) return { code: value };
	const url = new URL(value);
	const code = url.searchParams.get("code");
	if (!code) throw new Error("Callback URL does not include a code parameter");
	return {
		code,
		state: url.searchParams.get("state") ?? void 0
	};
};
const createCallbackListener = async (provider, timeoutMs) => {
	const redirect = new URL(provider.redirectUrl);
	const server = createServer();
	const sockets = /* @__PURE__ */ new Set();
	let timer;
	const closeServer = async () => {
		if (timer) clearTimeout(timer);
		for (const socket of sockets) socket.destroy();
		if (!server.listening) return;
		await new Promise((resolve) => server.close(() => resolve()));
	};
	const wait = new Promise((resolve, reject) => {
		timer = setTimeout(() => {
			server.close();
			reject(/* @__PURE__ */ new Error("Timed out waiting for OAuth callback"));
		}, timeoutMs);
		server.on("request", (req, res) => {
			try {
				const requestUrl = new URL(req.url ?? "/", provider.redirectUrl);
				if (requestUrl.pathname !== redirect.pathname) {
					res.statusCode = 404;
					res.end("Not found");
					return;
				}
				const code = requestUrl.searchParams.get("code");
				if (!code) throw new Error("OAuth callback is missing code");
				res.statusCode = 200;
				res.setHeader("content-type", "text/plain; charset=utf-8");
				res.setHeader("connection", "close");
				res.end("Nonce MCP authentication completed. You can close this window.", () => {
					resolve({
						code,
						state: requestUrl.searchParams.get("state") ?? void 0
					});
					closeServer();
				});
			} catch (error) {
				reject(error);
				closeServer();
			}
		});
		server.on("connection", (socket) => {
			sockets.add(socket);
			socket.on("close", () => sockets.delete(socket));
		});
		server.on("error", reject);
		server.listen(Number(redirect.port), redirect.hostname, () => {
			const address = server.address();
			if (address.port !== Number(redirect.port)) {
				reject(/* @__PURE__ */ new Error(`OAuth callback server listened on unexpected port ${address.port}`));
				closeServer();
			}
		});
	});
	await new Promise((resolve, reject) => {
		if (server.listening) {
			resolve();
			return;
		}
		server.once("listening", () => resolve());
		server.once("error", reject);
	});
	return {
		close: closeServer,
		wait: async () => wait
	};
};
const assertState = async (provider, receivedState) => {
	const expectedState = await provider.expectedState();
	if (expectedState && receivedState && expectedState !== receivedState) throw new Error("OAuth callback state does not match the pending login state");
};
const tokenFingerprint = (tokens) => tokens ? JSON.stringify({
	access_token: tokens.access_token,
	refresh_token: tokens.refresh_token,
	scope: tokens.scope,
	token_type: tokens.token_type
}) : "";
const hasCurrentLoginTokens = (tokens, metadata, baseline) => {
	if (!tokens?.access_token && !tokens?.refresh_token) return false;
	const savedAt = Date.parse(metadata?.savedAt ?? "");
	if (Number.isFinite(savedAt) && savedAt >= baseline.savedAfter) return true;
	return tokenFingerprint(tokens) !== baseline.tokenFingerprint;
};
const waitForSavedTokens = async (provider, timeoutMs, signal, baseline) => new Promise((resolve, reject) => {
	let timer;
	const cleanup = () => {
		if (timer) clearTimeout(timer);
		signal.removeEventListener("abort", onAbort);
	};
	const onAbort = () => {
		cleanup();
		resolve();
	};
	signal.addEventListener("abort", onAbort, { once: true });
	const poll = async () => {
		if (signal.aborted) {
			cleanup();
			resolve();
			return;
		}
		try {
			if (hasCurrentLoginTokens(await provider.tokens(), await provider.tokenMetadata(), baseline)) {
				cleanup();
				resolve();
				return;
			}
			if (Date.now() - baseline.savedAfter >= timeoutMs) {
				cleanup();
				reject(/* @__PURE__ */ new Error("Timed out waiting for OAuth callback"));
				return;
			}
			timer = setTimeout(() => void poll(), 1e3);
		} catch (error) {
			cleanup();
			reject(error);
		}
	};
	poll();
});
const status = async (options) => {
	const provider = createProviderFromOptions(options);
	const tokens = await provider.tokens();
	console.log(JSON.stringify({
		authenticated: Boolean(tokens?.access_token),
		endpoint: provider.endpoint,
		profile: normalizeProfile(options.profile ?? "default"),
		storage: provider.credentialStoreKind,
		tokenType: tokens?.token_type
	}, null, 2));
};
const login = async (options) => {
	const provider = createProviderFromOptions(options);
	const timeoutMs = parseTimeoutMs(options.timeoutMs, "--timeout-ms", 18e4);
	const listener = await createCallbackListener(provider, timeoutMs);
	const baseline = {
		savedAfter: Date.now(),
		tokenFingerprint: tokenFingerprint(await provider.tokens())
	};
	let first;
	try {
		first = await auth(provider, { serverUrl: provider.endpoint });
	} catch (error) {
		await listener.close();
		throw error;
	}
	if (first === "AUTHORIZED") {
		await listener.close();
		await status(options);
		return;
	}
	const savedTokenWaiter = new AbortController();
	try {
		const callback = await Promise.race([listener.wait(), waitForSavedTokens(provider, timeoutMs, savedTokenWaiter.signal, baseline).then(() => void 0)]);
		if (callback) {
			await assertState(provider, callback.state);
			await auth(provider, {
				authorizationCode: callback.code,
				serverUrl: provider.endpoint
			});
		}
		await status(options);
	} finally {
		savedTokenWaiter.abort();
		await listener.close();
	}
};
const callback = async (callbackValue, options) => {
	const provider = createProviderFromOptions(options);
	const parsed = parseCallback(callbackValue);
	await assertState(provider, parsed.state);
	await auth(provider, {
		authorizationCode: parsed.code,
		serverUrl: provider.endpoint
	});
	await status(options);
};
const verify = async (options) => {
	const provider = createProviderFromOptions(options);
	const tokens = await provider.tokens();
	if (!tokens?.access_token && !tokens?.refresh_token) throw new Error("Not authenticated. Run `vp run nonce:auth -- login` first.");
	const client = new Client({
		name: "nonce-skill-smoke",
		version: "0.0.0"
	});
	const transport = new StreamableHTTPClientTransport(new URL(provider.endpoint), { authProvider: provider });
	try {
		await client.connect(transport);
		const tools = await client.listTools();
		console.log(JSON.stringify({
			authenticated: true,
			endpoint: provider.endpoint,
			instructionsPresent: Boolean(client.getInstructions()),
			profile: normalizeProfile(options.profile ?? "default"),
			server: client.getServerVersion(),
			storage: provider.credentialStoreKind,
			toolCount: tools.tools.length,
			toolNames: tools.tools.map((tool) => tool.name)
		}, null, 2));
	} finally {
		await client.close();
	}
};
const logout = async (options) => {
	const provider = createProviderFromOptions(options);
	if (options.all) await provider.clearAll();
	else await provider.clearTokens();
	await status(options);
};
const addSharedOptions = (command) => command.option("--endpoint <url>", "Nonce MCP endpoint", DEFAULT_MCP_ENDPOINT).option("--profile <name>", "credential profile", DEFAULT_PROFILE);
const main = async () => {
	const program = new Command().name("nonce auth").description("Authenticate the local Nonce MCP SDK runtime");
	addSharedOptions(program.command("status").description("show local authentication status")).action(status);
	addSharedOptions(program.command("login").description("start OAuth login using a local callback server").option("--no-open", "print the authorization URL instead of opening a browser").option("--port <port>", "local callback port", String(DEFAULT_CALLBACK_PORT)).option("--timeout-ms <ms>", "callback wait timeout", "180000")).action(login);
	addSharedOptions(program.command("callback").description("exchange a pasted OAuth callback URL or authorization code").argument("<callback>", "callback URL or authorization code").option("--port <port>", "local callback port", String(DEFAULT_CALLBACK_PORT))).action(callback);
	addSharedOptions(program.command("verify").description("verify saved OAuth credentials by initializing MCP and listing tools")).action(verify);
	addSharedOptions(program.command("logout").description("clear saved OAuth tokens").option("--all", "also clear client registration and discovery state")).action(logout);
	program.parse(getCliArgv());
};
if (import.meta.url === `file://${process.argv[1]}`) await main();
//#endregion
export { authCommandName, hasCurrentLoginTokens, parseCallback, shouldOpenBrowser };
