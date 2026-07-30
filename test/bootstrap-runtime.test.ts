import { describe, expect, it } from "vite-plus/test";

import {
  MINIMUM_NODE_MAJOR_VERSION,
  buildRuntimeWriteDiagnostics,
  isNodeVersionSupported,
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

  it("accepts direct Node runtimes that can run ESM skill scripts", () => {
    expect(MINIMUM_NODE_MAJOR_VERSION).toBe(22);
    expect(isNodeVersionSupported("v22.0.0")).toBe(true);
    expect(isNodeVersionSupported("24.17.0")).toBe(true);
    expect(isNodeVersionSupported("v21.9.0")).toBe(false);
    expect(isNodeVersionSupported("v25.0.0")).toBe(false);
    expect(isNodeVersionSupported("v26.5.0")).toBe(false);
    expect(isNodeVersionSupported("not-a-version")).toBe(false);
  });

  it("fails closed when the platform or direct Node runtime is unhealthy", () => {
    expect(runtimeCheckExitCode({ nodeVersionOk: true, supported: true })).toBe(0);
    expect(runtimeCheckExitCode({ nodeVersionOk: true, supported: false })).toBe(1);
    expect(runtimeCheckExitCode({ nodeVersionOk: false, supported: true })).toBe(1);
  });

  it("requires project-owned data to be writable outside the installed skill", () => {
    const diagnostics = buildRuntimeWriteDiagnostics({
      credentialDirProbe: {
        path: "/state/nonce-skill/test-local/credentials",
        writable: true,
      },
      dataDirProbe: {
        error: "EROFS",
        path: "/project/.nonce",
        writable: false,
      },
      profile: "test-local",
      stateDirProbe: { path: "/state/nonce-skill", writable: true },
      stateProfileDirProbe: { path: "/state/nonce-skill/test-local", writable: true },
    });

    expect(diagnostics).toMatchObject({
      credentialDirWritable: true,
      dataDir: "/project/.nonce",
      dataDirWritable: false,
      profile: "test-local",
      stateProfileDirWritable: true,
      stateDirWritable: true,
    });
    expect(diagnostics.diagnostics).toEqual([
      expect.objectContaining({
        path: "/project/.nonce",
        remediation: expect.stringContaining("--project-dir"),
        severity: "error",
      }),
    ]);
  });

  it("reports OAuth credential cache permission failures separately", () => {
    const diagnostics = buildRuntimeWriteDiagnostics({
      credentialDirProbe: {
        error: "EACCES",
        path: "/state/nonce-skill/test-local/credentials",
        writable: false,
      },
      dataDirProbe: { path: "/project/.nonce", writable: true },
      profile: "test-local",
      stateDirProbe: { path: "/state/nonce-skill", writable: true },
      stateProfileDirProbe: { path: "/state/nonce-skill/test-local", writable: true },
    });

    expect(diagnostics).toMatchObject({
      credentialDir: "/state/nonce-skill/test-local/credentials",
      credentialDirWritable: false,
      stateDirWritable: true,
      stateProfileDirWritable: true,
    });
    expect(diagnostics.diagnostics).toEqual([
      expect.objectContaining({
        message: expect.stringContaining("OAuth credential cache"),
        path: "/state/nonce-skill/test-local/credentials",
        severity: "error",
      }),
    ]);
  });
});
