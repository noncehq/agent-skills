# Safety

Nonce task methods can affect physical mining devices.

- Treat all `CreateTaskBatch_*` methods as destructive even when the action appears read-like.
- Before running a destructive call, resolve the exact target set with read-only calls, then explain the workspace, farm, miners, task type, parameters, and expected effect.
- Require explicit user confirmation of that plan before writing or running destructive code.
- SDK destructive methods must require `confirmDestructive: true` and a non-empty confirmation string.
- In the task runner process, the SDK rejects destructive calls unless destructive execution is explicitly enabled with `--allow-destructive`.
- Direct SDK integrations outside the task runner must create the client with `allowDestructive: true` only after explicit user confirmation, and must still pass `{ confirmDestructive: true, confirmation: "..." }` for each destructive call.
- Treat the task runner as a guardrail for generated task code, not as a sandbox for untrusted or intentionally adversarial JavaScript.
- Do not write task code that mutates `NONCE_*` environment variables, spawns subprocesses, launches alternate SDK clients, or uses direct REST calls to bypass destructive approval.
- For permission errors, report the role or scope limit. Do not broaden the operation.
