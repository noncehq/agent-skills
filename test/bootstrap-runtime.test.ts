import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vite-plus/test";

import {
  EXPECTED_NODE_VERSION,
  runtimeCheckExitCode,
} from "../src/skill-scripts/bootstrap-runtime.js";

describe("bootstrap runtime helpers", () => {
  it("fails closed when the platform or Vite+ runtime is unhealthy", () => {
    expect(
      runtimeCheckExitCode({ nodeVersionOk: true, supported: true, vpEnvCurrentOk: true }),
    ).toBe(0);
    expect(
      runtimeCheckExitCode({ nodeVersionOk: true, supported: false, vpEnvCurrentOk: true }),
    ).toBe(1);
    expect(
      runtimeCheckExitCode({ nodeVersionOk: true, supported: true, vpEnvCurrentOk: false }),
    ).toBe(1);
    expect(
      runtimeCheckExitCode({ nodeVersionOk: false, supported: true, vpEnvCurrentOk: true }),
    ).toBe(1);
  });

  it("pins and installs the Vite+ managed Node LTS runtime", async () => {
    const macScript = await readFile("skills/scripts/bootstrap-runtime.sh", "utf8");
    const windowsScript = await readFile("skills/scripts/bootstrap-runtime.ps1", "utf8");

    expect(EXPECTED_NODE_VERSION).toBe("24.17.0");
    for (const script of [macScript, windowsScript]) {
      expect(script).toContain("vp env setup");
      expect(script).toContain("vp env on");
      expect(script).toContain(`vp env install ${EXPECTED_NODE_VERSION}`);
      expect(script).toContain("vp env doctor");
      expect(script).not.toContain("vp install");
    }
  });
});
