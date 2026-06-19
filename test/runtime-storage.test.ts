import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vite-plus/test";

import { createCredentialStore } from "../src/runtime/credential-store.js";
import { createStateStore } from "../src/runtime/state-store.js";

describe("runtime file stores", () => {
  it("round-trips JSON state under a caller-provided base directory", async () => {
    const baseDir = await mkdtemp(join(tmpdir(), "nonce-state-store-"));
    try {
      const store = createStateStore("test-local", baseDir);

      await store.setJson("pending/authorization", {
        authorizationUrl: "https://example.test/oauth",
        createdAt: "2026-06-19T00:00:00.000Z",
      });

      expect(await store.getJson("pending/authorization")).toEqual({
        authorizationUrl: "https://example.test/oauth",
        createdAt: "2026-06-19T00:00:00.000Z",
      });

      const stateFile = join(baseDir, "test-local", "pending-authorization.json");
      expect(await readFile(stateFile, "utf8")).toContain('"authorizationUrl"');
      if (process.platform !== "win32") {
        expect((await stat(stateFile)).mode & 0o777).toBe(0o600);
      }

      await store.delete("pending/authorization");
      expect(await store.getJson("pending/authorization")).toBeUndefined();
    } finally {
      await rm(baseDir, { force: true, recursive: true });
    }
  });

  it("round-trips credentials without touching OS credential stores", async () => {
    const baseDir = await mkdtemp(join(tmpdir(), "nonce-credential-store-"));
    try {
      const store = createCredentialStore({ baseDir, profile: "test-local" });

      await store.set("oauth/tokens", "secret-json");

      expect(store.kind).toBe("local-file");
      expect(await store.get("oauth/tokens")).toBe("secret-json");

      const credentialFile = join(baseDir, "test-local", "credentials", "oauth-tokens.secret");
      expect(await readFile(credentialFile, "utf8")).toBe("secret-json");
      if (process.platform !== "win32") {
        expect((await stat(credentialFile)).mode & 0o777).toBe(0o600);
      }

      await store.delete("oauth/tokens");
      expect(await store.get("oauth/tokens")).toBeUndefined();
    } finally {
      await rm(baseDir, { force: true, recursive: true });
    }
  });
});
