---
name: nonce
description: >-
  Use this skill when a task requires current Nonce data or an operational action involving workspaces, farms, miners, agents, task batches, miner tasks, metrics, or history. Write project-local code with the bundled Nonce client to combine methods, filter or aggregate data, and return only the compact evidence required by the task. For a one-farm reboot report or slide deck, pair it with the reboot-report skill and limit this skill to data collection and preprocessing. Do not use it for generic Bitcoin mining questions or unrelated Node/API work.
---

# Nonce

Nonce manages your Bitcoin mining workspaces, farms, miners, agents, task batches, and miner tasks.

Use the bundled Nonce client, compose methods, and return only the filtered or aggregated result.

## Before Use

- Resolve every relative path in this skill from the installed skill root, the directory containing this `SKILL.md`. Do not assume any fixed filesystem path.
- Record the installed skill root and exact existing Node executable. Keep the
  user's project as the working directory.
- Run the detection-only runtime check before authentication or business queries.
- If credentials are missing or expired, complete Nonce authentication before business queries. Read `references/auth.md` for details.

## Operating Rules

- Read `references/workflow.md`, then read only the selected methods' schema
  files under `assets/schemas/`.
- Write code under the current project's `.nonce/code/` directory. Import only
  `scripts/client.mjs` from the installed skill.
- Create one client per script, perform pagination, joins, filtering, and
  aggregation in that process, and close it in `finally`.
- Do not print full responses. Return compact JSON with only the evidence,
  counts, samples, or conclusions required for the next decision.
- If the user asks for a one-farm reboot analysis delivered as an HTML report or
  slide deck, also activate the sibling `reboot-report` skill. Keep using this
  skill for runtime, authentication, schemas, and data access; let
  `reboot-report` own the analysis and deliverable.
- Missing IDs: discover them in order with `listWorkspaces` -> `listFarms` -> `listMiners` as needed.
- Reuse returned `workspace_id`, `farm_id`, `miner_id`, and task IDs. Never invent IDs.
- Prefer the narrowest method and scope that satisfy the user's request.
- Most operations need `workspace_id`; farm and miner operations usually also need `farm_id` or `miner_id`.
- For permission errors, report the role or scope limit. Do not broaden the operation to bypass the limit.
- Store reusable code and data under the current project's `.nonce/` directory.
  Never write user data under the installed skill root.

## Gotchas

- Run path setup and the runtime check first. Use the reported `nodePath` for
  authentication and every later script or CLI call.
- Treat `stateDirWritable`, `stateProfileDirWritable`, and `credentialDirWritable` runtime check failures as auth blockers before starting OAuth login.
- Treat `dataDirWritable: false` as a blocker for file-backed requests or
  results. Choose a writable project with `--project-dir`.
- Credentials are stored as local profile files.
- Agent-authored code runs with the host agent's filesystem and network
  permissions. Do not treat the bundled client as a sandbox.

## Safety

- Treat every `CreateTaskBatch_*` method as destructive because it can affect physical miners or operational/inventory state, even when the action appears read-like.
- Before any `CreateTaskBatch_*` call, explain the target and expected effect and obtain explicit user confirmation.
- In code, enable destructive methods only for the confirmed script and pass
  `confirmDestructive: true` plus a non-empty `confirmation` to that call.
- For the one-off CLI, use both `--allow-destructive` and `--confirmation`.
- Read `references/safety.md` before implementing or running task-batch operations.

## References

- `references/workflow.md`: path setup, code-first client access, compact output, and CLI fallback.
- `references/auth.md`: authentication, profiles, credential storage, and the fixed Nonce endpoint.
- `references/tool-signatures.md`: method index and shared types.
- `assets/schemas/`: per-method Input/Output interfaces and signatures.
- `references/safety.md`: destructive-operation guardrails.
