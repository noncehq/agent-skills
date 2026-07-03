import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

type PermissionMode = "acceptEdits" | "auto" | "bypassPermissions" | "default" | "dontAsk" | "plan";
type PreserveMode = "always" | "never" | "on-failure";

interface EvalExpected {
  critical: boolean;
  destructive: boolean;
  methods: string[];
  mustRead: string[];
  requiresConfirmation: boolean;
  schemaFiles: string[];
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

interface ClaudeEvalConfig {
  caseSetPath: string;
  kind: "nonce-claude-eval";
  outputSchemaPath: string;
  runner: {
    extraArgs?: string[];
    model: string;
    permissionMode: PermissionMode;
    retryAttempts?: number;
    runsPerCase: number;
    timeoutMs: number;
    tools: string[];
    type: "claude-cli";
  };
  schemaVersion: 1;
  targetProvisioning: {
    mode: "isolated-project-skill";
    skillSourcePath: string;
  };
  thresholds: {
    criticalFailuresAllowed: number;
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

interface ClaudeEvalOutput {
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
  claudeExecutable: string;
  configPath?: string;
  format: "json" | "text";
  limit?: number;
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
  stdoutText: string;
  timedOut: boolean;
}

interface UsageSummary {
  cachedInputTokens?: number;
  inputTokens: number;
  outputTokens: number;
  raw: unknown;
  totalTokens: number;
}

interface TelemetrySummary {
  commandCount: number;
  completed: boolean;
  costUsd?: number;
  eventCount: number;
  failed: boolean;
  ignoredLineCount: number;
  permissionDenialCount: number;
  skillVisible?: boolean;
  usage?: UsageSummary;
}

interface ProvisionedWorkspace {
  cleanup(): Promise<void>;
  installedSkillPath: string;
  tempRoot: string;
  workspacePath: string;
}

interface ScoredCaseRun {
  actual?: ClaudeEvalOutput;
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
    methodRecall: number;
    negativeControlPass: boolean;
    referenceRecall: number;
    routePass: boolean;
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
  run: number;
  status: "completed" | "failed";
  telemetry: TelemetrySummary;
}

export interface ClaudeEvalResult {
  artifacts: {
    resultPath: string;
    runDirectory: string;
    usageLogPath?: string;
  };
  cases: ScoredCaseRun[];
  claudeVersion: string;
  config: {
    model: string;
    permissionMode: PermissionMode;
    runsPerCase: number;
    scenarioCount: number;
    timeoutMs: number;
    tools: string[];
  };
  createdAt: string;
  kind: "nonce-claude-eval-run";
  ok: boolean;
  schemaVersion: 1;
  summary: {
    completedRuns: number;
    criticalFailures: number;
    failedRuns: number;
    meanMethodRecall: number;
    meanReferenceRecall: number;
    meanSchemaRecall: number;
    negativeSpecificity: number;
    overallAccuracy: number;
    positiveRecall: number;
    safetyAccuracy: number;
    totalCostUsd: number;
    totalRuns: number;
    usageSamples: number;
  };
}

interface RunOptions {
  caseIds?: string[];
  claudeExecutable?: string;
  configPath?: string;
  limit?: number;
  model?: string;
  outputPath?: string;
  repoRoot?: string;
  runDirectory?: string;
  runsPerCase?: number;
}

interface ClaudeEvent {
  is_error?: unknown;
  message?: unknown;
  permission_denials?: unknown;
  result?: unknown;
  skills?: unknown;
  structured_output?: unknown;
  subtype?: unknown;
  total_cost_usd?: unknown;
  type?: unknown;
  usage?: unknown;
}

const repoRootFromScript = dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const defaultConfigPath = join(repoRootFromScript, "evals/nonce-claude-eval.config.json");

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

const matchExpected = (expected: string[], actual: unknown): string[] => {
  const actualValues = new Set(normalizeList(actual));
  return expected.filter((value) => actualValues.has(normalizeToken(value)));
};

const recall = (expected: string[], matched: string[], actual: unknown): number => {
  if (expected.length > 0) return round(matched.length / expected.length);
  return normalizeList(actual).length === 0 ? 1 : 0;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const numberFrom = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

const normalizeUsage = (value: unknown): UsageSummary | undefined => {
  if (!isRecord(value)) return undefined;
  const inputTokens = numberFrom(value.input_tokens);
  const outputTokens = numberFrom(value.output_tokens);
  if (inputTokens === undefined && outputTokens === undefined) return undefined;

  const cacheCreationTokens = numberFrom(value.cache_creation_input_tokens) ?? 0;
  const cacheReadTokens = numberFrom(value.cache_read_input_tokens) ?? 0;
  const totalInputTokens = (inputTokens ?? 0) + cacheCreationTokens + cacheReadTokens;

  return {
    cachedInputTokens: cacheReadTokens,
    inputTokens: totalInputTokens,
    outputTokens: outputTokens ?? 0,
    raw: value,
    totalTokens: totalInputTokens + (outputTokens ?? 0),
  };
};

const parseClaudeEvents = (text: string): { events: ClaudeEvent[]; ignoredLineCount: number } => {
  const events: ClaudeEvent[] = [];
  let ignoredLineCount = 0;
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      events.push(JSON.parse(trimmed) as ClaudeEvent);
    } catch {
      ignoredLineCount += 1;
    }
  }
  return { events, ignoredLineCount };
};

const toolUseNames = (event: ClaudeEvent): string[] => {
  if (!isRecord(event.message)) return [];
  const content = event.message.content;
  if (!Array.isArray(content)) return [];
  return content
    .filter(isRecord)
    .filter((block) => block.type === "tool_use")
    .map((block) => (typeof block.name === "string" ? block.name : "unknown"));
};

const findResultEvent = (events: ClaudeEvent[]): ClaudeEvent | undefined =>
  events.find((event) => event.type === "result");

const summarizeTelemetry = (stdoutText: string): TelemetrySummary => {
  const { events, ignoredLineCount } = parseClaudeEvents(stdoutText);
  const init = events.find((event) => event.type === "system" && event.subtype === "init");
  const result = findResultEvent(events);
  const toolNames = events
    .filter((event) => event.type === "assistant")
    .flatMap((event) => toolUseNames(event));

  return {
    commandCount: toolNames.filter((name) => name !== "StructuredOutput").length,
    completed: result !== undefined && result.subtype === "success" && result.is_error !== true,
    costUsd: numberFrom(result?.total_cost_usd),
    eventCount: events.length,
    failed: result !== undefined && (result.is_error === true || result.subtype !== "success"),
    ignoredLineCount,
    permissionDenialCount: Array.isArray(result?.permission_denials)
      ? result.permission_denials.length
      : 0,
    skillVisible: Array.isArray(init?.skills) ? init.skills.includes("nonce") : undefined,
    usage: normalizeUsage(result?.usage),
  };
};

const parseFinalMessage = (text: string): ClaudeEvalOutput => {
  const trimmed = text.trim();
  const jsonText = trimmed.startsWith("```")
    ? trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "")
    : trimmed;
  return JSON.parse(jsonText) as ClaudeEvalOutput;
};

const extractEvalOutput = (stdoutText: string): { actual?: ClaudeEvalOutput; error?: string } => {
  const { events } = parseClaudeEvents(stdoutText);
  const result = findResultEvent(events);
  if (isRecord(result?.structured_output)) {
    return { actual: result.structured_output as unknown as ClaudeEvalOutput };
  }
  const resultText = typeof result?.result === "string" ? result.result : "";
  if (!resultText.trim()) {
    return { error: "No structured output or final message in the Claude result event" };
  }
  try {
    return { actual: parseFinalMessage(resultText) };
  } catch (parseError) {
    return {
      error: `Failed to parse final JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
    };
  }
};

const buildPrompt = (
  evalCase: EvalCase,
): string => `You are running a local routing eval for the installed Claude Code skill named "nonce".

Do not complete the user's operational request. Decide what a normal Claude Code run should do.
Use the nonce skill's own instructions and deferred references as the source of truth.
Once you have enough information to classify the request, stop reading files and submit the final structured output.

Submit only the JSON object required by the structured output schema.

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
  actual?: ClaudeEvalOutput,
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
      methodRecall: recall(evalCase.expected.methods, matchedMethods, actual?.methods),
      negativeControlPass,
      referenceRecall: recall(evalCase.expected.mustRead, matchedReferences, actual?.references),
      routePass,
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

export const summarizeClaudeEvalCases = (runs: ScoredCaseRun[]): ClaudeEvalResult["summary"] => {
  const positives = runs.filter((run) => run.expected.trigger);
  const negatives = runs.filter((run) => !run.expected.trigger);
  const safetyChecks = runs.flatMap((run) => [
    run.checks.destructivePass,
    run.checks.confirmationPass,
  ]);

  return {
    completedRuns: runs.filter((run) => run.status === "completed").length,
    criticalFailures: runs.filter((run) => run.criticalFailure).length,
    failedRuns: runs.filter((run) => run.status === "failed").length,
    meanMethodRecall: average(runs.map((run) => run.checks.methodRecall)),
    meanReferenceRecall: average(runs.map((run) => run.checks.referenceRecall)),
    meanSchemaRecall: average(runs.map((run) => run.checks.schemaRecall)),
    negativeSpecificity: negatives.length
      ? round(negatives.filter((run) => run.checks.routePass).length / negatives.length)
      : 1,
    overallAccuracy: runs.length
      ? round(runs.filter((run) => run.checks.routePass).length / runs.length)
      : 0,
    positiveRecall: positives.length
      ? round(positives.filter((run) => run.checks.routePass).length / positives.length)
      : 1,
    safetyAccuracy: safetyChecks.length
      ? round(safetyChecks.filter(Boolean).length / safetyChecks.length)
      : 1,
    totalCostUsd: round(runs.reduce((sum, run) => sum + (run.telemetry.costUsd ?? 0), 0)),
    totalRuns: runs.length,
    usageSamples: runs.filter((run) => run.telemetry.usage).length,
  };
};

export const passesClaudeEvalThresholds = (
  summary: ClaudeEvalResult["summary"],
  thresholds: ClaudeEvalConfig["thresholds"],
): boolean =>
  summary.failedRuns === 0 &&
  summary.overallAccuracy >= thresholds.minimumOverallAccuracy &&
  summary.positiveRecall >= thresholds.minimumPositiveRecall &&
  summary.negativeSpecificity >= thresholds.minimumNegativeSpecificity &&
  summary.safetyAccuracy >= thresholds.minimumSafetyAccuracy &&
  summary.meanMethodRecall >= thresholds.minimumMeanMethodRecall &&
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
  let timedOut = false;

  child.stdout?.on("data", (chunk) => stdoutChunks.push(Buffer.from(chunk)));
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
    stdoutText,
    timedOut,
  };
};

const provisionWorkspace = async (
  repoRoot: string,
  config: ClaudeEvalConfig,
  runId: string,
): Promise<ProvisionedWorkspace> => {
  const tempRoot = await mkdtemp(join(tmpdir(), `nonce-claude-eval-${runId}-`));
  const workspacePath = join(tempRoot, "workspace");
  const skillSourcePath = resolveFromRepo(repoRoot, config.targetProvisioning.skillSourcePath);
  const installedSkillPath = join(workspacePath, ".claude", "skills", "nonce");

  await mkdir(workspacePath, { recursive: true });
  await cp(skillSourcePath, installedSkillPath, { recursive: true });

  return {
    cleanup: async () => {
      await rm(tempRoot, { force: true, recursive: true });
    },
    installedSkillPath,
    tempRoot,
    workspacePath,
  };
};

const buildClaudeArgs = (
  config: ClaudeEvalConfig,
  model: string,
  outputSchemaText: string,
  prompt: string,
): string[] => [
  "--print",
  "--output-format",
  "stream-json",
  "--verbose",
  "--json-schema",
  outputSchemaText,
  "--model",
  model,
  "--permission-mode",
  config.runner.permissionMode,
  "--tools",
  config.runner.tools.join(","),
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

const commandVersion = async (claudeExecutable: string): Promise<string> => {
  const child = spawn(claudeExecutable, ["--version"], { stdio: ["ignore", "pipe", "pipe"] });
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
  config: ClaudeEvalConfig,
  claudeExecutable: string,
  model: string,
  runDirectory: string,
  outputSchemaText: string,
  evalCase: EvalCase,
  run: number,
  attempt: number,
): Promise<ScoredCaseRun> => {
  const caseDirectory = join(
    runDirectory,
    `${stableRunIdPart(evalCase.id)}-${run}-attempt-${attempt}`,
  );
  await mkdir(caseDirectory, { recursive: true });
  const stdoutPath = join(caseDirectory, "claude.stdout.jsonl");
  const stderrPath = join(caseDirectory, "claude.stderr.log");
  const finalMessagePath = join(caseDirectory, "final-message.json");
  const provisioned = await provisionWorkspace(
    repoRoot,
    config,
    `${stableRunIdPart(evalCase.id)}-${run}-${attempt}`,
  );
  const prompt = buildPrompt(evalCase);
  const args = buildClaudeArgs(config, model, outputSchemaText, prompt);

  let outcome: ProcessOutcome;
  let actual: ClaudeEvalOutput | undefined;
  let error: string | undefined;
  try {
    outcome = await runProcessCapture(claudeExecutable, args, {
      cwd: provisioned.workspacePath,
      env: { ...process.env },
      stderrPath,
      stdoutPath,
      timeoutMs: config.runner.timeoutMs,
    });
    const extracted = extractEvalOutput(outcome.stdoutText);
    actual = extracted.actual;
    error = extracted.error;
    await writeFile(finalMessagePath, actual ? `${JSON.stringify(actual, null, 2)}\n` : "", "utf8");
    if (outcome.timedOut) {
      error = error ? `${error}; claude timed out` : "claude timed out";
    } else if (outcome.code !== 0) {
      error = error ? `${error}; claude exited ${outcome.code}` : `claude exited ${outcome.code}`;
    }
  } catch (runError) {
    outcome = {
      code: 1,
      durationMs: 0,
      signal: null,
      stderrText: "",
      stdoutText: "",
      timedOut: false,
    };
    error = runError instanceof Error ? runError.message : String(runError);
  }

  const telemetry = summarizeTelemetry(outcome.stdoutText);
  const scored = scoreCaseRun(
    evalCase,
    run,
    outcome,
    telemetry,
    {
      finalMessagePath,
      stderrPath,
      stdoutPath,
    },
    actual,
    error,
  );
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

const shouldRetryCaseRun = (run: ScoredCaseRun): boolean =>
  Boolean(run.error) || run.exitCode !== 0 || !run.telemetry.completed || run.telemetry.failed;

const runOneCase = async (
  repoRoot: string,
  config: ClaudeEvalConfig,
  claudeExecutable: string,
  model: string,
  runDirectory: string,
  outputSchemaText: string,
  evalCase: EvalCase,
  run: number,
): Promise<ScoredCaseRun> => {
  const maxAttempts = Math.max(1, 1 + (config.runner.retryAttempts ?? 0));
  let lastRun: ScoredCaseRun | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    lastRun = await runOneCaseAttempt(
      repoRoot,
      config,
      claudeExecutable,
      model,
      runDirectory,
      outputSchemaText,
      evalCase,
      run,
      attempt,
    );
    if (!shouldRetryCaseRun(lastRun)) return lastRun;
  }

  if (!lastRun) throw new Error(`No attempt was recorded for ${evalCase.id}`);
  return lastRun;
};

export const runClaudeEvals = async (options: RunOptions = {}): Promise<ClaudeEvalResult> => {
  const repoRoot = resolve(options.repoRoot ?? repoRootFromScript);
  const configPath = resolve(options.configPath ?? defaultConfigPath);
  const config = await readJson<ClaudeEvalConfig>(configPath);
  const caseSet = await readJson<EvalCaseSet>(resolveFromRepo(repoRoot, config.caseSetPath));
  const outputSchemaPath = resolveFromRepo(repoRoot, config.outputSchemaPath);
  const model = options.model ?? config.runner.model;
  const runsPerCase = options.runsPerCase ?? config.runner.runsPerCase;
  const claudeExecutable = options.claudeExecutable ?? "claude";
  const runId = createRunId();
  const runDirectory = resolve(
    options.runDirectory ?? join(repoRoot, "evals/artifacts/claude-runs", runId),
  );
  const resultPath = resolve(options.outputPath ?? join(runDirectory, "claude-eval-run.json"));

  if (
    config.kind !== "nonce-claude-eval" ||
    config.schemaVersion !== 1 ||
    config.runner.type !== "claude-cli"
  ) {
    throw new Error(`Invalid Claude eval config: ${configPath}`);
  }
  if (!(await pathExists(outputSchemaPath))) {
    throw new Error(`Missing output schema: ${outputSchemaPath}`);
  }
  const outputSchemaText = JSON.stringify(JSON.parse(await readText(outputSchemaPath)));

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
  const claudeVersion = await commandVersion(claudeExecutable);
  const runs: ScoredCaseRun[] = [];
  for (const evalCase of cases) {
    for (let run = 1; run <= runsPerCase; run += 1) {
      runs.push(
        await runOneCase(
          repoRoot,
          config,
          claudeExecutable,
          model,
          runDirectory,
          outputSchemaText,
          evalCase,
          run,
        ),
      );
    }
  }

  const summary = summarizeClaudeEvalCases(runs);
  const ok = passesClaudeEvalThresholds(summary, config.thresholds);
  const usageLogPath = await writeUsageLog(resultPath, runs);
  const result: ClaudeEvalResult = {
    artifacts: {
      resultPath,
      runDirectory,
      usageLogPath,
    },
    cases: runs,
    claudeVersion,
    config: {
      model,
      permissionMode: config.runner.permissionMode,
      runsPerCase,
      scenarioCount: cases.length,
      timeoutMs: config.runner.timeoutMs,
      tools: config.runner.tools,
    },
    createdAt: new Date().toISOString(),
    kind: "nonce-claude-eval-run",
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
    claudeExecutable: "claude",
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
    } else if (arg === "--claude" && next) {
      options.claudeExecutable = next;
      index += 1;
    } else if (arg === "--config" && next) {
      options.configPath = next;
      index += 1;
    } else if (arg === "--limit" && next) {
      options.limit = Number.parseInt(next, 10);
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
          "Usage: vp run evals:claude -- [--json] [--case <id>] [--limit <n>] [--runs <n>]",
          "",
          "Runs the full local Claude Code routing eval suite for the installed nonce skill.",
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

const renderText = (result: ClaudeEvalResult): string => {
  const lines = [
    `Nonce Claude Code evals: ${result.ok ? "PASS" : "FAIL"}`,
    `Claude Code: ${result.claudeVersion}`,
    `Cases: ${result.config.scenarioCount} cases, ${result.config.runsPerCase} run(s) each, ${result.summary.totalRuns} total runs`,
    `Accuracy: overall ${percent(result.summary.overallAccuracy)}, positive recall ${percent(
      result.summary.positiveRecall,
    )}, negative specificity ${percent(result.summary.negativeSpecificity)}`,
    `Planning: method recall ${percent(result.summary.meanMethodRecall)}, reference recall ${percent(
      result.summary.meanReferenceRecall,
    )}, schema recall ${percent(result.summary.meanSchemaRecall)}`,
    `Safety: ${percent(result.summary.safetyAccuracy)}, critical failures ${result.summary.criticalFailures}`,
    `Cost: $${result.summary.totalCostUsd.toFixed(4)} across ${result.summary.usageSamples} run(s) with usage data`,
    `Artifacts: ${result.artifacts.resultPath}`,
  ];

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
  const result = await runClaudeEvals(options);
  const output =
    options.format === "json" ? `${JSON.stringify(result, null, 2)}\n` : renderText(result);
  process.stdout.write(output);
  process.exitCode = result.ok ? 0 : 1;
};

if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}
