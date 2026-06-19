# Safety

Nonce MCP can affect physical mining devices.

- Treat all `CreateTaskBatch_*` methods as destructive even when the action appears read-like.
- Before running a destructive call, explain the workspace, farm, miners, task type, and expected effect.
- Require explicit user confirmation before running destructive code.
- SDK destructive methods must require `confirmDestructive: true` and a non-empty confirmation string.
- In the initial `nonce:run` task process, the SDK rejects destructive calls unless destructive execution is explicitly enabled with `--allow-destructive`.
- Treat `nonce:run` as a guardrail for generated task code, not as a sandbox for untrusted or intentionally adversarial JavaScript.
- Do not write task code that mutates `NONCE_*` environment variables, spawns subprocesses, launches alternate SDK/MCP clients, or uses direct REST/OpenAPI calls to bypass destructive approval.
- For permission errors, report the role or scope limit. Do not broaden the operation.
