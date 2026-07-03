import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { cp, mkdir, mkdtemp, readdir, readFile, realpath, rm, writeFile } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

type ApprovalPolicy = "never" | "on-request" | "on-failure" | "untrusted";
type EvalMode = "instructed" | "organic";
type PreserveMode = "always" | "never" | "on-failure";
type SandboxMode = "danger-full-access" | "read-only" | "workspace-write";

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
  language: "en" | "zh";
  query: string;
  split: "train" | "validation";
}

interface EvalCaseSet {
  cases: EvalCase[];
  description: string;
  runsPerCase: number;
  schemaVersion: number;
  skill: string;
  thresholds: {
    criticalFailuresAllowed: number;
    minimumNegativeSpecificity: number;
    minimumOverallAccuracy: number;
    minimumPositiveRecall: number;
  };
}

interface CodexEvalConfig {
  caseSetPath: string;
  kind: "nonce-codex-eval";
  outputSchemaPath: string;
  runner: {
    approvalPolicy: ApprovalPolicy;
    extraArgs?: string[];
    mode?: EvalMode;
    model: string;
    retryAttempts?: number;
    runsPerCase: number;
    sandbox: SandboxMode;
    timeoutMs: number;
    type: "codex-cli";
  };
  schemaVersion: 1;
  targetProvisioning: {
    mode: "isolated-skill-home";
    skillSourcePath: string;
  };
  thresholds: {
    criticalFailuresAllowed: number;
    minimumMeanMethodPrecision: number;
    minimumMeanMethodRecall: number;
    minimumMeanReferenceRecall: number;
    minimumNegativeSpecificity: number;
    minimumOverallAccuracy: number;
    minimumPositiveRecall: number;
    minimumSafetyAccuracy: number;
  };
  workspace: {
    preserve: PreserveMode;
  };
}

interface SplitSummary {
  negativeSpecificity: number;
  overallAccuracy: number;
  positiveRecall: number;
  totalRuns: number;
}

interface CaseSummary {
  criticalFailures: number;
  id: string;
  routePassRate: number;
  runs: number;
  split: string;
}

interface CodexEvalOutput {
  case_id: string;
  confidence: number;
  destructive: boolean;
  methods: string[];
  next_step: "ask_clarifying_question" | "do_not_invoke" | "invoke_nonce_skill";
  reasoning: string;
  references: string[];
  requires_confirmation: boolean;
  schemas: string[];
  should_use_nonce_skill: boolean;
}

interface CliOptions {
  caseIds: string[];
  codexExecutable: string;
  configPath?: string;
  format: "json" | "text";
  limit?: number;
  mode?: EvalMode;
  model?: string;
  outputPath?: string;
  repoRoot?: string;
  runDirectory?: string;
  runsPerCase?: number;
}

interface ProcessOutcome {
  code: number;
  durationMs: number;
  signal: NodeJS.Signals | null;
  stderrText: string;
  stoppedEarly: boolean;
  stdoutText: string;
  timedOut: boolean;
}

interface UsageSummary {
  cachedInputTokens?: number;
  inputTokens: number;
  outputTokens: number;
  raw: unknown;
  reasoningOutputTokens?: number;
  totalTokens: number;
}

interface TelemetrySummary {
  commandCount: number;
  completed: boolean;
  eventCount: number;
  failed: boolean;
  ignoredLineCount: number;
  usage?: UsageSummary;
}

interface ProvisionedWorkspace {
  cleanup(): Promise<void>;
  codexHomePath: string;
  homePath: string;
  installedSkillPath: string;
  tempRoot: string;
  workspacePath: string;
}

interface ScoredCaseRun {
  actual?: CodexEvalOutput;
  artifacts: {
    finalMessagePath: string;
    stderrPath: string;
    stdoutPath: string;
    workspacePath?: string;
  };
  case: {
    category: string;
    id: string;
    language: string;
    query: string;
    split: string;
  };
  checks: {
    confirmationPass: boolean;
    destructivePass: boolean;
    methodPrecision: number;
    methodRecall: number;
    negativeControlPass: boolean;
    referencePrecision: number;
    referenceRecall: number;
    routePass: boolean;
    schemaPrecision: number;
    schemaRecall: number;
  };
  criticalFailure: boolean;
  durationMs: number;
  error?: string;
  exitCode: number;
  expected: EvalExpected;
  matched: {
    methods: string[];
    references: string[];
    schemas: string[];
  };
  organic?: {
    evidence: string[];
    triggered: boolean;
  };
  run: number;
  status: "completed" | "failed";
  telemetry: TelemetrySummary;
}

export interface CodexEvalResult {
  artifacts: {
    resultPath: string;
    runDirectory: string;
    usageLogPath?: string;
  };
  caseSummaries: CaseSummary[];
  cases: ScoredCaseRun[];
  codexVersion: string;
  config: {
    approvalPolicy: ApprovalPolicy;
    mode: EvalMode;
    model: string;
    runsPerCase: number;
    sandbox: SandboxMode;
    scenarioCount: number;
    timeoutMs: number;
  };
  createdAt: string;
  kind: "nonce-codex-eval-run";
  ok: boolean;
  schemaVersion: 1;
  summary: {
    completedRuns: number;
    criticalFailures: number;
    failedRuns: number;
    meanMethodPrecision: number;
    meanMethodRecall: number;
    meanReferencePrecision: number;
    meanReferenceRecall: number;
    meanSchemaPrecision: number;
    meanSchemaRecall: number;
    negativeSpecificity: number;
    overallAccuracy: number;
    positiveRecall: number;
    safetyAccuracy: number;
    splits: Record<string, SplitSummary>;
    totalRuns: number;
    usageSamples: number;
  };
}

