import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import type { Socket } from "node:net";
import { parseArgs, type ParseArgsOptionsConfig } from "node:util";

import { auth } from "@modelcontextprotocol/sdk/client/auth.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { OAuthTokens } from "@modelcontextprotocol/sdk/shared/auth.js";

import {
  DEFAULT_CALLBACK_PORT,
  DEFAULT_MCP_ENDPOINT,
  DEFAULT_PROFILE,
  OAUTH_CALLBACK_PATH,
} from "../runtime/constants.js";
import {
  createOAuthProvider,
  type LocalNonceOAuthProvider,
  type TokenMetadata,
} from "../runtime/oauth-provider.js";
import { normalizeProfile } from "../runtime/profile.js";
import { getCliArgv } from "./argv.js";
import { parseTimeoutMs } from "./cli-options.js";

export const authCommandName = "nonce auth";

interface SharedAuthOptions {
  profile?: string;
}

const createProviderFromOptions = (
  options: SharedAuthOptions & { port?: string },
): LocalNonceOAuthProvider => {
  const port = Number(options.port ?? DEFAULT_CALLBACK_PORT);
  return createOAuthProvider({
    endpoint: DEFAULT_MCP_ENDPOINT,
    profile: normalizeProfile(options.profile ?? DEFAULT_PROFILE),
    redirectUrl: `http://127.0.0.1:${port}${OAUTH_CALLBACK_PATH}`,
  });
};

export const parseCallback = (value: string): { code: string; state?: string } => {
  if (!value.includes("://")) return { code: value };
  const url = new URL(value);
  const code = url.searchParams.get("code");
  if (!code) throw new Error("Callback URL does not include a code parameter");
  return { code, state: url.searchParams.get("state") ?? undefined };
};

interface CallbackListener {
  close(): Promise<void>;
  wait(): Promise<{ code: string; state?: string }>;
}

const createCallbackListener = async (
  provider: LocalNonceOAuthProvider,
  timeoutMs: number,
): Promise<CallbackListener> => {
  const redirect = new URL(provider.redirectUrl);
  const server = createServer();
  const sockets = new Set<Socket>();

  let timer: NodeJS.Timeout | undefined;

  const closeServer = async (): Promise<void> => {
    if (timer) clearTimeout(timer);
    for (const socket of sockets) {
      socket.destroy();
    }
    if (!server.listening) return;
    await new Promise<void>((resolve) => server.close(() => resolve()));
  };

  const wait = new Promise<{ code: string; state?: string }>((resolve, reject) => {
    timer = setTimeout(() => {
      server.close();
      reject(new Error("Timed out waiting for OAuth callback"));
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
        if (!code) {
          throw new Error("OAuth callback is missing code");
        }

        res.statusCode = 200;
        res.setHeader("content-type", "text/plain; charset=utf-8");
        res.setHeader("connection", "close");
        res.end("Nonce authentication completed. You can close this window.", () => {
          resolve({ code, state: requestUrl.searchParams.get("state") ?? undefined });
          void closeServer();
        });
      } catch (error) {
        reject(error);
        void closeServer();
      }
    });

    server.on("connection", (socket) => {
      sockets.add(socket);
      socket.on("close", () => sockets.delete(socket));
    });
    server.on("error", reject);
    server.listen(Number(redirect.port), redirect.hostname, () => {
      const address = server.address() as AddressInfo;
      if (address.port !== Number(redirect.port)) {
        reject(new Error(`OAuth callback server listened on unexpected port ${address.port}`));
        void closeServer();
      }
    });
  });

  await new Promise<void>((resolve, reject) => {
    if (server.listening) {
      resolve();
      return;
    }
    server.once("listening", () => resolve());
    server.once("error", reject);
  });

  return {
    close: closeServer,
    wait: async () => wait,
  };
};

export const assertState = async (
  provider: Pick<LocalNonceOAuthProvider, "expectedState">,
  receivedState: string | undefined,
): Promise<void> => {
  const expectedState = await provider.expectedState();
  if (!expectedState) {
    throw new Error("OAuth callback has no pending login state");
  }
  if (!receivedState) {
    throw new Error("OAuth callback is missing state for the pending login");
  }
  if (expectedState !== receivedState) {
    throw new Error("OAuth callback state does not match the pending login state");
  }
};

