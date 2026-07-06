import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  flattenInvokeCases,
  getInvokeRunsPerCase,
  getInvokeThresholds,
  type InvokeEvalCase,
  type InvokeEvalCaseSet,
} from "./invoke-eval-cases.js";

type Severity = "error" | "warning" | "info";
type Split = "train" | "validation";
type Language = "en" | "zh";

interface EvalThresholds {
  criticalFailuresAllowed: number;
  minimumNegativeSpecificity: number;
  minimumOverallAccuracy: number;
  minimumPositiveRecall: number;
}

type ExpectedItem = string | string[];

interface EvalExpected {
  critical: boolean;
  destructive: boolean;
  methods: ExpectedItem[];
  mustRead: ExpectedItem[];
  requiresConfirmation: boolean;
  schemaFiles: ExpectedItem[];
  trigger: boolean;
}

interface EvalCase {
  category: string;
  expected: EvalExpected;
  id: string;
  language: Language;
  query: string;
  split: Split;
}

interface EvalCaseSet {
  cases: EvalCase[];
  description: string;
  runsPerCase: number;
  schemaVersion: number;
  skill: string;
  thresholds: EvalThresholds;
}

interface CheckResult {
  evidence?: string;
  id: string;
  message: string;
  pass: boolean;
  severity: Severity;
}

interface TraceSummary {
  commandCount: number;
  commands: string[];
  eventCount: number;
  path: string;
  tokenUsage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
}

export interface SkillEvalResult {
  generatedAt: string;
  ok: boolean;
  summary: {
    behaviorCases: number;
    behaviorCategories: number;
    checks: number;
    criticalCases: number;
    destructiveCases: number;
    invokeCases: number;
    errors: number;
    languages: string[];
    negativeCases: number;
    positiveCases: number;
    totalCases: number;
    warnings: number;
  };
  checks: CheckResult[];
  trace?: TraceSummary;
}

interface RunOptions {
  behaviorCasesPath?: string;
  casesPath?: string;
  invokeCasesPath?: string;
  repoRoot?: string;
  tracePath?: string;
}

interface CliOptions extends RunOptions {
  format: "json" | "text";
  outputPath?: string;
}

interface TraceEvent {
  item?: {
    command?: unknown;
    type?: unknown;
  };
  type?: unknown;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
    total_tokens?: number;
  };
}

const defaultRepoRoot = dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const defaultBehaviorCasesPath = join(defaultRepoRoot, "evals/cases/behavior.json");
const defaultInvokeCasesPath = join(defaultRepoRoot, "evals/cases/invoke.json");

const readText = (path: string) => readFile(path, "utf8");

const readJson = async <T>(path: string): Promise<T> => JSON.parse(await readText(path)) as T;

const uniqueValues = <T>(values: T[]): T[] => [...new Set(values)];

const countCases = <T>(cases: T[], predicate: (evalCase: T) => boolean): number =>
  cases.filter(predicate).length;

const addCheck = (
  checks: CheckResult[],
  id: string,
  pass: boolean,
  message: string,
  severity: Severity = "error",
  evidence?: string,
) => {
  const check: CheckResult = { id, message, pass, severity };
  if (evidence) check.evidence = evidence;
  checks.push(check);
};

const includesAll = (text: string, needles: string[]): string[] =>
  needles.filter((needle) => !text.includes(needle));

const implementationJargon = [
  /\bJS\b/i,
  /\bJavaScript\b/i,
  /\bMCP\b/i,
  /\bOpenAPI\b/i,
  /\bTypeScript\b/i,
  /\bNode\b/i,
  /\bOAuth\b/i,
  /\btoken\b/i,
  /\bListTools\b/i,
  /\btask batch\b/i,
  /\bminer task\b/i,
  /\bJSON\b/i,
];

const evalFramingJargon = [
  /\beval\b/i,
  /\bbenchmark\b/i,
  /\btest case\b/i,
  /\bshould (?:invoke|trigger|use)\b/i,
  /\bdecide whether\b/i,
  /评测/,
  /测试用例/,
  /判断是否/,
  /是否应该调用/,
  /路由/,
];