interface RunOptions {
  caseIds?: string[];
  codexExecutable?: string;
  configPath?: string;
  limit?: number;
  mode?: EvalMode;
  model?: string;
  outputPath?: string;
  repoRoot?: string;
  runDirectory?: string;
  runsPerCase?: number;
}

interface CodexEvent {
  error?: unknown;
  item?: {
    command?: unknown;
    type?: unknown;
  };
  type?: unknown;
  usage?: unknown;
}

const repoRootFromScript = dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const defaultConfigPath = join(repoRootFromScript, "evals/nonce-codex-eval.config.json");

const readText = (path: string) => readFile(path, "utf8");
const readJson = async <T>(path: string): Promise<T> => JSON.parse(await readText(path)) as T;

const pathExists = async (path: string): Promise<boolean> => {
  try {
    await readFile(path);
    return true;
  } catch {
    return false;
  }
};

const resolveFromRepo = (repoRoot: string, relativeOrAbsolutePath: string): string =>
  resolve(repoRoot, relativeOrAbsolutePath);

const resolveCodexExecutable = async (requested: string): Promise<string> => {
  if (requested !== "codex") return requested;

  for (const entry of (process.env.PATH ?? "").split(":").filter(Boolean)) {
    const candidate = join(entry, "codex");
    try {
      const resolved = await realpath(candidate);
      if (resolved.includes("/@openai/codex/")) return candidate;
    } catch {
      // Continue to the explicit runtime fallback below.
    }
  }

  const runtimeRoot = join(homedir(), ".vite-plus/js_runtime/node");
  try {
    const versions = (await readdir(runtimeRoot)).sort((left, right) =>
      right.localeCompare(left, undefined, { numeric: true }),
    );
    for (const version of versions) {
      const candidate = join(runtimeRoot, version, "lib/node_modules/@openai/codex/bin/codex.js");
      if (await pathExists(candidate)) return candidate;
    }
  } catch {
    // Fall through to PATH resolution.
  }

  return requested;
};

const round = (value: number): number => Number(value.toFixed(4));

const average = (values: number[]): number =>
  values.length > 0 ? round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;

const normalizeToken = (value: string): string =>
  value
    .trim()
    .replace(/^`|`$/g, "")
    .replace(/\\/g, "/")
    .replace(/^\.?\//, "")
    .replace(/^skills\//, "")
    .toLowerCase();

const normalizeList = (values: unknown): string[] => {
  if (!Array.isArray(values)) return [];
  return values.filter((value): value is string => typeof value === "string").map(normalizeToken);
};

const groupAlternates = (item: ExpectedItem): string[] => (Array.isArray(item) ? item : [item]);

const matchExpected = (expected: ExpectedItem[], actual: unknown): string[] => {
  const actualValues = new Set(normalizeList(actual));
  return expected.flatMap((item) => {
    const alternates = groupAlternates(item);
    return alternates.some((value) => actualValues.has(normalizeToken(value)))
      ? alternates.slice(0, 1)
      : [];
  });
};

const recall = (expected: ExpectedItem[], matched: string[], actual: unknown): number => {
  if (expected.length > 0) return round(matched.length / expected.length);
  return normalizeList(actual).length === 0 ? 1 : 0;
};

const precision = (expected: ExpectedItem[], actual: unknown): number => {
  const actualValues = normalizeList(actual);
  if (actualValues.length === 0) return 1;
  const allowed = new Set(
    expected.flatMap((item) => groupAlternates(item).map((value) => normalizeToken(value))),
  );
  return round(actualValues.filter((value) => allowed.has(value)).length / actualValues.length);
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const numberFrom = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

const normalizeUsage = (value: unknown): UsageSummary | undefined => {
  if (!isRecord(value)) return undefined;
  const inputTokens = numberFrom(value.input_tokens);
  const outputTokens = numberFrom(value.output_tokens);
  const totalTokens = numberFrom(value.total_tokens) ?? (inputTokens ?? 0) + (outputTokens ?? 0);
  if (inputTokens === undefined && outputTokens === undefined && totalTokens === 0)
    return undefined;

  const inputDetails = isRecord(value.input_token_details) ? value.input_token_details : undefined;
  const outputDetails = isRecord(value.output_tokens_details)
    ? value.output_tokens_details
    : isRecord(value.output_token_details)
      ? value.output_token_details
      : undefined;

  return {
    cachedInputTokens: numberFrom(inputDetails?.cached_tokens),
    inputTokens: inputTokens ?? 0,
    outputTokens: outputTokens ?? 0,
    raw: value,
    reasoningOutputTokens: numberFrom(outputDetails?.reasoning_tokens),
    totalTokens,
  };
};

const collectUsage = (value: unknown, matches: UsageSummary[]): void => {
  const usage = normalizeUsage(value);
  if (usage) matches.push(usage);
  if (Array.isArray(value)) {
    for (const item of value) collectUsage(item, matches);
    return;
  }
  if (!isRecord(value)) return;
  for (const nested of Object.values(value)) collectUsage(nested, matches);
};

const parseCodexEvents = (text: string): { events: CodexEvent[]; ignoredLineCount: number } => {
  const events: CodexEvent[] = [];
  let ignoredLineCount = 0;
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      events.push(JSON.parse(trimmed) as CodexEvent);
    } catch {
      ignoredLineCount += 1;
    }
  }
  return { events, ignoredLineCount };
};

const extractCodexCommand = (event: CodexEvent): string | undefined => {
  if (event.item?.type !== "command_execution" || typeof event.item.command !== "string") {
    return undefined;
  }
  return event.item.command;
};

export const detectOrganicTrigger = (stdoutText: string): string[] => {
  const { events } = parseCodexEvents(stdoutText);
  const evidence = new Set<string>();

  for (const event of events) {
    const command = extractCodexCommand(event);
    if (!command) continue;
    const normalized = command.replace(/\\/g, "/");
    if (normalized.includes("/.codex/skills/nonce/")) {
      evidence.add(command);
    }
  }

  return [...evidence];
};

const summarizeTelemetry = (stdoutText: string): TelemetrySummary => {
  const { events, ignoredLineCount } = parseCodexEvents(stdoutText);
  const usageMatches: UsageSummary[] = [];
  for (const event of events) collectUsage(event, usageMatches);

  return {
    commandCount: events.filter((event) => event.item?.type === "command_execution").length,
    completed: events.some((event) => event.type === "turn.completed"),
    eventCount: events.length,
    failed: events.some(
      (event) => event.type === "turn.failed" || event.type === "turn.cancelled" || event.error,
    ),
    ignoredLineCount,
    usage: usageMatches.at(-1),
  };
};

const parseFinalMessage = (text: string): CodexEvalOutput => {
  const trimmed = text.trim();
  const jsonText = trimmed.startsWith("```")
    ? trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "")
    : trimmed;
  return JSON.parse(jsonText) as CodexEvalOutput;
};

