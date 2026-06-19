---
name: nonce
description: >-
  Use this skill when the user needs to query, inspect, or operate Nonce mining resources: workspaces, farms, miners, agents, task batches, miner tasks, metrics, history, or operational actions. Also use it when the user asks for JavaScript automation against Nonce resources. Do not use it for generic Bitcoin mining questions or unrelated Node/API work.
---

# Nonce

Nonce manages Bitcoin mining workspaces, farms, miners, agents, task batches, and miner tasks.

Use this skill to work with those resources through the local SDK/runner. Determine the user's intent, write task-specific JavaScript code against the SDK, run it locally, and use compact JSON output for the next decision.

## Before Use

- Resolve every relative path in this skill from the installed skill root, the directory containing this `SKILL.md`. Do not assume any fixed filesystem path.
- Before running scripts or writing task code, record the resolved installed skill root in context as `NONCE_SKILL_HOME` on macOS/Linux or `$NonceSkillHome` on Windows. Read `references/workflow.md` for the path setup command that prints the value back to the session.
- If the local SDK/runner environment is missing or broken, initialize or repair it before authentication or business queries. Read `references/workflow.md` for the concrete commands.
- If credentials are missing or expired, complete Nonce authentication before business queries. Read `references/auth.md` for status, login, callback, and logout flows.
- Support macOS, Linux, and Windows.

## Operating Rules

- Before writing task code, read `references/tool-signatures.md` for the method index, then read the specific method's schema file under `assets/schemas/` for full Input and Output interfaces.
- Missing IDs: discover them in order with `listWorkspaces` -> `listFarms` -> `listMiners` as needed.
- Reuse returned `workspace_id`, `farm_id`, `miner_id`, and task IDs. Never invent IDs.
- Prefer the narrowest method and scope that satisfy the user's request.
- Most operations need `workspace_id`; farm and miner operations usually also need `farm_id` or `miner_id`.
- For permission errors, report the role or scope limit. Do not broaden the operation to bypass the limit.

## Gotchas

- Run path setup first. The task-code examples assume commands run from the installed skill root and task files live under `.nonce-skill/tasks/`.
- Credentials are stored as local profile files.

## Safety

- Treat every `CreateTaskBatch_*` method as destructive because it can affect physical miners or operational/inventory state, even when the action appears read-like.
- Before any `CreateTaskBatch_*` call, explain the target and expected effect and obtain explicit user confirmation.
- Treat the local runner as a guardrail for generated task code, not as a sandbox for untrusted code.
- Read `references/safety.md` before implementing or running task-batch operations.

## References

- `references/workflow.md`: local task-code workflow, runner usage, host integration, and runtime repair.
- `references/auth.md`: authentication, profiles, credential storage, and endpoint configuration.
- `references/tool-signatures.md`: method index and shared types.
- `assets/schemas/`: per-method Input/Output interfaces and signatures.
- `references/safety.md`: destructive-operation guardrails.