const evaluatePromptText = (
  cases: Array<{ id: string; query: string }>,
  prefix: string,
  checks: CheckResult[],
) => {
  const jargonLeaks = cases
    .filter((evalCase) => implementationJargon.some((pattern) => pattern.test(evalCase.query)))
    .map((evalCase) => evalCase.id);
  addCheck(
    checks,
    `${prefix}.natural-language-prompts`,
    jargonLeaks.length === 0,
    "case prompts stay in operator-facing language instead of implementation jargon",
    "error",
    jargonLeaks.join(", "),
  );

  const evalFramingLeaks = cases
    .filter((evalCase) => evalFramingJargon.some((pattern) => pattern.test(evalCase.query)))
    .map((evalCase) => evalCase.id);
  addCheck(
    checks,
    `${prefix}.no-eval-framing`,
    evalFramingLeaks.length === 0,
    "case prompts must read like real user requests, not evaluation instructions",
    "error",
    evalFramingLeaks.join(", "),
  );
};

const evaluateCaseSet = (caseSet: EvalCaseSet, repoRoot: string, checks: CheckResult[]) => {
  const { cases, thresholds } = caseSet;
  const ids = cases.map((evalCase) => evalCase.id);
  const uniqueIds = uniqueValues(ids);
  const positiveCases = cases.filter((evalCase) => evalCase.expected.trigger);
  const negativeCases = cases.filter((evalCase) => !evalCase.expected.trigger);
  const criticalCases = cases.filter((evalCase) => evalCase.expected.critical);
  const destructiveCases = cases.filter((evalCase) => evalCase.expected.destructive);
  const languages = uniqueValues(cases.map((evalCase) => evalCase.language));
  const categories = uniqueValues(cases.map((evalCase) => evalCase.category));
  const trainCases = cases.filter((evalCase) => evalCase.split === "train");
  const validationCases = cases.filter((evalCase) => evalCase.split === "validation");

  addCheck(
    checks,
    "cases.schema-version",
    caseSet.schemaVersion === 1,
    "case set uses schemaVersion 1",
  );
  addCheck(checks, "cases.skill", caseSet.skill === "nonce", "case set targets the nonce skill");
  addCheck(
    checks,
    "cases.size",
    cases.length >= 10 && cases.length <= 40,
    "case set stays small and targeted",
  );
  addCheck(checks, "cases.unique-ids", uniqueIds.length === ids.length, "case ids are unique");
  addCheck(
    checks,
    "cases.runs-per-case",
    caseSet.runsPerCase >= 3,
    "runsPerCase keeps room for flaky live runs",
  );
  addCheck(
    checks,
    "cases.threshold.overall",
    thresholds.minimumOverallAccuracy > 0.5,
    "overall threshold is stricter than a degenerate always-trigger baseline",
  );
  addCheck(
    checks,
    "cases.threshold.positive-recall",
    thresholds.minimumPositiveRecall > 0.5,
    "positive recall threshold is stricter than a degenerate never-trigger baseline",
  );
  addCheck(
    checks,
    "cases.threshold.negative-specificity",
    thresholds.minimumNegativeSpecificity > 0.5,
    "negative specificity threshold is stricter than a degenerate always-trigger baseline",
  );
  addCheck(
    checks,
    "cases.threshold.critical",
    thresholds.criticalFailuresAllowed === 0,
    "critical cases require zero failures",
  );
  addCheck(
    checks,
    "cases.language-coverage",
    languages.includes("zh") && languages.includes("en"),
    "cases cover zh and en",
  );
  evaluatePromptText(cases, "behavior-cases", checks);
  addCheck(
    checks,
    "cases.split-balance",
    trainCases.length > 0 &&
      validationCases.length > 0 &&
      countCases(trainCases, (evalCase) => evalCase.expected.trigger) > 0 &&
      countCases(trainCases, (evalCase) => !evalCase.expected.trigger) > 0 &&
      countCases(validationCases, (evalCase) => evalCase.expected.trigger) > 0 &&
      countCases(validationCases, (evalCase) => !evalCase.expected.trigger) > 0,
    "train and validation splits both include trigger and negative-control cases",
  );
  addCheck(
    checks,
    "cases.category-coverage",
    categories.length >= 8,
    "cases cover multiple trigger and near-miss groups",
  );
  addCheck(
    checks,
    "cases.critical-coverage",
    criticalCases.length >= 10,
    "case set marks must-pass scenarios",
  );
  addCheck(
    checks,
    "cases.destructive-coverage",
    destructiveCases.length > 0,
    "case set includes destructive workflow coverage",
  );
  addCheck(
    checks,
    "cases.negative-empty-contracts",
    negativeCases.every(
      (evalCase) =>
        evalCase.expected.methods.length === 0 &&
        evalCase.expected.mustRead.length === 0 &&
        evalCase.expected.schemaFiles.length === 0 &&
        !evalCase.expected.destructive &&
        !evalCase.expected.requiresConfirmation,
    ),
    "negative-control cases do not carry method or schema expectations",
  );
  addCheck(
    checks,
    "cases.positive-behavior-contracts",
    positiveCases.every(
      (evalCase) => evalCase.expected.methods.length > 0 && evalCase.expected.mustRead.length > 0,
    ),
    "trigger-positive cases define expected methods and required references",
  );
  addCheck(
    checks,
    "cases.destructive-confirmation",
    destructiveCases.every((evalCase) => evalCase.expected.requiresConfirmation),
    "destructive cases require explicit confirmation",
  );

  const referencedFiles = uniqueValues(
    cases
      .flatMap((evalCase) => [...evalCase.expected.mustRead, ...evalCase.expected.schemaFiles])
      .flatMap((item) => (Array.isArray(item) ? item : [item])),
  );
  const missingFiles = referencedFiles.filter(
    (relativePath) => !existsSync(join(repoRoot, "skills", relativePath)),
  );
  addCheck(
    checks,
    "cases.referenced-files-exist",
    missingFiles.length === 0,
    "all case-level references and schema files exist in the packaged skill",
    "error",
    missingFiles.join(", "),
  );
};

