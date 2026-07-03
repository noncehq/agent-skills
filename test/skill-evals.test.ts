import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { describe, expect, it } from "vite-plus/test";

import {
  detectOrganicTrigger,
  passesClaudeEvalThresholds,
  summarizeClaudeEvalCases,
  type ClaudeEvalResult,
} from "../scripts/run-claude-evals.js";
import {
  passesCodexEvalThresholds,
  summarizeCodexEvalCases,
  type CodexEvalResult,
} from "../scripts/run-codex-evals.js";
import { runSkillEvals } from "../scripts/run-skill-evals.js";

describe("Nonce skill eval flow", () => {
  it("passes the local deterministic eval checks", async () => {
    const result = await runSkillEvals();

    expect(result.ok).toBe(true);
    expect(result.summary.totalCases).toBeGreaterThanOrEqual(20);
    expect(result.summary.positiveCases).toBe(result.summary.negativeCases);
    expect(result.summary.destructiveCases).toBeGreaterThan(0);
    expect(result.summary.errors).toBe(0);
  });

  it("scores the Codex eval summary with per-class thresholds", () => {
    const runs = [
      {
        case: { id: "trigger.a", split: "train" },
        checks: {
          confirmationPass: true,
          destructivePass: true,
          methodPrecision: 1,
          methodRecall: 1,
          negativeControlPass: true,
          referencePrecision: 1,
          referenceRecall: 1,
          routePass: true,
          schemaPrecision: 1,
          schemaRecall: 1,
        },
        criticalFailure: false,
        expected: { trigger: true },
        status: "completed",
        telemetry: { usage: { raw: { total_tokens: 10 } } },
      },
      {
        case: { id: "negative.a", split: "validation" },
        checks: {
          confirmationPass: true,
          destructivePass: true,
          methodPrecision: 1,
          methodRecall: 1,
          negativeControlPass: true,
          referencePrecision: 1,
          referenceRecall: 1,
          routePass: true,
          schemaPrecision: 1,
          schemaRecall: 1,
        },
        criticalFailure: false,
        expected: { trigger: false },
        status: "completed",
        telemetry: {},
      },
    ] as CodexEvalResult["cases"];

    const summary = summarizeCodexEvalCases(runs);

    expect(summary.overallAccuracy).toBe(1);
    expect(summary.positiveRecall).toBe(1);
    expect(summary.negativeSpecificity).toBe(1);
    expect(summary.meanMethodPrecision).toBe(1);
    expect(summary.usageSamples).toBe(1);
    expect(summary.splits.train?.totalRuns).toBe(1);
    expect(summary.splits.validation?.totalRuns).toBe(1);
    expect(
      passesCodexEvalThresholds(summary, {
        criticalFailuresAllowed: 0,
        minimumMeanMethodPrecision: 0.9,
        minimumMeanMethodRecall: 0.9,
        minimumMeanReferenceRecall: 0.9,
        minimumNegativeSpecificity: 0.9,
        minimumOverallAccuracy: 0.9,
        minimumPositiveRecall: 0.9,
        minimumSafetyAccuracy: 1,
      }),
    ).toBe(true);
  });

  it("keeps the local Codex eval config wired to the full case set", async () => {
    const config = JSON.parse(
      await readFile(resolve("evals/nonce-codex-eval.config.json"), "utf8"),
    ) as {
      caseSetPath: string;
      outputSchemaPath: string;
      runner: { runsPerCase: number; type: string };
      targetProvisioning: { mode: string };
      thresholds: { minimumMeanMethodPrecision: number };
    };
    const caseSet = JSON.parse(await readFile(resolve(config.caseSetPath), "utf8")) as {
      cases: unknown[];
    };
    const outputSchema = JSON.parse(await readFile(resolve(config.outputSchemaPath), "utf8")) as {
      required: string[];
    };

    expect(config.runner.type).toBe("codex-cli");
    expect(config.runner.runsPerCase).toBeGreaterThanOrEqual(3);
    expect(config.targetProvisioning.mode).toBe("isolated-skill-home");
    expect(config.thresholds.minimumMeanMethodPrecision).toBeGreaterThan(0.5);
    expect(caseSet.cases).toHaveLength(20);
    expect(outputSchema.required).toContain("should_use_nonce_skill");
  });

  it("scores the Claude Code eval summary with per-class thresholds", () => {
    const runs = [
      {
        case: { id: "trigger.a", split: "train" },
        checks: {
          confirmationPass: true,
          destructivePass: true,
          methodPrecision: 1,
          methodRecall: 1,
          negativeControlPass: true,
          referencePrecision: 1,
          referenceRecall: 1,
          routePass: true,
          schemaPrecision: 1,
          schemaRecall: 1,
        },
        criticalFailure: false,
        expected: { trigger: true },
        status: "completed",
        telemetry: { costUsd: 0.05, usage: { raw: { input_tokens: 5, output_tokens: 5 } } },
      },
      {
        case: { id: "negative.a", split: "validation" },
        checks: {
          confirmationPass: true,
          destructivePass: true,
          methodPrecision: 1,
          methodRecall: 1,
          negativeControlPass: true,
          referencePrecision: 1,
          referenceRecall: 1,
          routePass: true,
          schemaPrecision: 1,
          schemaRecall: 1,
        },
        criticalFailure: false,
        expected: { trigger: false },
        status: "completed",
        telemetry: {},
      },
    ] as ClaudeEvalResult["cases"];

    const summary = summarizeClaudeEvalCases(runs);

    expect(summary.overallAccuracy).toBe(1);
    expect(summary.positiveRecall).toBe(1);
    expect(summary.negativeSpecificity).toBe(1);
    expect(summary.meanMethodPrecision).toBe(1);
    expect(summary.usageSamples).toBe(1);
    expect(summary.totalCostUsd).toBe(0.05);
    expect(summary.splits.train?.overallAccuracy).toBe(1);
    expect(summary.splits.validation?.overallAccuracy).toBe(1);
    expect(
      passesClaudeEvalThresholds(summary, {
        criticalFailuresAllowed: 0,
        minimumMeanMethodPrecision: 0.9,
        minimumMeanMethodRecall: 0.9,
        minimumMeanReferenceRecall: 0.9,
        minimumNegativeSpecificity: 0.9,
        minimumOverallAccuracy: 0.9,
        minimumPositiveRecall: 0.9,
        minimumSafetyAccuracy: 1,
      }),
    ).toBe(true);
  });

  it("detects organic skill triggering from Claude tool events", () => {
    const triggeredStream = [
      JSON.stringify({
        message: {
          content: [{ input: { skill: "nonce" }, name: "Skill", type: "tool_use" }],
        },
        type: "assistant",
      }),
      JSON.stringify({
        message: {
          content: [
            {
              input: { file_path: "/tmp/workspace/.claude/skills/nonce/SKILL.md" },
              name: "Read",
              type: "tool_use",
            },
          ],
        },
        type: "assistant",
      }),
    ].join("\n");
    const untriggeredStream = [
      JSON.stringify({
        message: {
          content: [
            { input: { skill: "code-review" }, name: "Skill", type: "tool_use" },
            { input: { file_path: "/tmp/workspace/notes.md" }, name: "Read", type: "tool_use" },
          ],
        },
        type: "assistant",
      }),
      JSON.stringify({ result: "done", subtype: "success", type: "result" }),
    ].join("\n");

    expect(detectOrganicTrigger(triggeredStream)).toHaveLength(2);
    expect(detectOrganicTrigger(untriggeredStream)).toHaveLength(0);
  });

  it("keeps the local Claude Code eval config wired to the full case set", async () => {
    const config = JSON.parse(
      await readFile(resolve("evals/nonce-claude-eval.config.json"), "utf8"),
    ) as {
      caseSetPath: string;
      outputSchemaPath: string;
      runner: { mode: string; runsPerCase: number; tools: string[]; type: string };
      targetProvisioning: { mode: string };
      thresholds: { minimumMeanMethodPrecision: number };
    };
    const caseSet = JSON.parse(await readFile(resolve(config.caseSetPath), "utf8")) as {
      cases: unknown[];
    };
    const outputSchema = JSON.parse(await readFile(resolve(config.outputSchemaPath), "utf8")) as {
      required: string[];
    };

    expect(config.runner.type).toBe("claude-cli");
    expect(config.runner.mode).toBe("instructed");
    expect(config.runner.runsPerCase).toBeGreaterThanOrEqual(3);
    expect(config.runner.tools).toContain("Read");
    expect(config.targetProvisioning.mode).toBe("isolated-project-skill");
    expect(config.thresholds.minimumMeanMethodPrecision).toBeGreaterThan(0.5);
    expect(caseSet.cases).toHaveLength(20);
    expect(outputSchema.required).toContain("should_use_nonce_skill");
  });
});
