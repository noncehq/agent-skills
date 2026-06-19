import { describe, expect, it } from "vite-plus/test";

import { normalizeProfile } from "../nonce/assets/runtime/src/profile.js";
import { parseCallback } from "../nonce/scripts/auth.js";

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
});
