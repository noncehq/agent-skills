# Nonce Skill Evals

This directory contains the eval loop for the packaged `nonce` skill under `skills/`.

The loop follows the OpenAI skill-eval pattern:

1. Define a small prompt set with clear success criteria.
2. Run deterministic checks first.
3. Run all prompt cases through a local, isolated agent harness (`codex exec` or
   `claude -p`) using the raw user query as the prompt.
4. Feed the observed usage log back into plugin-eval when token calibration is useful.

Both harnesses share the same case set (`nonce-skill.cases.json`), scoring
checks, and thresholds, so their trigger reports are directly comparable. The
structured output contract (`nonce-skill-eval.output.schema.json`) is used only
by the explicit instructed planning mode.

Shared scoring conventions:

- Each case runs `runsPerCase` times (default 3) so single-run flakes do not flip
  the suite; the report includes per-case route pass rates and flags unstable cases.
- Results are also broken down by `split` (`train` vs `validation`). When you edit
  the skill description based on eval failures, judge the change by the validation
  split to avoid overfitting to the train prompts.
- `expected.methods` and `expected.schemaFiles` entries can be a string or an
  array of equivalent alternatives (for example `["listMiners", "searchMiners"]`);
  any alternative counts as a hit for recall.
- Planning is scored with recall AND precision. Recall alone is gameable — listing
  every method would score 100% — so precision penalizes over-reporting.

## Local deterministic run

```bash
vp run evals
```

This validates:

- prompt coverage across trigger, near-miss, workflow, safety, and permission cases
- natural, operator-facing prompts that avoid implementation jargon such as MCP,
  OpenAPI, JavaScript, or task-batch internals
- per-class thresholds so always-trigger or never-trigger behavior cannot pass
- required reference and schema files used by the cases
- static skill contracts for path setup, schema reading, runtime import, compact JSON,
  permission boundaries, and destructive confirmation

The default run does not call Codex.

To write a machine-readable report:

```bash
vp run evals -- --json --output evals/artifacts/last-run.json
```

## Full local Codex run

Run every case through Codex with the current skill installed into a temporary
`CODEX_HOME`. The default mode sends the raw `query` from each case without eval
framing and detects triggering from Codex command events that read the installed
`nonce` skill:

```bash
vp run evals:codex
```

The runner follows the same local-first shape as `plugin-eval benchmark`:

- install the local skill into an isolated `CODEX_HOME`
- run `codex exec --json` once for each case
- keep raw Codex JSONL, stderr, final JSON, and a normalized report under
  `evals/artifacts/codex-runs/<timestamp>/`
- write `observed-usage.jsonl` in the plugin-eval observed-usage shape

Useful debugging flags:

```bash
vp run evals:codex -- --case trigger.zh.workspace.list
vp run evals:codex -- --limit 3 --model gpt-5.4-mini
vp run evals:codex -- --json --output evals/artifacts/codex-runs/latest.json
vp run evals:codex:instructed
```

Organic Codex mode scores activation only. The optional instructed mode is a
planning harness: it uses structured output to score method planning, reference
planning, schema planning, and destructive confirmation after activation has
already been evaluated with raw prompts.

## Full local Claude Code run

Run every case through Claude Code with the current skill installed as a
project-level skill inside a temporary workspace. The default mode also sends
the raw `query` from each case without additional instructions:

```bash
vp run evals:claude
```

The runner mirrors the Codex harness with Claude Code equivalents:

- copy the local skill into `<temp-workspace>/.claude/skills/nonce`
- run `claude -p --output-format stream-json` once for each case,
  with `--setting-sources project` and `--strict-mcp-config` so user-level
  skills, plugins, CLAUDE.md, and MCP servers stay out of the eval environment
- restrict the built-in toolset to `Read,Glob,Grep,Skill` (the read-only analog
  of the Codex sandbox)
- keep raw stream JSONL, stderr, final JSON, and a normalized report under
  `evals/artifacts/claude-runs/<timestamp>/`
- write `observed-usage.jsonl` in the plugin-eval observed-usage shape

Authentication reuses the machine's normal Claude Code login (keychain OAuth,
`ANTHROPIC_API_KEY`, or `CLAUDE_CODE_OAUTH_TOKEN`); the harness never copies or
relocates credentials.

Useful debugging flags:

```bash
vp run evals:claude -- --case trigger.zh.workspace.list
vp run evals:claude -- --limit 3 --model claude-haiku-4-5 --runs 1
vp run evals:claude -- --json --output evals/artifacts/claude-runs/latest.json
vp run evals:claude:instructed
```

### Trigger And Planning Modes

Organic mode follows the same approach as the official skill-creator trigger
eval: the raw user query is sent unmodified, and triggering is detected from
tool or command events. The run is stopped as soon as triggering is detected, so
positive cases stay cheap.

```bash
vp run evals:claude:organic
vp run evals:codex:organic -- --case trigger.zh.workspace.list
vp run evals:claude -- --mode organic --case trigger.zh.workspace.list
```

Organic mode scores routing only (trigger vs no-trigger per case); planning and
safety metrics are not measured because the model is not asked to produce them.
Run instructed mode only when you want a planning score after organic activation
has already been validated:

```bash
vp run evals:codex:instructed
vp run evals:claude:instructed
```

## Plugin Eval

For broad skill-health analysis, use the installed `plugin-eval` workflow:

```bash
plugin-eval start ./skills --request 'Evaluate this skill.' --format markdown
plugin-eval analyze ./skills --format markdown
plugin-eval analyze ./skills \
  --observed-usage evals/artifacts/codex-runs/<timestamp>/observed-usage.jsonl \
  --format markdown
```

If the `plugin-eval` binary is not linked into `PATH`, run the installed plugin's
`scripts/plugin-eval.js` with Node.

## Rubric Output

Use `nonce-skill-rubric.schema.json` with `codex exec --output-schema` for qualitative
checks that need model judgment, such as whether the final answer stayed concise or
explained a permission limit clearly.