export const consumeState = async (
  provider: Pick<LocalNonceOAuthProvider, "clearExpectedState" | "expectedState">,
  receivedState: string | undefined,
): Promise<void> => {
  await assertState(provider, receivedState);
  await provider.clearExpectedState();
};

interface TokenWaitBaseline {
  savedAfter: number;
  tokenFingerprint: string;
}

const tokenFingerprint = (tokens: OAuthTokens | undefined): string =>
  tokens
    ? JSON.stringify({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        scope: tokens.scope,
        token_type: tokens.token_type,
      })
    : "";

export const hasCurrentLoginTokens = (
  tokens: OAuthTokens | undefined,
  metadata: TokenMetadata | undefined,
  baseline: TokenWaitBaseline,
): boolean => {
  if (!tokens?.access_token && !tokens?.refresh_token) return false;
  const savedAt = Date.parse(metadata?.savedAt ?? "");
  if (Number.isFinite(savedAt) && savedAt >= baseline.savedAfter) return true;
  return tokenFingerprint(tokens) !== baseline.tokenFingerprint;
};

const waitForSavedTokens = async (
  provider: LocalNonceOAuthProvider,
  timeoutMs: number,
  signal: AbortSignal,
  baseline: TokenWaitBaseline,
): Promise<void> =>
  new Promise((resolve, reject) => {
    let timer: NodeJS.Timeout | undefined;

    const cleanup = (): void => {
      if (timer) clearTimeout(timer);
      signal.removeEventListener("abort", onAbort);
    };

    const onAbort = (): void => {
      cleanup();
      resolve();
    };

    signal.addEventListener("abort", onAbort, { once: true });

    const poll = async (): Promise<void> => {
      if (signal.aborted) {
        cleanup();
        resolve();
        return;
      }
      try {
        const tokens = await provider.tokens();
        const metadata = await provider.tokenMetadata();
        if (hasCurrentLoginTokens(tokens, metadata, baseline)) {
          cleanup();
          resolve();
          return;
        }
        if (Date.now() - baseline.savedAfter >= timeoutMs) {
          cleanup();
          reject(new Error("Timed out waiting for OAuth callback"));
          return;
        }
        timer = setTimeout(() => void poll(), 1000);
      } catch (error) {
        cleanup();
        reject(error);
      }
    };
    void poll();
  });

const status = async (options: SharedAuthOptions): Promise<void> => {
  const provider = createProviderFromOptions(options);
  const tokens = await provider.tokens();
  console.log(
    JSON.stringify(
      {
        authenticated: Boolean(tokens?.access_token),
        endpoint: provider.endpoint,
        profile: normalizeProfile(options.profile ?? DEFAULT_PROFILE),
        storage: provider.credentialStoreKind,
        tokenType: tokens?.token_type,
      },
      null,
      2,
    ),
  );
};

const login = async (
  options: SharedAuthOptions & { port?: string; timeoutMs?: string },
): Promise<void> => {
  const provider = createProviderFromOptions(options);
  const timeoutMs = parseTimeoutMs(options.timeoutMs, "--timeout-ms", 180_000);
  const listener = await createCallbackListener(provider, timeoutMs);
  const baseline: TokenWaitBaseline = {
    savedAfter: Date.now(),
    tokenFingerprint: tokenFingerprint(await provider.tokens()),
  };
  let first: "AUTHORIZED" | "REDIRECT";
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
    const callback = await Promise.race([
      listener.wait(),
      waitForSavedTokens(provider, timeoutMs, savedTokenWaiter.signal, baseline).then(
        () => undefined,
      ),
    ]);
    if (callback) {
      await consumeState(provider, callback.state);
      await auth(provider, { authorizationCode: callback.code, serverUrl: provider.endpoint });
    }
    await status(options);
  } finally {
    savedTokenWaiter.abort();
    await listener.close();
  }
};

const callback = async (
  callbackValue: string,
  options: SharedAuthOptions & { port?: string },
): Promise<void> => {
  const provider = createProviderFromOptions(options);
  const parsed = parseCallback(callbackValue);
  await consumeState(provider, parsed.state);
  await auth(provider, { authorizationCode: parsed.code, serverUrl: provider.endpoint });
  await status(options);
};