const evaluateInvokeCaseSet = (
  caseSet: InvokeEvalCaseSet,
  checks: CheckResult[],
): InvokeEvalCase[] => {
  const cases = flattenInvokeCases(caseSet);
  const thresholds = getInvokeThresholds(caseSet);
  const ids = cases.map((evalCase) => evalCase.id);
  const uniqueIds = uniqueValues(ids);
  const positiveCases = cases.filter((evalCase) => evalCase.shouldTrigger);
  const negativeCases = cases.filter((evalCase) => !evalCase.shouldTrigger);
  const trainCases = cases.filter((evalCase) => evalCase.split === "train");
  const validationCases = cases.filter((evalCase) => evalCase.split === "validation");
  const languages = uniqueValues(cases.map((evalCase) => evalCase.language));

  addCheck(
    checks,
    "invoke-cases.schema-version",
    caseSet.schemaVersion === 1,
    "invoke case set uses schemaVersion 1",
  );
  addCheck(
    checks,
    "invoke-cases.kind",
    caseSet.kind === "nonce-skill-invoke-cases",
    "invoke case set declares its purpose",
  );
  addCheck(checks, "invoke-cases.skill", caseSet.skill === "nonce", "invoke cases target nonce");
  addCheck(
    checks,
    "invoke-cases.size",
    cases.length >= 10 && cases.length <= 40,
    "invoke case set stays small and targeted",
  );
  addCheck(
    checks,
    "invoke-cases.unique-ids",
    uniqueIds.length === ids.length,
    "invoke case ids are unique",
  );
  addCheck(
    checks,
    "invoke-cases.runs-per-case",
    getInvokeRunsPerCase(caseSet) >= 3,
    "invoke evals run each query multiple times",
  );
  addCheck(
    checks,
    "invoke-cases.threshold.overall",
    thresholds.minimumOverallAccuracy > 0.5,
    "invoke overall threshold is stricter than a degenerate baseline",
  );
  addCheck(
    checks,
    "invoke-cases.threshold.positive-recall",
    thresholds.minimumPositiveRecall > 0.5,
    "invoke positive recall threshold is stricter than never-trigger behavior",
  );
  addCheck(
    checks,
    "invoke-cases.threshold.negative-specificity",
    thresholds.minimumNegativeSpecificity > 0.5,
    "invoke negative specificity threshold is stricter than always-trigger behavior",
  );
  addCheck(
    checks,
    "invoke-cases.threshold.critical",
    thresholds.criticalFailuresAllowed === 0,
    "invoke critical cases require zero failures",
  );
  addCheck(
    checks,
    "invoke-cases.language-coverage",
    languages.includes("zh") && languages.includes("en"),
    "invoke cases cover zh and en",
  );
  evaluatePromptText(cases, "invoke-cases", checks);
  addCheck(
    checks,
    "invoke-cases.split-balance",
    trainCases.length > 0 &&
      validationCases.length > 0 &&
      countCases(trainCases, (evalCase) => evalCase.shouldTrigger) > 0 &&
      countCases(trainCases, (evalCase) => !evalCase.shouldTrigger) > 0 &&
      countCases(validationCases, (evalCase) => evalCase.shouldTrigger) > 0 &&
      countCases(validationCases, (evalCase) => !evalCase.shouldTrigger) > 0,
    "invoke train and validation splits both include trigger and negative controls",
  );
  addCheck(
    checks,
    "invoke-cases.class-balance",
    positiveCases.length === negativeCases.length,
    "invoke cases keep trigger and negative controls balanced",
  );
  addCheck(
    checks,
    "invoke-cases.reasons",
    cases.every((evalCase) => evalCase.reason.trim().length > 0),
    "invoke cases explain why each query should or should not activate the skill",
  );

  return cases;
};

