# Safety

Nonce MCP can affect physical mining devices.

- Treat all `CreateTaskBatch_*` methods as destructive even when the action appears read-like.
- Before running a destructive call, explain the workspace, farm, miners, task type, and expected effect.
- Require explicit user confirmation before running destructive code.
- SDK destructive methods must require `confirmDestructive: true`.
- The runner must reject destructive code unless destructive execution is explicitly enabled.
- For permission errors, report the role or scope limit. Do not broaden the operation.