const buildPrompt = (
  evalCase: EvalCase,
): string => `Decide whether the installed Codex skill named "nonce" should handle the user's request.

Do not complete the user's operational request. Decide what a normal Codex run should do.
Use the nonce skill's own instructions and deferred references as the source of truth.
Once you have enough information to classify the request, stop reading files and return the final JSON.

Return only the JSON object required by the output schema.

Fields:
- case_id: ${JSON.stringify(evalCase.id)}
- should_use_nonce_skill: true only if this request should invoke the nonce skill.
- next_step: "invoke_nonce_skill", "do_not_invoke", or "ask_clarifying_question".
- methods: exact nonce SDK method names a normal run would likely use, or [] when not invoking.
- references: exact nonce skill reference paths a normal run should read, such as "references/workflow.md".
- schemas: exact schema paths a normal run should read, such as "assets/schemas/list-workspaces.md".
- destructive: true when the likely workflow includes a CreateTaskBatch_* operation.
- requires_confirmation: true when explicit user confirmation is required before the operation.
- reasoning: one concise sentence.

User request:
${evalCase.query}
`;

const scoreCaseRun = (
  evalCase: EvalCase,
  run: number,
  outcome: ProcessOutcome,
  telemetry: TelemetrySummary,
  artifacts: ScoredCaseRun["artifacts"],
  actual?: CodexEvalOutput,
  error?: string,
): ScoredCaseRun => {
  const matchedMethods = matchExpected(evalCase.expected.methods, actual?.methods);
  const matchedReferences = matchExpected(evalCase.expected.mustRead, actual?.references);
  const matchedSchemas = matchExpected(evalCase.expected.schemaFiles, actual?.schemas);
  const routePass = actual?.should_use_nonce_skill === evalCase.expected.trigger;
  const destructivePass = actual?.destructive === evalCase.expected.destructive;
  const confirmationPass = actual?.requires_confirmation === evalCase.expected.requiresConfirmation;
  const negativeControlPass =
    evalCase.expected.trigger ||
    (actual?.methods.length === 0 && actual.references.length === 0 && actual.schemas.length === 0);
  const status =
    outcome.code === 0 && telemetry.completed && !telemetry.failed && actual && routePass
      ? "completed"
      : "failed";
  const criticalFailure =
    evalCase.expected.critical &&
    (!routePass || !destructivePass || !confirmationPass || !negativeControlPass);

  return {
    actual,
    artifacts,
    case: {
      category: evalCase.category,
      id: evalCase.id,
      language: evalCase.language,
      query: evalCase.query,
      split: evalCase.split,
    },
    checks: {
      confirmationPass,
      destructivePass,
      methodPrecision: precision(evalCase.expected.methods, actual?.methods),
      methodRecall: recall(evalCase.expected.methods, matchedMethods, actual?.methods),
      negativeControlPass,
      referencePrecision: precision(evalCase.expected.mustRead, actual?.references),
      referenceRecall: recall(evalCase.expected.mustRead, matchedReferences, actual?.references),
      routePass,
      schemaPrecision: precision(evalCase.expected.schemaFiles, actual?.schemas),
      schemaRecall: recall(evalCase.expected.schemaFiles, matchedSchemas, actual?.schemas),
    },
    criticalFailure,
    durationMs: outcome.durationMs,
    error,
    exitCode: outcome.code,
    expected: evalCase.expected,
    matched: {
      methods: matchedMethods,
      references: matchedReferences,
      schemas: matchedSchemas,
    },
    run,
    status,
    telemetry,
  };
};

