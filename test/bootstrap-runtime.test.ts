import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vite-plus/test";

import { runtimeCheckExitCode } from "../nonce/scripts/bootstrap-runtime.js";

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
    const packageJson = JSON.parse(await readFile("nonce/package.json", "utf8")) as {
      devEngines?: { runtime?: { name?: string; onFail?: string; version?: string } };
    };
    const macScript = await readFile("nonce/scripts/bootstrap-runtime.sh", "utf8");
    const windowsScript = await readFile("nonce/scripts/bootstrap-runtime.ps1", "utf8");

    expect(packageJson.devEngines?.runtime).toEqual({
      name: "node",
      onFail: "download",
      version: "24.17.0",
    });
    for (const script of [macScript, windowsScript]) {
      expect(script).toContain("vp env setup");
      expect(script).toContain("vp env on");
      expect(script).toContain("vp env install");
      expect(script).toContain("vp env doctor");
    }
  });
});
