import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  flattenInvokeCases,
  getInvokeRunsPerCase,
  getInvokeThresholds,
  type InvokeEvalCase,
  type InvokeEvalCaseSet,
  type InvokeEvalThresholds,
} from "./invoke-eval-cases.js";

type PermissionMode = "acceptEdits" | "bypassPermissions" | "default" | "plan" | "rejectEdits";
type PreserveMode = "always" | "never" | "on-failure";

interface ClaudeEvalConfig {
  caseSetPath: string;
  kind: "nonce-claude-eval";
  runner: {
    extraArgs?: string[];
    model: string;
    permissionMode: PermissionMode;
    retryAttempts?: number;
    runsPerCase?: number;
    timeoutMs: number;
    tools: string[];
    type: "claude-cli";
  };
  schemaVersion: 1;
  targetProvisioning: {
    mode: "isolated-project-skill";
    skillSourcePath: string;
  };
  thresholds?: Partial<InvokeEvalThresholds>;
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
  stoppedEarly: boolean;
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
    reason: string;
    split: string;
  };
  checks: {
    negativeControlPass: boolean;
    routePass: boolean;
  };
  criticalFailure: boolean;
  durationMs: number;
  error?: string;
  exitCode: number;
  expected: {
    critical: boolean;
    trigger: boolean;
  };
  organic: {
    evidence: string[];
    triggered: boolean;
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
  caseSummaries: CaseSummary[];
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
    negativeSpecificity: number;
    overallAccuracy: number;
    positiveRecall: number;
    splits: Record<string, SplitSummary>;
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
  subtype?: unknown;
  total_cost_usd?: unknown;
  type?: unknown;
  usage?: unknown;
}

const repoRootFromScript = dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const defaultConfigPath = join(repoRootFromScript, "evals/nonce-claude-eval.config.json");

const readText = (path: string) => readFile(path, "utf8");
const readJson = async <T>(path: string): Promise<T> => JSON.parse(await readText(path)) as T;

const resolveFromRepo = (repoRoot: string, relativeOrAbsolutePath: string): string =>
  resolve(repoRoot, relativeOrAbsolutePath);

const round = (value: number): number => Number(value.toFixed(4));

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

const toolUseBlocks = (event: ClaudeEvent): { input: unknown; name: string }[] => {
  if (event.type !== "assistant" || !isRecord(event.message)) return [];
  const content = event.message.content;
  if (!Array.isArray(content)) return [];
  return content
    .filter(isRecord)
    .filter((block) => block.type === "tool_use")
    .map((block) => ({
      input: block.input,
      name: typeof block.name === "string" ? block.name : "unknown",
    }));
};

const toolUseNames = (event: ClaudeEvent): string[] =>
  toolUseBlocks(event).map((block) => block.name);

