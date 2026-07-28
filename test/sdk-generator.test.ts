import type {
  OAuthClientInformationMixed,
  OAuthTokens,
} from "@modelcontextprotocol/sdk/shared/auth.js";
import { mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vite-plus/test";

import {
  refreshNonceAccessToken,
  removeStaleGeneratedSchemas,
} from "../scripts/generate-nonce-sdk.js";
import type { NonceOAuthProvider } from "../src/runtime/oauth-provider.js";
import { generateArtifacts } from "../src/sdk-generator/artifacts.js";
import { buildOpenApiIndex, type OpenApiDocument } from "../src/sdk-generator/openapi.js";
import {
  inferJsonSchemaFromValue,
  methodNameForTool,
  schemaToTypeScriptDeclaration,
} from "../src/sdk-generator/schema.js";

const typeScriptFences = (markdown: string): string[] => {
  const blocks: string[] = [];
  const startMarker = "```ts\n";
  const endMarker = "\n```";
  let offset = 0;

  while (offset < markdown.length) {
    const start = markdown.indexOf(startMarker, offset);
    if (start === -1) return blocks;

    const contentStart = start + startMarker.length;
    const end = markdown.indexOf(endMarker, contentStart);
    if (end === -1) return blocks;

    blocks.push(markdown.slice(contentStart, end));
    offset = end + endMarker.length;
  }

  return blocks;
};

const semicolonLines = (source: string): string[] =>
  source.split("\n").filter((line) => line.trimEnd().endsWith(";"));

const occurrences = (source: string, needle: string): number => source.split(needle).length - 1;

const createRefreshProvider = (
  initialTokens: OAuthTokens | undefined,
  initialClientInformation: OAuthClientInformationMixed | undefined = { client_id: "client-id" },
): { provider: NonceOAuthProvider; savedTokens: () => OAuthTokens | undefined } => {
  let clientInformation: OAuthClientInformationMixed | undefined = initialClientInformation;
  let tokens = initialTokens;

  const provider: NonceOAuthProvider = {
    clientMetadata: {
      client_name: "Nonce Skill Test",
      grant_types: ["authorization_code", "refresh_token"],
      redirect_uris: ["http://127.0.0.1:33418/callback"],
      response_types: ["code"],
      token_endpoint_auth_method: "none",
    },
    credentialStoreKind: "memory",
    endpoint: "https://mcp.nonce.app/mcp",
    redirectUrl: "http://127.0.0.1:33418/callback",
    clearAll: async () => {
      tokens = undefined;
      clientInformation = undefined;
    },
    clearTokens: async () => {
      tokens = undefined;
    },
    clientInformation: async () => clientInformation,
    codeVerifier: async () => "verifier",
    redirectToAuthorization: async () => {
      throw new Error("unexpected authorization redirect");
    },
    saveClientInformation: async (value) => {
      clientInformation = value;
    },
    saveCodeVerifier: async () => {},
    saveTokens: async (value) => {
      tokens = value;
    },
    tokenMetadata: async () => undefined,
    tokens: async () => tokens,
  };

  return {
    provider,
    savedTokens: () => tokens,
  };
};

describe("SDK generator helpers", () => {
  it("removes Markdown schemas that are absent from the current MCP contract", async () => {
    const schemasDir = await mkdtemp(join(tmpdir(), "nonce-generated-schemas-"));

    try {
      await Promise.all([
        writeFile(join(schemasDir, "current.md"), "current"),
        writeFile(join(schemasDir, "stale.md"), "stale"),
        writeFile(join(schemasDir, "notes.txt"), "keep"),
      ]);

      await removeStaleGeneratedSchemas(schemasDir, ["current.md"]);

      expect((await readdir(schemasDir)).sort()).toEqual(["current.md", "notes.txt"]);
    } finally {
      await rm(schemasDir, { force: true, recursive: true });
    }
  });

  it("refreshes saved OAuth tokens before live SDK inspection", async () => {
    const { provider, savedTokens } = createRefreshProvider({
      access_token: "old-access-token",
      refresh_token: "saved-refresh-token",
      token_type: "Bearer",
    });

    await refreshNonceAccessToken(provider, {
      discoverOAuthServerInfo: async () => ({
        authorizationServerUrl: "https://auth.nonce.test",
      }),
      refreshAuthorization: async (_authorizationServerUrl, options) => {
        expect(options.refreshToken).toBe("saved-refresh-token");
        return {
          access_token: "fresh-access-token",
          refresh_token: options.refreshToken,
          token_type: "Bearer",
        };
      },
      registerClient: async () => {
        throw new Error("client registration should not run when client information is cached");
      },
      selectResourceURL: async () => new URL("https://mcp.nonce.app/mcp"),
    });

    expect(savedTokens()?.access_token).toBe("fresh-access-token");
  });

  it("requires a refresh token before live SDK inspection", async () => {
    const { provider } = createRefreshProvider({
      access_token: "old-access-token",
      token_type: "Bearer",
    });

    await expect(
      refreshNonceAccessToken(provider, {
        discoverOAuthServerInfo: async () => {
          throw new Error("discovery should not run without a refresh token");
        },
        refreshAuthorization: async () => {
          throw new Error("refresh should not run without a refresh token");
        },
        registerClient: async () => {
          throw new Error("registration should not run without a refresh token");
        },
        selectResourceURL: async () => undefined,
      }),
    ).rejects.toThrow("refresh token");
  });

  it("normalizes MCP tool names into SDK method names", () => {
    expect(methodNameForTool("CreateTaskBatch_MinerPower_modeUpdate")).toBe(
      "createTaskBatchMinerPowerModeUpdate",
    );
  });

  it("converts JSON Schema unions and object properties into TypeScript", async () => {
    expect(
      (
        await schemaToTypeScriptDeclaration("GeneratedUnion", {
          anyOf: [{ enum: ["low", "normal"] }, { type: "null" }],
        })
      ).declaration,
    ).toContain('export type GeneratedUnion = ("low" | "normal") | null');

    expect(
      (
        await schemaToTypeScriptDeclaration("GeneratedObject", {
          properties: {
            mode: { type: "string" },
          },
          required: ["mode"],
          type: "object",
        })
      ).declaration,
    ).toContain("mode: string");
  });

  it("infers JSON Schema from observed ListWorkspaces output without preserving values", async () => {
    const schema = inferJsonSchemaFromValue({
      data: {
        data: [
          {
            role: "org:member",
            workspace_id: "org_123",
            workspace_name: "Demo",
            workspace_slug: "demo",
          },
        ],
        error: null,
        success: true,
      },
      status: 200,
    });
    const declaration = (await schemaToTypeScriptDeclaration("ListWorkspacesOutput", schema))
      .declaration;

    expect(declaration).toContain("workspace_id: string");
    expect(declaration).toContain("error: null");
    expect(JSON.stringify(schema)).not.toContain("org_123");
    expect(JSON.stringify(schema)).not.toContain("Demo");
  });

  it("keeps MCP schemas primary and supplements missing output from OpenAPI", async () => {
    const openApi: OpenApiDocument = {
      paths: {
        "/private-api/v1/{workspace_id}/farms": {
          get: {
            operationId: "ListFarms",
            parameters: [
              {
                in: "path",
                name: "workspace_id",
                required: true,
                schema: { type: "string" },
              },
            ],
            responses: {
              "200": {
                content: {
                  "application/json": {
                    schema: {
                      properties: {
                        success: { type: "boolean" },
                      },
                      required: ["success"],
                      type: "object",
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    const artifacts = await generateArtifacts(
      {
        mcpEndpoint: "https://mcp.nonce.app/mcp",
        tools: [
          {
            description: "List farms visible in a workspace.",
            inputSchema: {
              properties: {
                workspace_id: { type: "string" },
              },
              required: ["workspace_id"],
              type: "object",
            },
            name: "ListFarms",
          },
        ],
      },
      buildOpenApiIndex(openApi),
    );

    expect(artifacts.tools[0]?.inputSchemaSource).toBe("mcp");
    expect(artifacts.tools[0]?.outputSchemaSource).toBe("openapi");
    expect(artifacts.signatures).toContain("listFarms(input: ListFarmsInput");
    expect(artifacts.signatures).toContain("export interface ListFarmsOutput");
    expect(artifacts.referenceMarkdown).toContain("compact index");
    expect(artifacts.referenceMarkdown).toContain(
      "read the method's schema file under `assets/schemas/`",
    );
    expect(artifacts.referenceMarkdown).toContain("required: workspace_id");
    expect(artifacts.referenceMarkdown).toContain("Runtime calls must go through the local SDK");
    expect(artifacts.referenceMarkdown).toContain("credentialDirWritable: false");
    expect(artifacts.referenceMarkdown).toContain("taskDirWritable: true");
    expect(artifacts.referenceMarkdown).toContain(
      "await import(process.env.NONCE_SKILL_RUNTIME_URL)",
    );
    expect(artifacts.referenceMarkdown).toContain("const client = await createNonceClient()");
    expect(artifacts.referenceMarkdown).toContain("console.log(JSON.stringify({ farms }))");
    expect(artifacts.referenceMarkdown).toContain("Shared Types");
    expect(artifacts.referenceMarkdown).toContain("DestructiveCallOptions");
    expect(artifacts.referenceMarkdown).toContain("schemas/list-farms.md");
    expect(artifacts.referenceMarkdown).not.toContain('profile: "default"');

    expect(artifacts.methodSchemaFiles.size).toBe(1);
    const listFarmsFile = artifacts.methodSchemaFiles.get("list-farms.md");
    expect(listFarmsFile).toBeTruthy();
    expect(listFarmsFile).toContain("# listFarms");
    expect(listFarmsFile).toContain("## Purpose");
    expect(listFarmsFile).toContain("List farms visible in a workspace.");
    expect(listFarmsFile).toContain("export interface ListFarmsInput");
    expect(listFarmsFile).toContain("export interface ListFarmsOutput");
    expect(listFarmsFile).toContain("workspace_id");

    const generatedTypeScript = [
      artifacts.referenceMarkdown,
      ...artifacts.methodSchemaFiles.values(),
    ]
      .flatMap(typeScriptFences)
      .join("\n");
    expect(semicolonLines(generatedTypeScript)).toEqual([]);
  });

  it("uses observed read-only MCP output when MCP and OpenAPI output schemas are missing", async () => {
    const artifacts = await generateArtifacts({
      mcpEndpoint: "https://mcp.nonce.app/mcp",
      observedOutputSchemas: {
        ListWorkspaces: inferJsonSchemaFromValue({
          data: {
            data: [
              {
                role: "org:viewer",
                workspace_id: "org_123",
                workspace_name: "Demo",
                workspace_slug: "demo",
              },
            ],
            error: null,
            success: true,
          },
          status: 200,
        }),
      },
      tools: [
        {
          annotations: { readOnlyHint: true },
          inputSchema: {
            properties: {},
            type: "object",
          },
          name: "ListWorkspaces",
        },
      ],
    });

    expect(artifacts.tools[0]?.outputSchemaSource).toBe("observed-mcp");
    expect(artifacts.signatures).toContain("export interface ListWorkspacesOutput");
    expect(artifacts.signatures).toContain("workspace_slug: string");

    const wsFile = artifacts.methodSchemaFiles.get("list-workspaces.md");
    expect(wsFile).toContain("# listWorkspaces");
    expect(wsFile).toContain("workspace_slug: string");
    expect(wsFile).toContain("export interface ListWorkspacesOutput");
  });

  it("reuses matching shared nested interfaces and rejects name conflicts", async () => {
    const inputSchema = {
      properties: {},
      type: "object" as const,
    };
    const outputSchema = {
      properties: {
        data: {
          items: {
            properties: {
              id: { type: "string" },
            },
            required: ["id"],
            title: "SharedItem",
            type: "object",
          },
          type: "array",
        },
      },
      required: ["data"],
      type: "object" as const,
    };

    const artifacts = await generateArtifacts({
      mcpEndpoint: "https://mcp.nonce.app/mcp",
      tools: [
        { inputSchema, name: "ListAlpha", outputSchema },
        { inputSchema, name: "ListBeta", outputSchema },
      ],
    });

    expect(occurrences(artifacts.signatures, "export interface SharedItem")).toBe(1);
    expect(artifacts.signatures).toContain("data: SharedItem[]");

    await expect(
      generateArtifacts({
        mcpEndpoint: "https://mcp.nonce.app/mcp",
        tools: [
          { inputSchema, name: "ListAlpha", outputSchema },
          {
            inputSchema,
            name: "ListBeta",
            outputSchema: {
              properties: {
                data: {
                  items: {
                    properties: {
                      name: { type: "string" },
                    },
                    required: ["name"],
                    title: "SharedItem",
                    type: "object",
                  },
                  type: "array",
                },
              },
              required: ["data"],
              type: "object",
            },
          },
        ],
      }),
    ).rejects.toThrow("Generated TypeScript declaration name conflict: SharedItem");
  });
});
