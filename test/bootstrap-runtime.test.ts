import { describe, expect, it } from "vite-plus/test";

import { runtimeCheckExitCode } from "../nonce/scripts/bootstrap-runtime.js";

describe("bootstrap runtime helpers", () => {
  it("fails closed when the platform or Vite+ runtime is unhealthy", () => {
    expect(runtimeCheckExitCode({ supported: true, vpEnvCurrentOk: true })).toBe(0);
    expect(runtimeCheckExitCode({ supported: false, vpEnvCurrentOk: true })).toBe(1);
    expect(runtimeCheckExitCode({ supported: true, vpEnvCurrentOk: false })).toBe(1);
  });
});
