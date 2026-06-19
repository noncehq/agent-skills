import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vite-plus/test";

import { createCredentialStore } from "../src/runtime/credential-store.js";
import { normalizeProfile } from "../src/runtime/profile.js";
import {
  hasCurrentLoginTokens,
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
  it("always uses local file credential storage", () => {
    expect(createCredentialStore({ profile: "test" }).kind).toBe("local-file");
  });

  it("does not include OS credential store integrations", async () => {
    const source = await readFile(
      new URL("../src/runtime/credential-store.ts", import.meta.url),
      "utf8",
    );

    expect(source).not.toContain("add-generic-password");
    expect(source).not.toContain("ProtectedData");
    expect(source).not.toContain("macos-keychain");
    expect(source).not.toContain("windows-dpapi");
  });
});