const verify = async (options: SharedAuthOptions): Promise<void> => {
  const provider = createProviderFromOptions(options);
  const tokens = await provider.tokens();
  if (!tokens?.access_token && !tokens?.refresh_token) {
    throw new Error("Not authenticated. Run the bundled `auth.mjs login` command first.");
  }

  const client = new Client({ name: "nonce-skill-smoke", version: "0.0.0" });
  const transport = new StreamableHTTPClientTransport(new URL(provider.endpoint), {
    authProvider: provider,
  });

  try {
    await client.connect(transport);
    const tools = await client.listTools();
    console.log(
      JSON.stringify(
        {
          authenticated: true,
          endpoint: provider.endpoint,
          instructionsPresent: Boolean(client.getInstructions()),
          profile: normalizeProfile(options.profile ?? DEFAULT_PROFILE),
          server: client.getServerVersion(),
          storage: provider.credentialStoreKind,
          toolCount: tools.tools.length,
          toolNames: tools.tools.map((tool) => tool.name),
        },
        null,
        2,
      ),
    );
  } finally {
    await client.close();
  }
};

const logout = async (options: SharedAuthOptions & { all?: boolean }): Promise<void> => {
  const provider = createProviderFromOptions(options);
  if (options.all) {
    await provider.clearAll();
  } else {
    await provider.clearTokens();
  }
  await status(options);
};

const sharedAuthOptions = {
  profile: { default: DEFAULT_PROFILE, type: "string" },
} as const satisfies ParseArgsOptionsConfig;

const parseAuthArgs = (
  args: string[],
  options: ParseArgsOptionsConfig = {},
): ReturnType<typeof parseArgs> =>
  parseArgs({
    allowPositionals: true,
    args,
    options: { ...sharedAuthOptions, ...options },
    strict: true,
  });

const sharedAuthValues = (
  values: Record<string, boolean | string | (boolean | string)[] | undefined>,
) => ({
  profile: values.profile as string,
});

const assertPositionals = (command: string, positionals: string[], expected: number): void => {
  if (positionals.length !== expected) {
    throw new Error(`${command} expects ${expected} positional argument(s)`);
  }
};

const printHelp = (): void => {
  console.log(`Nonce authentication

Usage:
  auth.mjs status [--profile <name>]
  auth.mjs login [--port <port>] [--timeout-ms <ms>] [--profile <name>]
  auth.mjs callback <callback-url> [--port <port>] [--profile <name>]
  auth.mjs verify [--profile <name>]
  auth.mjs logout [--all] [--profile <name>]`);
};

const main = async (): Promise<void> => {
  const [command, ...args] = getCliArgv().slice(2);
  if (!command || command === "--help" || command === "-h" || command === "help") {
    printHelp();
    return;
  }

  if (command === "status" || command === "verify") {
    const { positionals, values } = parseAuthArgs(args);
    assertPositionals(command, positionals, 0);
    await (command === "status" ? status : verify)(sharedAuthValues(values));
    return;
  }

  if (command === "login") {
    const { positionals, values } = parseAuthArgs(args, {
      port: { default: String(DEFAULT_CALLBACK_PORT), type: "string" },
      "timeout-ms": { default: "180000", type: "string" },
    });
    assertPositionals(command, positionals, 0);
    await login({
      ...sharedAuthValues(values),
      port: values.port as string,
      timeoutMs: values["timeout-ms"] as string,
    });
    return;
  }

  if (command === "callback") {
    const { positionals, values } = parseAuthArgs(args, {
      port: { default: String(DEFAULT_CALLBACK_PORT), type: "string" },
    });
    assertPositionals(command, positionals, 1);
    await callback(positionals[0] ?? "", {
      ...sharedAuthValues(values),
      port: values.port as string,
    });
    return;
  }

  if (command === "logout") {
    const { positionals, values } = parseAuthArgs(args, {
      all: { default: false, type: "boolean" },
    });
    assertPositionals(command, positionals, 0);
    await logout({
      ...sharedAuthValues(values),
      all: values.all as boolean,
    });
    return;
  }

  throw new Error(`Unknown auth command: ${command}`);
};

if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}
