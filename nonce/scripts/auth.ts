import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import type { Socket } from "node:net";

import { auth } from "@modelcontextprotocol/sdk/client/auth.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { Command } from "commander";

import {
  DEFAULT_CALLBACK_PORT,
  DEFAULT_MCP_ENDPOINT,
  DEFAULT_PROFILE,
  OAUTH_CALLBACK_PATH,
} from "../assets/runtime/src/constants.js";
import {
  createOAuthProvider,
  type LocalNonceOAuthProvider,
} from "../assets/runtime/src/oauth-provider.js";
import { normalizeProfile } from "../assets/runtime/src/profile.js";
import { getCliArgv } from "./argv.js";

export const authCommandName = "nonce auth";

interface SharedAuthOptions {
  endpoint?: string;
  fileCredentials?: boolean;
  profile?: string;
}

const createProviderFromOptions = (
  options: SharedAuthOptions & { noOpen?: boolean; port?: string },
): LocalNonceOAuthProvider => {
  const port = Number(options.port ?? DEFAULT_CALLBACK_PORT);
  return createOAuthProvider({
    endpoint: options.endpoint ?? DEFAULT_MCP_ENDPOINT,
    openBrowser: !options.noOpen,
    preferFileCredentials: options.fileCredentials,
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
        res.end("Nonce MCP authentication completed. You can close this window.", () => {
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

const assertState = async (
  provider: LocalNonceOAuthProvider,
  receivedState: string | undefined,
): Promise<void> => {
  const expectedState = await provider.expectedState();
  if (expectedState && receivedState && expectedState !== receivedState) {
    throw new Error("OAuth callback state does not match the pending login state");
  }
};

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
  options: SharedAuthOptions & { noOpen?: boolean; port?: string; timeoutMs?: string },
): Promise<void> => {
  const provider = createProviderFromOptions(options);
  const existingTokens = await provider.tokens();
  if (existingTokens?.refresh_token) {
    const existing = await auth(provider, { serverUrl: provider.endpoint });
    if (existing === "AUTHORIZED") {
      await status(options);
      return;
    }
  }

  const listener = await createCallbackListener(provider, Number(options.timeoutMs ?? 180_000));
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

  const callback = await listener.wait();
  await assertState(provider, callback.state);
  await auth(provider, { authorizationCode: callback.code, serverUrl: provider.endpoint });
  await status(options);
};

const callback = async (
  callbackValue: string,
  options: SharedAuthOptions & { port?: string },
): Promise<void> => {
  const provider = createProviderFromOptions(options);
  const parsed = parseCallback(callbackValue);
  await assertState(provider, parsed.state);
  await auth(provider, { authorizationCode: parsed.code, serverUrl: provider.endpoint });
  await status(options);
};

const verify = async (options: SharedAuthOptions): Promise<void> => {
  const provider = createProviderFromOptions(options);
  const tokens = await provider.tokens();
  if (!tokens?.access_token && !tokens?.refresh_token) {
    throw new Error("Not authenticated. Run `vp run nonce:auth -- login` first.");
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

const addSharedOptions = (command: Command): Command =>
  command
    .option("--endpoint <url>", "Nonce MCP endpoint", DEFAULT_MCP_ENDPOINT)
    .option("--file-credentials", "store secrets in the local file fallback")
    .option("--profile <name>", "credential profile", DEFAULT_PROFILE);

const main = async (): Promise<void> => {
  const program = new Command()
    .name("nonce auth")
    .description("Authenticate the local Nonce MCP SDK runtime");

  addSharedOptions(
    program.command("status").description("show local authentication status"),
  ).action(status);

  addSharedOptions(
    program
      .command("login")
      .description("start OAuth login using a local callback server")
      .option("--no-open", "print the authorization URL instead of opening a browser")
      .option("--port <port>", "local callback port", String(DEFAULT_CALLBACK_PORT))
      .option("--timeout-ms <ms>", "callback wait timeout", "180000"),
  ).action(login);

  addSharedOptions(
    program
      .command("callback")
      .description("exchange a pasted OAuth callback URL or authorization code")
      .argument("<callback>", "callback URL or authorization code")
      .option("--port <port>", "local callback port", String(DEFAULT_CALLBACK_PORT)),
  ).action(callback);

  addSharedOptions(
    program
      .command("verify")
      .description("verify saved OAuth credentials by initializing MCP and listing tools"),
  ).action(verify);

  addSharedOptions(
    program
      .command("logout")
      .description("clear saved OAuth tokens")
      .option("--all", "also clear client registration and discovery state"),
  ).action(logout);

  program.parse(getCliArgv());
};

if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}
