import { describe, expect, it } from "vite-plus/test";

import { resolveDestructiveAllowance } from "../src/runtime/nonce-client.js";

describe("nonce client destructive allowance", () => {
  it("requires explicit in-process approval and ignores ambient environment variables", () => {
    process.env.NONCE_ALLOW_DESTRUCTIVE = "1";
    try {
      expect(resolveDestructiveAllowance(undefined)).toBe(false);
      expect(resolveDestructiveAllowance(false)).toBe(false);
      expect(resolveDestructiveAllowance(true)).toBe(true);
    } finally {
      delete process.env.NONCE_ALLOW_DESTRUCTIVE;
    }
  });
});
