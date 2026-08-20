# Safety

Nonce task methods can affect physical mining devices.

- Agent-authored code runs with the host agent's filesystem and network
  permissions. The bundled client is an API boundary, not a sandbox. Run only
  code written for the current user request.
- Import only `scripts/client.mjs`. Do not import internal credential, OAuth, or
  transport modules, read credential files, override the endpoint, or call
  Nonce through direct REST requests.
- Keep code and persistent intermediates under the project-owned `.nonce/`
  directory. Never put credentials in code, request files, results, or logs.
- Filter and aggregate MCP data inside the process. Do not print complete
  responses when a count, selected fields, or a small sample is sufficient.
- Treat all `Create*TaskBatch` methods as destructive even when the action appears read-like.
- Before running a destructive call, resolve the exact target set with read-only
  calls, then explain the workspace, farm, miners, task type, parameters, and
  expected effect.
- Require explicit user confirmation of that exact plan.
- A code client is read-only by default. After confirmation, create the
  write-capable client with `allowDestructive: true`, then pass
  `confirmDestructive: true` and a non-empty `confirmation` to the selected
  method.
- The fixed CLI requires both `--allow-destructive` and a non-empty
  `--confirmation` value for every destructive call.
- Do not treat an earlier confirmation as approval for a different target set,
  method, parameter, or effect.
- Do not create alternate clients or scripts that bypass the bundled client's
  fixed endpoint, generated method contract, or destructive approval.
- For permission errors, report the role or scope limit. Do not broaden the operation.