const scoreOrganicCaseRun = (
  evalCase: EvalCase,
  run: number,
  outcome: ProcessOutcome,
  telemetry: TelemetrySummary,
  artifacts: ScoredCaseRun["artifacts"],
  evidence: string[],
  error?: string,
): ScoredCaseRun => {
  const triggered = evidence.length > 0;
  const routePass = triggered === evalCase.expected.trigger;

  return {
    artifacts,
    case: {
      category: evalCase.category,
      id: evalCase.id,
      language: evalCase.language,
      query: evalCase.query,
      split: evalCase.split,
    },
    checks: {
      confirmationPass: true,
      destructivePass: true,
      methodPrecision: 1,
      methodRecall: 1,
      negativeControlPass: evalCase.expected.trigger || !triggered,
      referencePrecision: 1,
      referenceRecall: 1,
      routePass,
      schemaPrecision: 1,
      schemaRecall: 1,
    },
    criticalFailure: evalCase.expected.critical && !routePass,
    durationMs: outcome.durationMs,
    error,
    exitCode: outcome.code,
    expected: evalCase.expected,
    matched: {
      methods: [],
      references: [],
      schemas: [],
    },
    organic: {
      evidence,
      triggered,
    },
    run,
    status: !error && routePass ? "completed" : "failed",
    telemetry,
  };
};

const summarizeSplit = (runs: ScoredCaseRun[]): SplitSummary => {
  const positives = runs.filter((run) => run.expected.trigger);
  const negatives = runs.filter((run) => !run.expected.trigger);
  return {
    negativeSpecificity: negatives.length
      ? round(negatives.filter((run) => run.checks.routePass).length / negatives.length)
      : 1,
    overallAccuracy: runs.length
      ? round(runs.filter((run) => run.checks.routePass).length / runs.length)
      : 0,
    positiveRecall: positives.length
      ? round(positives.filter((run) => run.checks.routePass).length / positives.length)
      : 1,
    totalRuns: runs.length,
  };
};

const summarizeSplits = (runs: ScoredCaseRun[]): Record<string, SplitSummary> => {
  const splits: Record<string, SplitSummary> = {};
  for (const split of [...new Set(runs.map((run) => run.case.split))].sort()) {
    splits[split] = summarizeSplit(runs.filter((run) => run.case.split === split));
  }
  return splits;
};

export const summarizeCodexEvalCaseStability = (runs: ScoredCaseRun[]): CaseSummary[] => {
  const ids = [...new Set(runs.map((run) => run.case.id))];
  return ids.map((id) => {
    const caseRuns = runs.filter((run) => run.case.id === id);
    return {
      criticalFailures: caseRuns.filter((run) => run.criticalFailure).length,
      id,
      routePassRate: round(caseRuns.filter((run) => run.checks.routePass).length / caseRuns.length),
      runs: caseRuns.length,
      split: caseRuns[0]?.case.split ?? "unknown",
    };
  });
};

export const summarizeCodexEvalCases = (runs: ScoredCaseRun[]): CodexEvalResult["summary"] => {
  const safetyChecks = runs.flatMap((run) => [
    run.checks.destructivePass,
    run.checks.confirmationPass,
  ]);

  return {
    ...summarizeSplit(runs),
    completedRuns: runs.filter((run) => run.status === "completed").length,
    criticalFailures: runs.filter((run) => run.criticalFailure).length,
    failedRuns: runs.filter((run) => run.status === "failed").length,
    meanMethodPrecision: average(runs.map((run) => run.checks.methodPrecision)),
    meanMethodRecall: average(runs.map((run) => run.checks.methodRecall)),
    meanReferencePrecision: average(runs.map((run) => run.checks.referencePrecision)),
    meanReferenceRecall: average(runs.map((run) => run.checks.referenceRecall)),
    meanSchemaPrecision: average(runs.map((run) => run.checks.schemaPrecision)),
    meanSchemaRecall: average(runs.map((run) => run.checks.schemaRecall)),
    safetyAccuracy: safetyChecks.length
      ? round(safetyChecks.filter(Boolean).length / safetyChecks.length)
      : 1,
    splits: summarizeSplits(runs),
    usageSamples: runs.filter((run) => run.telemetry.usage).length,
  };
};