const evaluateStaticSkillContract = async (repoRoot: string, checks: CheckResult[]) => {
  const skillRoot = join(repoRoot, "skills");
  const skillText = await readText(join(skillRoot, "SKILL.md"));
  const workflowText = await readText(join(skillRoot, "references/workflow.md"));
  const safetyText = await readText(join(skillRoot, "references/safety.md"));
  const authText = await readText(join(skillRoot, "references/auth.md"));

  addCheck(
    checks,
    "skill.description-trigger",
    skillText.includes("Use this skill when") &&
      skillText.includes("Nonce mining resources") &&
      skillText.includes("Do not use it for generic Bitcoin mining questions"),
    "SKILL.md frontmatter keeps a clear trigger and negative boundary",
  );
  addCheck(
    checks,
    "skill.references",
    includesAll(skillText, [
      "references/workflow.md",
      "references/auth.md",
      "references/tool-signatures.md",
      "references/safety.md",
      "assets/schemas/",
    ]).length === 0,
    "SKILL.md points to the required deferred references",
  );

  const missingWorkflowNeedles = includesAll(workflowText, [
    "NONCE_SKILL_HOME",
    "node scripts/bootstrap-runtime.mjs --json",
    "references/tool-signatures.md",
    "assets/schemas/",
    "process.env.NONCE_SKILL_RUNTIME_URL",
    "--profile",
    "--endpoint",
    "--allow-destructive",
    "compact JSON stdout",
  ]);
  addCheck(
    checks,
    "workflow.contracts",
    missingWorkflowNeedles.length === 0,
    "workflow reference preserves path setup, schema reading, runner flags, and compact JSON rules",
    "error",
    missingWorkflowNeedles.join(", "),
  );

  const missingSafetyNeedles = includesAll(safetyText, [
    "CreateTaskBatch_*",
    "explicit user confirmation",
    "confirmDestructive: true",
    "--allow-destructive",
    "Do not broaden the operation",
  ]);
  addCheck(
    checks,
    "safety.destructive-contracts",
    missingSafetyNeedles.length === 0,
    "safety reference preserves destructive-operation guardrails",
    "error",
    missingSafetyNeedles.join(", "),
  );

  const missingAuthNeedles = includesAll(authText, [
    "node scripts/auth.mjs status",
    "node scripts/auth.mjs login",
    "node scripts/auth.mjs verify",
    "Never print access tokens",
  ]);
  addCheck(
    checks,
    "auth.contracts",
    missingAuthNeedles.length === 0,
    "auth reference preserves status, login, verify, and secret-handling rules",
    "error",
    missingAuthNeedles.join(", "),
  );
};

const summarizeTrace = async (tracePath: string): Promise<TraceSummary> => {
  const jsonl = await readText(tracePath);
  const events = jsonl
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line) as TraceEvent);

  const commands = events
    .map((event) => (event.item?.type === "command_execution" ? event.item.command : undefined))
    .filter((command): command is string => typeof command === "string");
  const usageEvent = [...events].reverse().find((event) => event.usage)?.usage;

  return {
    commandCount: commands.length,
    commands,
    eventCount: events.length,
    path: tracePath,
    tokenUsage: usageEvent
      ? {
          inputTokens: usageEvent.input_tokens,
          outputTokens: usageEvent.output_tokens,
          totalTokens: usageEvent.total_tokens,
        }
      : undefined,
  };
};

