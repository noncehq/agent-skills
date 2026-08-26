---
name: nonce
description: >-
  Use this skill when the user needs to query, analyze, automate, or operate Nonce mining resources: workspaces, farms, miners, agents, task batches, miner tasks, metrics, history, or operational actions. It provides code-first access to the complete Nonce MCP tool set so the agent can filter and aggregate data before returning a compact result. Do not use it for generic Bitcoin mining questions or unrelated Node/API work.
metadata:
  version: "2026-08-26"
---

# Nonce

Nonce manages your Bitcoin mining workspaces, farms, miners, agents, task batches, and miner tasks.

Write project-local JavaScript that imports the bundled Nonce client, composes
the required MCP methods, and returns only the filtered or aggregated result
needed by the model. The client exposes the complete Nonce MCP read and write
tool set.

## Before Use

- Resolve every relative path in this skill from the installed skill root, the directory containing this `SKILL.md`. Do not assume any fixed filesystem path.
- Record the installed skill root and exact existing Node executable. Keep the
  user's project as the working directory.
- Run the detection-only runtime check before authentication or business queries. It never installs software.
- If credentials are missing or expired, complete Nonce authentication before business queries. Read `references/auth.md` for status, login, callback, and logout flows.
- Support macOS, Linux, and Windows.

## Operating Rules

- Read `references/workflow.md`, then read only the selected methods' schema
  files under `assets/schemas/`.
- Write code under the current project's `.nonce/code/` directory. Import only
  `scripts/client.mjs` from the installed skill.
- Create one client per script, perform pagination, joins, filtering, and
  aggregation in that process, and close it in `finally`.
- Do not print full MCP responses. Return compact JSON with only the evidence,
  counts, samples, or conclusions required for the next decision.
- Use `scripts/nonce.mjs` only for one-off calls and diagnostics, not as the
  primary analysis workflow.
- If the user asks for a one-farm reboot analysis delivered as an HTML report or
  slide deck, also activate the sibling `reboot-report` skill. Keep using this
  skill for runtime, authentication, schemas, and data access; let
  `reboot-report` own the analysis and deliverable.
- Missing IDs: discover them in order with `listWorkspaces` -> `listFarms` -> `listMiners` as needed.
- Reuse returned `workspace_id`, `farm_id`, `miner_id`, and task IDs. Never invent IDs.
- Prefer the narrowest method and scope that satisfy the user's request.
- Route reboot queries by the fact the user needs:
  - For observed miner restarts, use `listMinerRebootEvents`
    (`ListMinerRebootEvents`). Pass the requested `from_time` and `to_time`;
    otherwise the method returns the last 7 days through now, up to 30 days.
  - For reboot requests issued through Nonce for one miner, use
    `listMinerRebootTasks` (`ListMinerRebootTasks`). Pass the requested
    `from_time` and `to_time` within the supported 30-day window, and use
    `status` only when the user asks for a specific execution state.
  - For farm-wide reboot request batches, use `searchTaskBatches`
    (`SearchTaskBatches`) with `task_name.eq` set to
    `miner.system.reboot`. Apply `created_at` for the requested time range and
    `actor_type.eq: automation` only when the user asks specifically about
    automation-issued requests.
  - For one request's execution state, use `getTaskBatch` (`GetTaskBatch`) for
    aggregate counts and `listTaskBatchTasks` (`ListTaskBatchTasks`) for
    per-miner status, result, and error details.
- Keep reboot events and reboot task batches separate in the result. A Reboot
  Event records an observed restart; a Task Batch records a Nonce request and
  its execution state. Do not infer that a successful task produced an
  observed reboot unless both datasets support that conclusion.
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

- Treat every `Create*TaskBatch` method as destructive because it can affect physical miners or operational/inventory state, even when the action appears read-like.
- Before any `Create*TaskBatch` call, explain the target and expected effect and obtain explicit user confirmation.
- In code, enable destructive methods only for the confirmed script and pass
  `confirmDestructive: true` plus a non-empty `confirmation` to that call.
- For the one-off CLI, use both `--allow-destructive` and `--confirmation`.
- Read `references/safety.md` before implementing or running task-batch operations.

## References

- `references/workflow.md`: path setup, code-first MCP access, compact output, and CLI fallback.
- `references/auth.md`: authentication, profiles, credential storage, and the fixed Nonce endpoint.
- `references/tool-signatures.md`: method index and shared types.
- `assets/schemas/`: per-method Input/Output interfaces and signatures.
- `references/safety.md`: destructive-operation guardrails.
