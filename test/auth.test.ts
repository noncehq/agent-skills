import { describe, expect, it } from "vite-plus/test";

import { createCredentialStore } from "../src/runtime/credential-store.js";
import { redirectToAuthorizationUrl } from "../src/runtime/oauth-provider.js";
import { normalizeProfile } from "../src/runtime/profile.js";
import {
  hasCurrentLoginTokens,
  isClearlyHeadlessLinux,
  parseCallback,
  shouldOpenBrowser,
} from "../src/skill-scripts/auth.js";
import { parseTimeoutMs } from "../src/skill-scripts/cli-options.js";

describe("auth helpers", () => {
  it("parses callback URLs without exposing tokens", () => {
    expect(parseCallback("http://127.0.0.1:33418/callback?code=abc&state=xyz")).toEqual({
      code: "abc",
      state: "xyz",
    });
  });

  it("rejects unsafe profile names", () => {
    expect(() => normalizeProfile("../secret")).toThrow("Profile may only contain");
  });

  it("uses browser login unless disabled or the Linux environment is clearly headless", () => {
    expect(shouldOpenBrowser({ open: false })).toBe(false);
    expect(shouldOpenBrowser({ open: true }, { env: {}, platform: "linux" })).toBe(true);
    expect(shouldOpenBrowser({}, { env: {}, platform: "darwin" })).toBe(true);
    expect(shouldOpenBrowser({}, { env: { DISPLAY: ":0" }, platform: "linux" })).toBe(true);
    expect(shouldOpenBrowser({}, { env: { BROWSER: "xdg-open" }, platform: "linux" })).toBe(true);
    expect(
      shouldOpenBrowser({}, { env: { WSL_INTEROP: "/run/WSL/1_interop" }, platform: "linux" }),
    ).toBe(true);
    expect(shouldOpenBrowser({}, { env: {}, platform: "linux" })).toBe(false);
    expect(isClearlyHeadlessLinux({ env: {}, platform: "linux" })).toBe(true);
  });

  it("prints the authorization URL when browser launch is skipped or fails", async () => {
    const skippedLogs: string[] = [];
    const failedLogs: string[] = [];
    const warnings: string[] = [];
    const authorizationUrl = new URL("https://example.test/oauth");

    await redirectToAuthorizationUrl(authorizationUrl, {
      log: (message) => skippedLogs.push(message),
      openAuthorizationUrl: async () => {
        throw new Error("should not open");
      },
      openBrowser: false,
      warn: (message) => warnings.push(message),
    });
    await redirectToAuthorizationUrl(authorizationUrl, {
      log: (message) => failedLogs.push(message),
      openAuthorizationUrl: async () => {
        throw new Error("no browser");
      },
      openBrowser: true,
      warn: (message) => warnings.push(message),
    });

    expect(JSON.parse(skippedLogs[0] ?? "{}")).toMatchObject({
      authorizationUrl: "https://example.test/oauth",
      browserOpen: "skipped",
    });
    expect(JSON.parse(failedLogs[0] ?? "{}")).toMatchObject({
      authorizationUrl: "https://example.test/oauth",
      browserOpen: "failed",
      reason: "no browser",
    });
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain("failed to open browser");
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