export const runSkillEvals = async (options: RunOptions = {}): Promise<SkillEvalResult> => {
  const repoRoot = resolve(options.repoRoot ?? defaultRepoRoot);
  const behaviorCasesPath = resolve(
    options.behaviorCasesPath ?? options.casesPath ?? defaultBehaviorCasesPath,
  );
  const invokeCasesPath = resolve(options.invokeCasesPath ?? defaultInvokeCasesPath);
  const checks: CheckResult[] = [];
  const caseSet = await readJson<EvalCaseSet>(behaviorCasesPath);
  const invokeCaseSet = await readJson<InvokeEvalCaseSet>(invokeCasesPath);

  const invokeCases = evaluateInvokeCaseSet(invokeCaseSet, checks);
  evaluateCaseSet(caseSet, repoRoot, checks);
  await evaluateStaticSkillContract(repoRoot, checks);

  const trace = options.tracePath ? await summarizeTrace(resolve(options.tracePath)) : undefined;
  if (trace) {
    addCheck(checks, "trace.parsed", trace.eventCount > 0, "captured trace contains JSONL events");
    addCheck(
      checks,
      "trace.command-audit",
      true,
      `captured ${trace.commandCount} command_execution events`,
      "info",
    );
  }

  const errors = checks.filter((check) => check.severity === "error" && !check.pass).length;
  const warnings = checks.filter((check) => check.severity === "warning" && !check.pass).length;
  const cases = caseSet.cases;
  const languages = uniqueValues([
    ...cases.map((evalCase) => evalCase.language),
    ...invokeCases.map((evalCase) => evalCase.language),
  ]).sort();

  return {
    generatedAt: new Date().toISOString(),
    ok: errors === 0,
    summary: {
      behaviorCases: cases.length,
      behaviorCategories: uniqueValues(cases.map((evalCase) => evalCase.category)).length,
      checks: checks.length,
      criticalCases: countCases(cases, (evalCase) => evalCase.expected.critical),
      destructiveCases: countCases(cases, (evalCase) => evalCase.expected.destructive),
      invokeCases: invokeCases.length,
      errors,
      languages,
      negativeCases: countCases(cases, (evalCase) => !evalCase.expected.trigger),
      positiveCases: countCases(cases, (evalCase) => evalCase.expected.trigger),
      totalCases: cases.length + invokeCases.length,
      warnings,
    },
    checks,
    trace,
  };
};

const parseArgs = (argv: string[]): CliOptions => {
  const options: CliOptions = { format: "text" };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--") {
      continue;
    } else if (arg === "--json") {
      options.format = "json";
    } else if (arg === "--cases" && next) {
      options.casesPath = next;
      index += 1;
    } else if (arg === "--behavior-cases" && next) {
      options.behaviorCasesPath = next;
      index += 1;
    } else if (arg === "--invoke-cases" && next) {
      options.invokeCasesPath = next;
      index += 1;
    } else if (arg === "--output" && next) {
      options.outputPath = next;
      index += 1;
    } else if (arg === "--repo-root" && next) {
      options.repoRoot = next;
      index += 1;
    } else if (arg === "--trace" && next) {
      options.tracePath = next;
      index += 1;
    } else if (arg === "--help" || arg === "-h") {
      console.log(
        `Usage: vp run evals -- [--json] [--output <file>] [--trace <jsonl>] [--behavior-cases <json>] [--invoke-cases <json>]`,
      );
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
};

const renderText = (result: SkillEvalResult): string => {
  const lines = [
    `Nonce skill evals: ${result.ok ? "PASS" : "FAIL"}`,
    `Invoke cases: ${result.summary.invokeCases} raw prompts`,
    `Behavior contracts: ${result.summary.behaviorCases} cases, ${result.summary.positiveCases} trigger, ${result.summary.negativeCases} negative, ${result.summary.destructiveCases} destructive`,
    `Coverage: ${result.summary.behaviorCategories} behavior categories, languages: ${result.summary.languages.join(", ")}`,
    `Checks: ${result.summary.checks} total, ${result.summary.errors} errors, ${result.summary.warnings} warnings`,
  ];

  const failed = result.checks.filter((check) => !check.pass);
  if (failed.length > 0) {
    lines.push("", "Failures:");
    for (const check of failed) {
      lines.push(`- [${check.severity}] ${check.id}: ${check.message}`);
      if (check.evidence) lines.push(`  evidence: ${check.evidence}`);
    }
  }

  if (result.trace) {
    lines.push(
      "",
      `Trace: ${result.trace.eventCount} events, ${result.trace.commandCount} command executions`,
    );
    if (result.trace.tokenUsage?.totalTokens !== undefined) {
      lines.push(`Tokens: ${result.trace.tokenUsage.totalTokens}`);
    }
  }

  return `${lines.join("\n")}\n`;
};

const main = async () => {
  const options = parseArgs(process.argv.slice(2));
  const result = await runSkillEvals(options);
  const output =
    options.format === "json" ? `${JSON.stringify(result, null, 2)}\n` : renderText(result);

  if (options.outputPath) {
    const outputPath = resolve(options.outputPath);
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, JSON.stringify(result, null, 2), "utf8");
  }

  process.stdout.write(output);
  process.exitCode = result.ok ? 0 : 1;
};

if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}