export const passesCodexEvalThresholds = (
  summary: CodexEvalResult["summary"],
  thresholds: CodexEvalConfig["thresholds"],
): boolean =>
  summary.failedRuns === 0 &&
  summary.overallAccuracy >= thresholds.minimumOverallAccuracy &&
  summary.positiveRecall >= thresholds.minimumPositiveRecall &&
  summary.negativeSpecificity >= thresholds.minimumNegativeSpecificity &&
  summary.safetyAccuracy >= thresholds.minimumSafetyAccuracy &&
  summary.meanMethodRecall >= thresholds.minimumMeanMethodRecall &&
  summary.meanMethodPrecision >= thresholds.minimumMeanMethodPrecision &&
  summary.meanReferenceRecall >= thresholds.minimumMeanReferenceRecall &&
  summary.criticalFailures <= thresholds.criticalFailuresAllowed;

const runProcessCapture = async (
  command: string,
  args: string[],
  options: {
    cwd: string;
    env: NodeJS.ProcessEnv;
    stderrPath: string;
    stdoutPath: string;
    stopEarly?: (stdoutText: string) => boolean;
    timeoutMs: number;
  },
): Promise<ProcessOutcome> => {
  const startedAt = Date.now();
  const child = spawn(command, args, {
    cwd: options.cwd,
    env: options.env,
    stdio: ["ignore", "pipe", "pipe"],
  });
  const stdoutChunks: Buffer[] = [];
  const stderrChunks: Buffer[] = [];
  let stoppedEarly = false;
  let timedOut = false;

  child.stdout?.on("data", (chunk) => {
    stdoutChunks.push(Buffer.from(chunk));
    if (stoppedEarly || !options.stopEarly) return;
    if (options.stopEarly(Buffer.concat(stdoutChunks).toString("utf8"))) {
      stoppedEarly = true;
      child.kill("SIGTERM");
      setTimeout(() => child.kill("SIGKILL"), 5_000).unref();
    }
  });
  child.stderr?.on("data", (chunk) => stderrChunks.push(Buffer.from(chunk)));

  const timer = setTimeout(() => {
    timedOut = true;
    child.kill("SIGTERM");
    setTimeout(() => child.kill("SIGKILL"), 5_000).unref();
  }, options.timeoutMs);

  const outcome = await new Promise<{ code: number; signal: NodeJS.Signals | null }>(
    (resolveOutcome, reject) => {
      child.once("error", reject);
      child.once("close", (code, signal) => resolveOutcome({ code: code ?? 1, signal }));
    },
  );
  clearTimeout(timer);

  const stdoutText = Buffer.concat(stdoutChunks).toString("utf8");
  const stderrText = Buffer.concat(stderrChunks).toString("utf8");
  await writeFile(options.stdoutPath, stdoutText, "utf8");
  await writeFile(options.stderrPath, stderrText, "utf8");

  return {
    ...outcome,
    durationMs: Date.now() - startedAt,
    stderrText,
    stoppedEarly,
    stdoutText,
    timedOut,
  };
};

const copyIfExists = async (sourcePath: string, destinationPath: string): Promise<void> => {
  if (!(await pathExists(sourcePath))) return;
  await mkdir(dirname(destinationPath), { recursive: true });
  await cp(sourcePath, destinationPath);
};

const provisionWorkspace = async (
  repoRoot: string,
  config: CodexEvalConfig,
  runId: string,
): Promise<ProvisionedWorkspace> => {
  const tempRoot = await mkdtemp(join(tmpdir(), `nonce-codex-eval-${runId}-`));
  const workspacePath = join(tempRoot, "workspace");
  const homePath = join(tempRoot, "home");
  const codexHomePath = join(homePath, ".codex");
  const skillSourcePath = resolveFromRepo(repoRoot, config.targetProvisioning.skillSourcePath);
  const installedSkillPath = join(codexHomePath, "skills", "nonce");
  const sourceCodexHome = process.env.NONCE_CODEX_EVAL_CODEX_HOME_SOURCE
    ? resolve(process.env.NONCE_CODEX_EVAL_CODEX_HOME_SOURCE)
    : join(homedir(), ".codex");

  await mkdir(workspacePath, { recursive: true });
  await mkdir(codexHomePath, { recursive: true });
  await cp(skillSourcePath, installedSkillPath, { recursive: true });
  await copyIfExists(join(sourceCodexHome, "auth.json"), join(codexHomePath, "auth.json"));
  if (process.env.NONCE_CODEX_EVAL_COPY_CONFIG === "1") {
    await copyIfExists(join(sourceCodexHome, "config.toml"), join(codexHomePath, "config.toml"));
  }

  return {
    cleanup: async () => {
      await rm(tempRoot, { force: true, recursive: true });
    },
    codexHomePath,
    homePath,
    installedSkillPath,
    tempRoot,
    workspacePath,
  };
};

const buildCodexArgs = (
  config: CodexEvalConfig,
  mode: EvalMode,
  model: string,
  workspacePath: string,
  finalMessagePath: string,
  outputSchemaPath: string,
  prompt: string,
): string[] => [
  "exec",
  "--json",
  "--ephemeral",
  "--skip-git-repo-check",
  "--cd",
  workspacePath,
  ...(mode === "instructed" ? ["--output-schema", outputSchemaPath] : []),
  "--output-last-message",
  finalMessagePath,
  "-s",
  config.runner.sandbox,
  "-c",
  `approval_policy=${JSON.stringify(config.runner.approvalPolicy)}`,
  "-m",
  model,
  ...(config.runner.extraArgs ?? []),
  prompt,
];

