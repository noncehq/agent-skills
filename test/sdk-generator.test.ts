import { describe, expect, it } from "vite-plus/test";

import { generateArtifacts } from "../nonce/scripts/sdk-generator/artifacts.js";
import { buildOpenApiIndex, type OpenApiDocument } from "../nonce/scripts/sdk-generator/openapi.js";
import { methodNameForTool, schemaToType } from "../nonce/scripts/sdk-generator/schema.js";

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
    expect(artifacts.signatures).toContain("listFarms(input: ListFarmsInput");
    expect(artifacts.signatures).toContain("export interface ListFarmsOutput");
  });
});
