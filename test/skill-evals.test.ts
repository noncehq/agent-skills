import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { describe, expect, it } from "vite-plus/test";

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
        checks: {
          confirmationPass: true,
          destructivePass: true,
          methodRecall: 1,
          negativeControlPass: true,
          referenceRecall: 1,
          routePass: true,
          schemaRecall: 1,
        },
        criticalFailure: false,
        expected: { trigger: true },
        status: "completed",
        telemetry: { usage: { raw: { total_tokens: 10 } } },
      },
      {
        checks: {
          confirmationPass: true,
          destructivePass: true,
          methodRecall: 1,
          negativeControlPass: true,
          referenceRecall: 1,
          routePass: true,
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
    expect(summary.usageSamples).toBe(1);
    expect(
      passesCodexEvalThresholds(summary, {
        criticalFailuresAllowed: 0,
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
      runner: { type: string };
      targetProvisioning: { mode: string };
    };
    const caseSet = JSON.parse(await readFile(resolve(config.caseSetPath), "utf8")) as {
      cases: unknown[];
    };
    const outputSchema = JSON.parse(await readFile(resolve(config.outputSchemaPath), "utf8")) as {
      required: string[];
    };

    expect(config.runner.type).toBe("codex-cli");
    expect(config.targetProvisioning.mode).toBe("isolated-skill-home");
    expect(caseSet.cases).toHaveLength(20);
    expect(outputSchema.required).toContain("should_use_nonce_skill");
  });
});