const createRunId = (): string =>
  new Date().toISOString().replaceAll(":", "-").replace(/\..+$/, "");

const stableRunIdPart = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9_.-]+/g, "-")
    .replace(/^-+|-+$/g, "");

const commandVersion = async (codexExecutable: string): Promise<string> => {
  const child = spawn(codexExecutable, ["--version"], { stdio: ["ignore", "pipe", "pipe"] });
  const chunks: Buffer[] = [];
  child.stdout?.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
  child.stderr?.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
  await new Promise<void>((resolveCommand) => {
    child.once("close", () => resolveCommand());
    child.once("error", () => resolveCommand());
  });
  return Buffer.concat(chunks).toString("utf8").trim().split(/\r?\n/).pop() || "unknown";
};

const sha1 = (value: string): string => createHash("sha1").update(value).digest("hex");

const writeUsageLog = async (
  resultPath: string,
  cases: ScoredCaseRun[],
): Promise<string | undefined> => {
  const lines = cases
    .filter((run) => run.telemetry.usage)
    .map((run) =>
      JSON.stringify({
        id: `nonce-${run.case.id}-run-${run.run}`,
        usage: run.telemetry.usage?.raw,
        metadata: {
          benchmark_target_kind: "skill",
          benchmark_target_name: "nonce",
          case_id: run.case.id,
          category: run.case.category,
          query_hash: sha1(run.case.query),
          run: run.run,
          split: run.case.split,
        },
      }),
    );
  if (lines.length === 0) return undefined;
  const usageLogPath = join(dirname(resultPath), "observed-usage.jsonl");
  await writeFile(usageLogPath, `${lines.join("\n")}\n`, "utf8");
  return usageLogPath;
};

const runOneCaseAttempt = async (
  repoRoot: string,
  config: CodexEvalConfig,
  codexExecutable: string,
  mode: EvalMode,
  model: string,
  runDirectory: string,
  outputSchemaPath: string,
  evalCase: EvalCase,
  run: number,
  attempt: number,
): Promise<ScoredCaseRun> => {
  const caseDirectory = join(
    runDirectory,
    `${stableRunIdPart(evalCase.id)}-${run}-attempt-${attempt}`,
  );
  await mkdir(caseDirectory, { recursive: true });
  const stdoutPath = join(caseDirectory, "codex.stdout.jsonl");
  const stderrPath = join(caseDirectory, "codex.stderr.log");
  const finalMessagePath = join(caseDirectory, "final-message.json");
  const provisioned = await provisionWorkspace(
    repoRoot,
    config,
    `${stableRunIdPart(evalCase.id)}-${run}-${attempt}`,
  );
  const prompt = mode === "organic" ? evalCase.query : buildPrompt(evalCase);
  const args = buildCodexArgs(
    config,
    mode,
    model,
    provisioned.workspacePath,
    finalMessagePath,
    outputSchemaPath,
    prompt,
  );

  let outcome: ProcessOutcome;
  let actual: CodexEvalOutput | undefined;
  let error: string | undefined;
  try {
    outcome = await runProcessCapture(codexExecutable, args, {
      cwd: repoRoot,
      env: {
        ...process.env,
        CODEX_HOME: provisioned.codexHomePath,
        HOME: provisioned.homePath,
      },
      stderrPath,
      stopEarly: mode === "organic" ? (text) => detectOrganicTrigger(text).length > 0 : undefined,
      stdoutPath,
      timeoutMs: config.runner.timeoutMs,
    });
    if (mode === "organic") {
      const evidence = detectOrganicTrigger(outcome.stdoutText);
      await writeFile(
        finalMessagePath,
        `${JSON.stringify({ case_id: evalCase.id, evidence, triggered: evidence.length > 0 }, null, 2)}\n`,
        "utf8",
      );
      if (outcome.timedOut) {
        error = "codex timed out";
      } else if (outcome.code !== 0 && !outcome.stoppedEarly) {
        error = `codex exited ${outcome.code}`;
      }
    } else {
      const finalMessage = await readText(finalMessagePath).catch(() => "");
      try {
        actual = parseFinalMessage(finalMessage);
      } catch (parseError) {
        error = `Failed to parse final JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}`;
      }
      if (outcome.timedOut) {
        error = error ? `${error}; codex timed out` : "codex timed out";
      } else if (outcome.code !== 0) {
        error = error ? `${error}; codex exited ${outcome.code}` : `codex exited ${outcome.code}`;
      }
    }
  } catch (runError) {
    outcome = {
      code: 1,
      durationMs: 0,
      signal: null,
      stderrText: "",
      stoppedEarly: false,
      stdoutText: "",
      timedOut: false,
    };
    error = runError instanceof Error ? runError.message : String(runError);
  }

  const telemetry = summarizeTelemetry(outcome.stdoutText);
  const artifacts = {
    finalMessagePath,
    stderrPath,
    stdoutPath,
  };
  const scored =
    mode === "organic"
      ? scoreOrganicCaseRun(
          evalCase,
          run,
          outcome,
          telemetry,
          artifacts,
          detectOrganicTrigger(outcome.stdoutText),
          error,
        )
      : scoreCaseRun(evalCase, run, outcome, telemetry, artifacts, actual, error);
  const shouldPreserve =
    config.workspace.preserve === "always" ||
    (config.workspace.preserve === "on-failure" && scored.status === "failed");
  if (shouldPreserve) {
    scored.artifacts.workspacePath = provisioned.workspacePath;
  } else {
    await provisioned.cleanup();
  }
  return scored;
};

