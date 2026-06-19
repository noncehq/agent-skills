import { describe, expect, it } from "vite-plus/test";

import { generateArtifacts } from "../src/sdk-generator/artifacts.js";
import { buildOpenApiIndex, type OpenApiDocument } from "../src/sdk-generator/openapi.js";
import {
  inferJsonSchemaFromValue,
  methodNameForTool,
  schemaToType,
} from "../src/sdk-generator/schema.js";

const typeScriptFences = (markdown: string): string[] =>
  [...markdown.matchAll(/```ts\n([\s\S]*?)\n```/g)].map((match) => match[1] ?? "");

const declarationSemicolonPattern =
  /^[ \t]*(?:(?:export[ \t]+)?(?:type|interface)\b|(?:[A-Za-z_$][\w$]*|"[^"]+"|'[^']+'|\[[^\]]+\])\??:|\[key:[^\]]+\]:|[A-Za-z_$][\w$]*\([^)]*\):).+;[ \t]*$/m;

describe("SDK generator helpers", () => {
  it("normalizes MCP tool names into SDK method names", () => {
    expect(methodNameForTool("CreateTaskBatch_MinerPower_modeUpdate")).toBe(
      "createTaskBatchMinerPowerModeUpdate",
    );
  });

  it("converts JSON Schema unions and object properties into TypeScript", () => {
    expect(
      schemaToType({
        anyOf: [{ enum: ["low", "normal"] }, { type: "null" }],
      }),
    ).toBe('"low" | "normal" | null');

    expect(
      schemaToType({
        properties: {
          mode: { type: "string" },
        },
        required: ["mode"],
        type: "object",
      }),
    ).toContain("mode: string");
  });

  it("infers JSON Schema from observed ListWorkspaces output without preserving values", () => {
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

    expect(schemaToType(schema)).toContain("workspace_id: string");
    expect(schemaToType(schema)).toContain("error: null");
    expect(JSON.stringify(schema)).not.toContain("org_123");
    expect(JSON.stringify(schema)).not.toContain("Demo");
  });

  it("keeps MCP schemas primary and supplements missing output from OpenAPI", () => {
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

    const artifacts = generateArtifacts(
      {
        mcpEndpoint: "https://mcp.nonce.app/mcp",
        tools: [
          {
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
    expect(artifacts.manifest).not.toHaveProperty("generatedBy");
    expect(artifacts.schemas).not.toHaveProperty("generatedBy");
    expect(artifacts.signatures).not.toContain("scripts/generate-nonce-sdk.ts");
    expect(artifacts.signatures).toContain("listFarms(input: ListFarmsInput");
    expect(artifacts.signatures).toContain("export interface ListFarmsOutput");
    expect(artifacts.referenceMarkdown).toContain("compact index");
    expect(artifacts.referenceMarkdown).toContain(
      "read the method's schema file under `assets/schemas/`",
    );
    expect(artifacts.referenceMarkdown).toContain("required: workspace_id");
    expect(artifacts.referenceMarkdown).toContain("Runtime calls must go through the local SDK");
    expect(artifacts.referenceMarkdown).toContain(
      'import { createNonceClient } from "../../scripts/skill-runtime.mjs"',
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
    expect(listFarmsFile).toContain("interface ListFarmsInput");
    expect(listFarmsFile).toContain("interface ListFarmsOutput");
    expect(listFarmsFile).toContain("workspace_id");
    expect(listFarmsFile).not.toContain("export ");

    const generatedTypeScript = [
      artifacts.referenceMarkdown,
      ...artifacts.methodSchemaFiles.values(),
    ]
      .flatMap(typeScriptFences)
      .join("\n");
    expect(generatedTypeScript).not.toMatch(declarationSemicolonPattern);
  });

  it("uses observed read-only MCP output when MCP and OpenAPI output schemas are missing", () => {
    const artifacts = generateArtifacts({
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
    expect(wsFile).not.toContain("export ");
  });
});
