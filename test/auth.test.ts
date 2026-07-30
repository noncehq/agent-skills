import { createServer } from "node:http";
import type { AddressInfo } from "node:net";

import { describe, expect, it } from "vite-plus/test";

import { createCredentialStore } from "../src/runtime/credential-store.js";
import { redirectToAuthorizationUrl } from "../src/runtime/oauth-provider.js";
import { normalizeProfile } from "../src/runtime/profile.js";
import {
  assertState,
  consumeState,
  createCallbackListener,
  hasCurrentLoginTokens,
  parseCallback,
} from "../src/skill-scripts/auth.js";
import { parseTimeoutMs } from "../src/skill-scripts/cli-options.js";

describe("auth helpers", () => {
  const reservePort = async (): Promise<number> => {
    const server = createServer();
    await new Promise<void>((resolve, reject) => {
      server.once("error", reject);
      server.listen(0, "127.0.0.1", resolve);
    });
    const port = (server.address() as AddressInfo).port;
    await new Promise<void>((resolve) => server.close(() => resolve()));
    return port;
  };

  it("parses callback URLs without exposing tokens", () => {
    expect(parseCallback("http://127.0.0.1:33418/callback?code=abc&state=xyz")).toEqual({
      code: "abc",
      state: "xyz",
    });
  });

  it("rejects unsafe profile names", () => {
    expect(() => normalizeProfile("../secret")).toThrow("Profile may only contain");
  });

  it("fails closed when an OAuth callback omits or changes the pending state", async () => {
    const provider = {
      expectedState: async () => "expected-state",
    };

    await expect(assertState(provider, undefined)).rejects.toThrow("missing state");
    await expect(assertState(provider, "other-state")).rejects.toThrow("does not match");
    await expect(assertState(provider, "expected-state")).resolves.toBeUndefined();
    await expect(
      assertState({ expectedState: async () => undefined }, "unexpected-state"),
    ).rejects.toThrow("no pending login state");
  });

  it("consumes a valid OAuth state exactly once", async () => {
    let expectedState: string | undefined = "expected-state";
    const provider = {
      clearExpectedState: async () => {
        expectedState = undefined;
      },
      expectedState: async () => expectedState,
    };

    await expect(consumeState(provider, "expected-state")).resolves.toBeUndefined();
    await expect(consumeState(provider, "expected-state")).rejects.toThrow(
      "no pending login state",
    );
  });

  it("validates and consumes callback state before reporting browser success", async () => {
    let expectedState: string | undefined = "expected-state";
    const port = await reservePort();
    const provider = {
      clearExpectedState: async () => {
        expectedState = undefined;
      },
      expectedState: async () => expectedState,
      redirectUrl: `http://127.0.0.1:${port}/callback`,
    };
    const listener = await createCallbackListener(provider, 2_000);
    const callback = listener.wait();

    const response = await fetch(
      `http://127.0.0.1:${port}/callback?code=authorization-code&state=expected-state`,
    );

    expect(response.status).toBe(200);
    expect(await response.text()).toContain("callback accepted");
    expect(expectedState).toBeUndefined();
    await expect(callback).resolves.toEqual({
      code: "authorization-code",
      state: "expected-state",
    });
  });

  it("returns an error page for a callback with invalid state", async () => {
    const port = await reservePort();
    const provider = {
      clearExpectedState: async () => {},
      expectedState: async () => "expected-state",
      redirectUrl: `http://127.0.0.1:${port}/callback`,
    };
    const listener = await createCallbackListener(provider, 2_000);
    const callbackError = listener.wait().catch((error: unknown) => error);

    const response = await fetch(
      `http://127.0.0.1:${port}/callback?code=authorization-code&state=wrong-state`,
    );

    expect(response.status).toBe(400);
    expect(await response.text()).toContain("authentication failed");
    await expect(callbackError).resolves.toEqual(expect.any(Error));
  });

  it("prints the authorization URL without launching a subprocess", async () => {
    const logs: string[] = [];
    const authorizationUrl = new URL("https://example.test/oauth");

    await redirectToAuthorizationUrl(authorizationUrl, {
      log: (message) => logs.push(message),
    });

    expect(JSON.parse(logs[0] ?? "{}")).toEqual({
      authorizationUrl: "https://example.test/oauth",
      browserOpen: "skipped",
    });
  });

  it("only treats tokens saved for the current login as manual callback success", () => {
    const baseline = {
      savedAfter: Date.parse("2026-06-19T00:00:00.000Z"),
      tokenFingerprint: JSON.stringify({
        access_token: "old-access",
        refresh_token: undefined,
        scope: undefined,
        token_type: "Bearer",
      }),
    };

    expect(
      hasCurrentLoginTokens(
        { access_token: "old-access", token_type: "Bearer" },
        { savedAt: "2026-06-18T23:59:59.000Z" },
        baseline,
      ),
    ).toBe(false);
    expect(
      hasCurrentLoginTokens(
        { access_token: "old-access", token_type: "Bearer" },
        { savedAt: "2026-06-19T00:00:01.000Z" },
        baseline,
      ),
    ).toBe(true);
    expect(
      hasCurrentLoginTokens(
        { access_token: "new-access", token_type: "Bearer" },
        { savedAt: "2026-06-18T23:59:59.000Z" },
        baseline,
      ),
    ).toBe(true);
  });
});

describe("CLI option helpers", () => {
  it("requires positive finite integer timeouts", () => {
    expect(parseTimeoutMs("60000", "--timeout-ms", 1000)).toBe(60_000);
    expect(parseTimeoutMs(undefined, "--timeout-ms", 1000)).toBe(1000);
    expect(() => parseTimeoutMs("NaN", "--timeout-ms", 1000)).toThrow("--timeout-ms");
    expect(() => parseTimeoutMs("0", "--timeout-ms", 1000)).toThrow("--timeout-ms");
    expect(() => parseTimeoutMs("1.5", "--timeout-ms", 1000)).toThrow("--timeout-ms");
  });
});

describe("credential store selection", () => {
  it("always uses local file credential storage", () => {
    expect(createCredentialStore({ profile: "test" }).kind).toBe("local-file");
  });
});