const shouldRetryCaseRun = (run: ScoredCaseRun, mode: EvalMode): boolean =>
  mode === "organic"
    ? Boolean(run.error)
    : Boolean(run.error) || run.exitCode !== 0 || !run.telemetry.completed || run.telemetry.failed;

const runOneCase = async (
  repoRoot: string,
  config: CodexEvalConfig,
  codexExecutable: string,
  mode: EvalMode,
  model: string,
  runDirectory: string,
  outputSchemaPath: string,
  evalCase: EvalCase,
  run: number,
): Promise<ScoredCaseRun> => {
  const maxAttempts = Math.max(1, 1 + (config.runner.retryAttempts ?? 0));
  let lastRun: ScoredCaseRun | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    lastRun = await runOneCaseAttempt(
      repoRoot,
      config,
      codexExecutable,
      mode,
      model,
      runDirectory,
      outputSchemaPath,
      evalCase,
      run,
      attempt,
    );
    if (!shouldRetryCaseRun(lastRun, mode)) return lastRun;
  }

  if (!lastRun) throw new Error(`No attempt was recorded for ${evalCase.id}`);
  return lastRun;
};

export const runCodexEvals = async (options: RunOptions = {}): Promise<CodexEvalResult> => {
  const repoRoot = resolve(options.repoRoot ?? repoRootFromScript);
  const configPath = resolve(options.configPath ?? defaultConfigPath);
  const config = await readJson<CodexEvalConfig>(configPath);
  const caseSet = await readJson<EvalCaseSet>(resolveFromRepo(repoRoot, config.caseSetPath));
  const outputSchemaPath = resolveFromRepo(repoRoot, config.outputSchemaPath);
  const mode = options.mode ?? config.runner.mode ?? "organic";
  const model = options.model ?? config.runner.model;
  const runsPerCase = options.runsPerCase ?? config.runner.runsPerCase;
  const codexExecutable = await resolveCodexExecutable(
    options.codexExecutable ?? process.env.NONCE_CODEX_EVAL_CODEX_EXECUTABLE ?? "codex",
  );
  const runId = createRunId();
  const runDirectory = resolve(
    options.runDirectory ?? join(repoRoot, "evals/artifacts/codex-runs", runId),
  );
  const resultPath = resolve(options.outputPath ?? join(runDirectory, "codex-eval-run.json"));

  if (
    config.kind !== "nonce-codex-eval" ||
    config.schemaVersion !== 1 ||
    config.runner.type !== "codex-cli"
  ) {
    throw new Error(`Invalid Codex eval config: ${configPath}`);
  }
  if (!(await pathExists(outputSchemaPath))) {
    throw new Error(`Missing output schema: ${outputSchemaPath}`);
  }

  let cases = caseSet.cases;
  if (options.caseIds && options.caseIds.length > 0) {
    const requested = new Set(options.caseIds);
    cases = cases.filter((evalCase) => requested.has(evalCase.id));
  }
  if (options.limit !== undefined) {
    cases = cases.slice(0, options.limit);
  }
  if (cases.length === 0) {
    throw new Error("No eval cases selected.");
  }

  await mkdir(runDirectory, { recursive: true });
  const codexVersion = await commandVersion(codexExecutable);
  const runs: ScoredCaseRun[] = [];
  for (const evalCase of cases) {
    for (let run = 1; run <= runsPerCase; run += 1) {
      runs.push(
        await runOneCase(
          repoRoot,
          config,
          codexExecutable,
          mode,
          model,
          runDirectory,
          outputSchemaPath,
          evalCase,
          run,
        ),
      );
    }
  }

  const summary = summarizeCodexEvalCases(runs);
  const ok = passesCodexEvalThresholds(summary, config.thresholds);
  const usageLogPath = await writeUsageLog(resultPath, runs);
  const result: CodexEvalResult = {
    artifacts: {
      resultPath,
      runDirectory,
      usageLogPath,
    },
    caseSummaries: summarizeCodexEvalCaseStability(runs),
    cases: runs,
    codexVersion,
    config: {
      approvalPolicy: config.runner.approvalPolicy,
      mode,
      model,
      runsPerCase,
      sandbox: config.runner.sandbox,
      scenarioCount: cases.length,
      timeoutMs: config.runner.timeoutMs,
    },
    createdAt: new Date().toISOString(),
    kind: "nonce-codex-eval-run",
    ok,
    schemaVersion: 1,
    summary,
  };

  await mkdir(dirname(resultPath), { recursive: true });
  await writeFile(resultPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");
  return result;
};

const parseArgs = (argv: string[]): CliOptions => {
  const options: CliOptions = {
    caseIds: [],
    codexExecutable: "codex",
    format: "text",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--") {
      continue;
    } else if (arg === "--json") {
      options.format = "json";
    } else if (arg === "--case" && next) {
      options.caseIds.push(next);
      index += 1;
    } else if (arg === "--codex" && next) {
      options.codexExecutable = next;
      index += 1;
    } else if (arg === "--config" && next) {
      options.configPath = next;
      index += 1;
    } else if (arg === "--limit" && next) {
      options.limit = Number.parseInt(next, 10);
      index += 1;
    } else if (arg === "--mode" && next) {
      if (next !== "instructed" && next !== "organic") {
        throw new Error(`Unknown mode: ${next} (expected "instructed" or "organic")`);
      }
      options.mode = next;
      index += 1;
    } else if (arg === "--model" && next) {
      options.model = next;
      index += 1;
    } else if (arg === "--output" && next) {
      options.outputPath = next;
      index += 1;
    } else if (arg === "--repo-root" && next) {
      options.repoRoot = next;
      index += 1;
    } else if (arg === "--run-dir" && next) {
      options.runDirectory = next;
      index += 1;
    } else if (arg === "--runs" && next) {
      options.runsPerCase = Number.parseInt(next, 10);
      index += 1;
    } else if (arg === "--help" || arg === "-h") {
      console.log(
        [
          "Usage: vp run evals:codex -- [--json] [--mode instructed|organic] [--case <id>] [--limit <n>] [--runs <n>]",
          "",
          "Runs the full local Codex eval suite for the installed nonce skill.",
          "In organic mode the raw user query is sent unmodified and triggering is detected from Codex command events.",
        ].join("\n"),
      );
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
};

const percent = (value: number): string => `${Math.round(value * 100)}%`;

const renderText = (result: CodexEvalResult): string => {
  const organic = result.config.mode === "organic";
  const lines = [
    `Nonce Codex evals: ${result.ok ? "PASS" : "FAIL"}`,
    `Codex: ${result.codexVersion}`,
    `Mode: ${result.config.mode}${
      organic
        ? " (raw queries, trigger detected from command events; planning/safety not measured)"
        : ""
    }`,
    `Cases: ${result.config.scenarioCount} cases, ${result.config.runsPerCase} run(s) each, ${result.summary.totalRuns} total runs`,
    `Accuracy: overall ${percent(result.summary.overallAccuracy)}, positive recall ${percent(
      result.summary.positiveRecall,
    )}, negative specificity ${percent(result.summary.negativeSpecificity)}`,
    ...Object.entries(result.summary.splits).map(
      ([split, splitSummary]) =>
        `Split ${split}: overall ${percent(splitSummary.overallAccuracy)}, positive recall ${percent(
          splitSummary.positiveRecall,
        )}, negative specificity ${percent(splitSummary.negativeSpecificity)} (${splitSummary.totalRuns} runs)`,
    ),
    ...(organic
      ? [`Critical failures: ${result.summary.criticalFailures}`]
      : [
          `Planning recall: methods ${percent(result.summary.meanMethodRecall)}, references ${percent(
            result.summary.meanReferenceRecall,
          )}, schemas ${percent(result.summary.meanSchemaRecall)}`,
          `Planning precision: methods ${percent(result.summary.meanMethodPrecision)}, references ${percent(
            result.summary.meanReferencePrecision,
          )}, schemas ${percent(result.summary.meanSchemaPrecision)}`,
          `Safety: ${percent(result.summary.safetyAccuracy)}, critical failures ${result.summary.criticalFailures}`,
        ]),
    `Artifacts: ${result.artifacts.resultPath}`,
  ];

  const unstable = result.caseSummaries.filter((caseSummary) => caseSummary.routePassRate < 1);
  if (unstable.length > 0) {
    lines.push("", "Unstable cases:");
    for (const caseSummary of unstable) {
      lines.push(
        `- ${caseSummary.id} [${caseSummary.split}]: route pass ${percent(
          caseSummary.routePassRate,
        )} over ${caseSummary.runs} run(s)`,
      );
    }
  }

  const failed = result.cases.filter((run) => run.status === "failed" || run.criticalFailure);
  if (failed.length > 0) {
    lines.push("", "Failures:");
    for (const run of failed) {
      lines.push(
        `- ${run.case.id}#${run.run}: route=${run.checks.routePass ? "pass" : "fail"}, destructive=${
          run.checks.destructivePass ? "pass" : "fail"
        }, confirmation=${run.checks.confirmationPass ? "pass" : "fail"}, methods=${percent(
          run.checks.methodRecall,
        )}`,
      );
      if (run.error) lines.push(`  ${run.error}`);
      if (run.artifacts.workspacePath) lines.push(`  workspace: ${run.artifacts.workspacePath}`);
    }
  }

  if (result.artifacts.usageLogPath) {
    lines.push(`Usage log: ${result.artifacts.usageLogPath}`);
  }

  return `${lines.join("\n")}\n`;
};

const main = async () => {
  const options = parseArgs(process.argv.slice(2));
  const result = await runCodexEvals(options);
  const output =
    options.format === "json" ? `${JSON.stringify(result, null, 2)}\n` : renderText(result);
  process.stdout.write(output);
  process.exitCode = result.ok ? 0 : 1;
};

if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}
