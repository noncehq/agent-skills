import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vite-plus/test";

import {
  EXPECTED_NODE_VERSION,
  MINIMUM_NODE_MAJOR_VERSION,
  buildSandboxWriteDiagnostics,
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
    expect(isNodeVersionSupported("not-a-version")).toBe(false);
  });

  it("fails closed when the platform or direct Node runtime is unhealthy", () => {
    expect(runtimeCheckExitCode({ nodeVersionOk: true, supported: true })).toBe(0);
    expect(runtimeCheckExitCode({ nodeVersionOk: true, supported: false })).toBe(1);
    expect(runtimeCheckExitCode({ nodeVersionOk: false, supported: true })).toBe(1);
  });

  it("recommends an external task directory when the installed skill root is not writable", () => {
    const diagnostics = buildSandboxWriteDiagnostics({
      credentialDirProbe: {
        path: "/state/nonce-skill/test-local/credentials",
        writable: true,
      },
      fallbackTaskDir: { path: "/tmp/nonce-skill-tasks", writable: true },
      profile: "test-local",
      skillRoot: "/readonly/nonce",
      skillRootProbe: {
        error: "EACCES",
        path: "/readonly/nonce/.nonce-skill/diagnostics",
        writable: false,
      },
      stateDirProbe: { path: "/state/nonce-skill", writable: true },
      stateProfileDirProbe: { path: "/state/nonce-skill/test-local", writable: true },
      taskDirProbe: {
        error: "EROFS",
        path: "/readonly/nonce/.nonce-skill/tasks",
        writable: false,
      },
    });

    expect(diagnostics).toMatchObject({
      credentialDirWritable: true,
      profile: "test-local",
      recommendedTaskDir: "/tmp/nonce-skill-tasks",
      skillRootWritable: false,
      stateProfileDirWritable: true,
      stateDirWritable: true,
      taskDirWritable: false,
    });
    expect(diagnostics.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "/readonly/nonce/.nonce-skill/diagnostics",
          severity: "warning",
        }),
        expect.objectContaining({
          path: "/readonly/nonce/.nonce-skill/tasks",
          remediation: expect.stringContaining("/tmp/nonce-skill-tasks"),
          severity: "warning",
        }),
      ]),
    );
  });

  it("reports OAuth credential cache permission failures separately", () => {
    const diagnostics = buildSandboxWriteDiagnostics({
      credentialDirProbe: {
        error: "EACCES",
        path: "/state/nonce-skill/test-local/credentials",
        writable: false,
      },
      fallbackTaskDir: { path: "/tmp/nonce-skill-tasks", writable: true },
      profile: "test-local",
      skillRoot: "/installed/nonce",
      skillRootProbe: { path: "/installed/nonce/.nonce-skill/diagnostics", writable: true },
      stateDirProbe: { path: "/state/nonce-skill", writable: true },
      stateProfileDirProbe: { path: "/state/nonce-skill/test-local", writable: true },
      taskDirProbe: { path: "/installed/nonce/.nonce-skill/tasks", writable: true },
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

  it("uses direct node commands in installed skill docs", async () => {
    const authReference = await readFile("skills/references/auth.md", "utf8");
    const workflowReference = await readFile("skills/references/workflow.md", "utf8");

    expect(authReference).toContain("node scripts/auth.mjs login");
    expect(workflowReference).toContain("node scripts/bootstrap-runtime.mjs --json");
    expect(workflowReference).toContain("NONCE_SKILL_RUNTIME_URL");
    expect(`${authReference}\n${workflowReference}`).not.toContain("vp node --");
  });
});