export const detectOrganicTrigger = (stdoutText: string): string[] => {
  const { events } = parseClaudeEvents(stdoutText);
  const evidence: string[] = [];
  let sawNonceSkillUse = false;
  for (const event of events) {
    for (const block of toolUseBlocks(event)) {
      const inputText = JSON.stringify(block.input ?? {});
      if (block.name === "Skill" && isRecord(block.input) && block.input.skill === "nonce") {
        sawNonceSkillUse = true;
        evidence.push(`Skill: ${inputText.slice(0, 160)}`);
      } else if (sawNonceSkillUse && inputText.includes(".claude/skills/nonce")) {
        evidence.push(`${block.name}: ${inputText.slice(0, 160)}`);
      }
    }
  }
  return evidence;
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
    commandCount: toolNames.length,
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

const scoreCaseRun = (
  evalCase: InvokeEvalCase,
  run: number,
  outcome: ProcessOutcome,
  telemetry: TelemetrySummary,
  artifacts: ScoredCaseRun["artifacts"],
  evidence: string[],
  error?: string,
): ScoredCaseRun => {
  const triggered = evidence.length > 0;
  const routePass = triggered === evalCase.shouldTrigger;

  return {
    artifacts,
    case: {
      category: evalCase.category,
      id: evalCase.id,
      language: evalCase.language,
      query: evalCase.query,
      reason: evalCase.reason,
      split: evalCase.split,
    },
    checks: {
      negativeControlPass: evalCase.shouldTrigger || !triggered,
      routePass,
    },
    criticalFailure: evalCase.critical && !routePass,
    durationMs: outcome.durationMs,
    error,
    exitCode: outcome.code,
    expected: {
      critical: evalCase.critical,
      trigger: evalCase.shouldTrigger,
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

export const summarizeClaudeEvalCaseStability = (runs: ScoredCaseRun[]): CaseSummary[] => {
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

export const summarizeClaudeEvalCases = (runs: ScoredCaseRun[]): ClaudeEvalResult["summary"] => ({
  ...summarizeSplit(runs),
  completedRuns: runs.filter((run) => run.status === "completed").length,
  criticalFailures: runs.filter((run) => run.criticalFailure).length,
  failedRuns: runs.filter((run) => run.status === "failed").length,
  splits: summarizeSplits(runs),
  totalCostUsd: round(runs.reduce((sum, run) => sum + (run.telemetry.costUsd ?? 0), 0)),
  usageSamples: runs.filter((run) => run.telemetry.usage).length,
});

export const passesClaudeEvalThresholds = (
  summary: ClaudeEvalResult["summary"],
  thresholds: InvokeEvalThresholds,
): boolean =>
  summary.failedRuns === 0 &&
  summary.overallAccuracy >= thresholds.minimumOverallAccuracy &&
  summary.positiveRecall >= thresholds.minimumPositiveRecall &&
  summary.negativeSpecificity >= thresholds.minimumNegativeSpecificity &&
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

const buildClaudeArgs = (config: ClaudeEvalConfig, model: string, prompt: string): string[] => [
  "--print",
  "--output-format",
  "stream-json",
  "--verbose",
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
  evalCase: InvokeEvalCase,
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
  const args = buildClaudeArgs(config, model, evalCase.query);

  let outcome: ProcessOutcome;
  let error: string | undefined;
  try {
    outcome = await runProcessCapture(claudeExecutable, args, {
      cwd: provisioned.workspacePath,
      env: { ...process.env },
      stderrPath,
      stdoutPath,
      stopEarly: (text) => detectOrganicTrigger(text).length > 0,
      timeoutMs: config.runner.timeoutMs,
    });
    if (outcome.timedOut) {
      error = "claude timed out";
    } else if (outcome.code !== 0 && !outcome.stoppedEarly) {
      error = `claude exited ${outcome.code}`;
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

  const evidence = detectOrganicTrigger(outcome.stdoutText);
  await writeFile(
    finalMessagePath,
    `${JSON.stringify({ case_id: evalCase.id, evidence, triggered: evidence.length > 0 }, null, 2)}\n`,
    "utf8",
  );

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
    evidence,
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

const runOneCase = async (
  repoRoot: string,
  config: ClaudeEvalConfig,
  claudeExecutable: string,
  model: string,
  runDirectory: string,
  evalCase: InvokeEvalCase,
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
      evalCase,
      run,
      attempt,
    );
    if (!lastRun.error) return lastRun;
  }

  if (!lastRun) throw new Error(`No attempt was recorded for ${evalCase.id}`);
  return lastRun;
};

export const runClaudeEvals = async (options: RunOptions = {}): Promise<ClaudeEvalResult> => {
  const repoRoot = resolve(options.repoRoot ?? repoRootFromScript);
  const configPath = resolve(options.configPath ?? defaultConfigPath);
  const config = await readJson<ClaudeEvalConfig>(configPath);
  const caseSet = await readJson<InvokeEvalCaseSet>(resolveFromRepo(repoRoot, config.caseSetPath));
  const thresholds = { ...getInvokeThresholds(caseSet), ...config.thresholds };
  const model = options.model ?? config.runner.model;
  const runsPerCase =
    options.runsPerCase ?? config.runner.runsPerCase ?? getInvokeRunsPerCase(caseSet);
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

  let cases = flattenInvokeCases(caseSet);
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
        await runOneCase(repoRoot, config, claudeExecutable, model, runDirectory, evalCase, run),
      );
    }
  }

  const summary = summarizeClaudeEvalCases(runs);
  const ok = passesClaudeEvalThresholds(summary, thresholds);
  const usageLogPath = await writeUsageLog(resultPath, runs);
  const result: ClaudeEvalResult = {
    artifacts: {
      resultPath,
      runDirectory,
      usageLogPath,
    },
    caseSummaries: summarizeClaudeEvalCaseStability(runs),
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
    } else if (arg === "--mode" && next) {
      if (next !== "organic") {
        throw new Error(`Unknown mode: ${next} (only raw organic invocation evals are supported)`);
      }
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
          "Runs the raw local Claude Code invocation eval suite for the installed nonce skill.",
          "Each prompt is the case's user query, and triggering is detected from tool events.",
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
    `Nonce Claude Code invoke evals: ${result.ok ? "PASS" : "FAIL"}`,
    `Claude Code: ${result.claudeVersion}`,
    `Prompt mode: raw user queries`,
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
    `Critical failures: ${result.summary.criticalFailures}`,
    `Cost: $${result.summary.totalCostUsd.toFixed(4)} across ${result.summary.usageSamples} run(s) with usage data`,
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
        `- ${run.case.id}#${run.run}: expected=${run.expected.trigger ? "trigger" : "no-trigger"}, observed=${
          run.organic.triggered ? "trigger" : "no-trigger"
        }`,
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
