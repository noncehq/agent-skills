import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vite-plus/test";

import {
  EXPECTED_NODE_VERSION,
  isSupportedPlatform,
  runtimeCheckExitCode,
} from "../src/skill-scripts/bootstrap-runtime.js";

describe("bootstrap runtime helpers", () => {
  it("supports the installed skill target platforms", () => {
    expect(isSupportedPlatform("darwin")).toBe(true);
    expect(isSupportedPlatform("linux")).toBe(true);
    expect(isSupportedPlatform("win32")).toBe(true);
    expect(isSupportedPlatform("freebsd")).toBe(false);
  });

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
    const posixScript = await readFile("skills/scripts/bootstrap-runtime.sh", "utf8");
    const windowsScript = await readFile("skills/scripts/bootstrap-runtime.ps1", "utf8");

    expect(posixScript).toContain("Darwin|Linux");
    expect(posixScript).toContain("macOS and Linux");
    expect(posixScript).not.toContain('!= "Darwin"');
    expect(EXPECTED_NODE_VERSION).toBe("24.17.0");
    for (const script of [posixScript, windowsScript]) {
      expect(script).toContain("vp env setup");
      expect(script).toContain("vp env on");
      expect(script).toContain(`vp env install ${EXPECTED_NODE_VERSION}`);
      expect(script).toContain("vp env doctor");
      expect(script).not.toContain("vp install");
    }
  });
});
