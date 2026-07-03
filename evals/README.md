# Nonce Skill Evals

This directory contains the eval loop for the packaged `nonce` skill under `skills/`.

The first-principles rule is that a model-facing eval prompt must be a real user
request. Eval labels, expected outcomes, and scoring criteria live beside the
prompt, never inside the prompt sent to Codex or Claude Code.

## Case Layout

- `cases/invoke.json` is the source of truth for live invocation evals. It
  contains raw user queries plus out-of-band `shouldTrigger` labels.
- `cases/behavior.json` is a deterministic contract suite for workflow, safety,
  method, reference, and schema coverage. It is not sent to a model as a
  classifier prompt.
- `nonce-skill-rubric.schema.json` is reserved for manual, out-of-band trace
  review when qualitative judgment is needed.

## Local Deterministic Run

```bash
vp run evals
```

This validates:

- raw invocation prompts are balanced across trigger and negative-control cases
- invoke and behavior prompts stay operator-facing and contain no eval framing
- per-class thresholds so always-trigger or never-trigger behavior cannot pass
- behavior contracts point at existing reference and schema files
- static skill contracts for path setup, schema reading, runtime import, compact
  JSON, permission boundaries, and destructive confirmation

The default deterministic run does not call Codex or Claude Code.

To write a machine-readable report:

```bash
vp run evals -- --json --output evals/artifacts/last-run.json
```

## Invocation Flow

The live flow answers one question: would the skill activate for a realistic
user request?

1. Provision the current `skills/` artifact into an isolated agent environment.
2. Send the raw `query` from `cases/invoke.json` unchanged.
3. Detect activation from tool or command events that read or invoke the installed
   `nonce` skill.
4. Score only trigger vs no-trigger. Planning and safety are evaluated by
   deterministic behavior contracts unless a future trace-derived behavior eval
   can observe real tool usage without asking the model to self-classify.

Run Codex invocation evals:

```bash
vp run evals:codex
```

Run Claude Code invocation evals:

```bash
vp run evals:claude
```

Both runners write raw JSONL, stderr, final trigger evidence, a normalized report,
and plugin-eval-compatible usage logs under `evals/artifacts/`.

Useful debugging flags:

```bash
vp run evals:codex -- --case train.trigger.01 --runs 1
vp run evals:codex -- --limit 3 --runs 1
vp run evals:claude -- --limit 3 --runs 1
vp run evals:codex -- --json --output evals/artifacts/codex-runs/latest.json
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
