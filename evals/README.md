# Nonce Skill Evals

This directory contains the eval loop for the packaged `nonce` skill under `skills/`.

The loop follows the OpenAI skill-eval pattern:

1. Define a small prompt set with clear success criteria.
2. Run deterministic checks first.
3. Run all prompt cases through a local, isolated agent harness (`codex exec` or
   `claude -p`) for real skill-routing behavior.
4. Feed the observed usage log back into plugin-eval when token calibration is useful.

Both harnesses share the same case set (`nonce-skill.cases.json`), output contract
(`nonce-skill-eval.output.schema.json`), scoring checks, and thresholds, so their
reports are directly comparable.

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
`CODEX_HOME`:

```bash
vp run evals:codex
```

The runner follows the same local-first shape as `plugin-eval benchmark`:

- install the local skill into an isolated `CODEX_HOME`
- run `codex exec --json --output-schema` once for each case
- keep raw Codex JSONL, stderr, final JSON, and a normalized report under
  `evals/artifacts/codex-runs/<timestamp>/`
- write `observed-usage.jsonl` in the plugin-eval observed-usage shape

Useful debugging flags:

```bash
vp run evals:codex -- --case trigger.zh.workspace.list
vp run evals:codex -- --limit 3 --model gpt-5.4-mini
vp run evals:codex -- --json --output evals/artifacts/codex-runs/latest.json
```

The local Codex run scores routing, method planning, reference planning, schema
planning, and destructive confirmation. It does not execute the user's business
request; live Nonce access remains a separate smoke test.

## Full local Claude Code run

Run every case through Claude Code with the current skill installed as a
project-level skill inside a temporary workspace:

```bash
vp run evals:claude
```

The runner mirrors the Codex harness with Claude Code equivalents:

- copy the local skill into `<temp-workspace>/.claude/skills/nonce`
- run `claude -p --output-format stream-json --json-schema` once for each case,
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
vp run evals:claude -- --limit 3 --model claude-haiku-4-5
vp run evals:claude -- --json --output evals/artifacts/claude-runs/latest.json
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
