import { describe, expect, it } from "vite-plus/test";

import { credentialStoreKindForPlatform } from "../nonce/assets/runtime/src/credential-store.js";
import { normalizeProfile } from "../nonce/assets/runtime/src/profile.js";
import { hasCurrentLoginTokens, parseCallback, shouldOpenBrowser } from "../nonce/scripts/auth.js";
import { parseTimeoutMs } from "../nonce/scripts/cli-options.js";

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

  it("maps Commander negative --no-open option to disabled browser launch", () => {
    expect(shouldOpenBrowser({ open: false })).toBe(false);
    expect(shouldOpenBrowser({ open: true })).toBe(true);
    expect(shouldOpenBrowser({})).toBe(true);
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
  it("uses OS-backed stores by default on supported platforms", () => {
    expect(credentialStoreKindForPlatform("darwin")).toBe("macos-keychain");
    expect(credentialStoreKindForPlatform("win32")).toBe("windows-dpapi");
    expect(credentialStoreKindForPlatform("win32", true)).toBe("local-file");
  });
});
