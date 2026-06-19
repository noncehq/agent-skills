---
name: nonce
description: Use when a task, agent, or host application needs to query or operate Nonce resources such as workspaces, farms, miners, agents, task batches, or miner tasks through the local JavaScript SDK/runner.
---

# Nonce

Nonce manages Bitcoin mining workspaces, farms, miners, agents, task batches, and miner tasks.

Use this skill to work with those resources through the local SDK/runner. Determine the user's intent, write task-specific JavaScript code against the SDK, run it locally, and use compact JSON output for the next decision.

## Before Use

- Resolve every relative path in this skill from the installed skill root, the directory containing this `SKILL.md`. Do not assume any fixed filesystem path.
- If the local SDK/runner environment is missing or broken, initialize or repair it before authentication or business queries. Read `references/workflow.md` for the concrete commands.
- If credentials are missing or expired, complete Nonce authentication before business queries. Read `references/auth.md` for status, login, callback, and logout flows.
- Support macOS and Windows.

## Operating Rules

- Before writing task code, read `references/tool-signatures.md` for available typed methods and interfaces.
- Missing IDs: discover them in order with `ListWorkspaces` -> `ListFarms` -> `ListMiners` as needed.
- Reuse returned `workspace_id`, `farm_id`, `miner_id`, and task IDs. Never invent IDs.
- Prefer the narrowest method and scope that satisfy the user's request.
- Most operations need `workspace_id`; farm and miner operations usually also need `farm_id` or `miner_id`.
- For permission errors, report the role or scope limit. Do not broaden the operation to bypass the limit.

## Safety

- Treat every `CreateTaskBatch_*` method as destructive because it can affect physical miners or operational/inventory state, even when the action appears read-like.
- Before any `CreateTaskBatch_*` call, explain the target and expected effect and obtain explicit user confirmation.
- Treat the local runner as a guardrail for generated task code, not as a sandbox for untrusted code.
- Read `references/safety.md` before implementing or running task-batch operations.

## References

- `references/workflow.md`: local task-code workflow, runner usage, host integration, and runtime repair.
- `references/auth.md`: authentication, profiles, credential storage, and endpoint configuration.
- `references/tool-signatures.md`: generated interfaces and method signatures.
- `references/safety.md`: destructive-operation guardrails.
