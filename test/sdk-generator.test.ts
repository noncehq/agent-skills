import { describe, expect, it } from "vite-plus/test";

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

describe("SDK generator helpers", () => {
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
});
