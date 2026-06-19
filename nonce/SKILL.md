---
name: nonce
description: Use when Codex needs to query or operate Nonce MCP resources such as workspaces, farms, miners, agents, task batches, or miner tasks by preparing a local Node.js runtime, authenticating with Nonce MCP OAuth, and writing TypeScript code against the bundled MCP-only SDK instead of calling MCP tools directly.
---

# Nonce

## Overview

Use the bundled local TypeScript runner and SDK to call Nonce MCP. Prepare runtime and authentication first, then generate task-specific TypeScript code that imports the SDK, calls MCP tools through typed methods, and prints compact JSON for the next decision.

## Workflow

1. Ensure the local runtime is ready. Use `scripts/bootstrap-runtime.sh` on macOS or `scripts/bootstrap-runtime.ps1` on Windows when Node.js, Vite+, or dependencies are missing.
2. Ensure OAuth credentials exist. Use `vp run nonce:auth -- status` and `vp run nonce:auth -- login` before making business queries.
3. Inspect the generated SDK surface before writing task code. Read `references/tool-signatures.md` for compact method signatures or import from `assets/runtime/src/generated/tool-signatures.ts`.
4. Write TypeScript task code that imports `createNonceClient` from the bundled runtime and calls typed SDK methods.
5. Run the task through `scripts/run-task.ts`; do not call Nonce MCP tools directly from the agent tool interface.
6. Parse the task stdout as JSON and continue reasoning from that result.

## Runtime

Support macOS and Windows. Linux is not required for the first version.

Use Vite+ as the runtime manager. Keep runtime state in the skill cache or runtime folder, not in the user's project unless the user explicitly asks for project integration.

The default MCP endpoint is `https://mcp.nonce.app/mcp`.

## Authentication

Use MCP OAuth through the bundled local provider. Prefer OS credential storage; if unavailable, ask for confirmation before falling back to a local user-only credential file. Never print tokens or refresh tokens.

## Code Rules

- Use MCP-only transport. Do not bypass the MCP server with direct REST calls.
- Generate TypeScript for data access and filtering instead of chaining MCP tool calls directly.
- Keep stdout compact and machine-readable, preferably one JSON object.
- For destructive `CreateTaskBatch_*` methods, explain the target and effect to the user and obtain explicit confirmation before running code. Destructive methods must pass the SDK's destructive confirmation options.

## References

- Read `references/workflow.md` for detailed task flow.
- Read `references/auth.md` before changing OAuth or credential behavior.
- Read `references/safety.md` before implementing or running task-batch operations.
- Read `references/tool-signatures.md` before generating code against the SDK.
