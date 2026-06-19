# Workflow

Use this skill as a local-code execution layer for Nonce resources.

Run commands from the skill directory.

## Runtime gate

1. Confirm the host is macOS or Windows. Linux is not supported for this skill version.
2. If `vp` is missing, the Node runtime is not the skill-pinned LTS version, or `vp env doctor` fails, run the platform bootstrap script directly:
   - macOS: `./scripts/bootstrap-runtime.sh`
   - Windows PowerShell: `powershell -ExecutionPolicy Bypass -File .\scripts\bootstrap-runtime.ps1`
3. The bootstrap script installs Vite+ if needed, enables managed Node mode, installs the skill-pinned LTS Node runtime, and runs `vp env doctor`.
4. After bootstrap, inspect the runtime with `vp node -- scripts/bootstrap-runtime.mjs --json`. This command checks the runtime; it does not install missing pieces by itself.
5. Proceed only when the runtime check reports a supported platform, a healthy Vite+ environment, and `nodeVersionOk: true`.

## Task flow

1. Authenticate with `vp node -- scripts/auth.mjs login` before business queries.
2. Inspect the checked-in generated tool signatures before writing code. Regenerating signatures is a repository maintenance action, not an installed-skill runtime step.
3. Write a JavaScript module task file under an ignored skill-local path such as `.nonce-skill/tasks/query.mjs`.
4. Import the runtime SDK from the task file, for example `import { createNonceClient } from "../../scripts/skill-runtime.mjs";` when using `.nonce-skill/tasks/query.mjs`.
5. Run the task through `vp node -- scripts/run-task.mjs ".nonce-skill/tasks/query.mjs"`.
6. Pass `--profile` and `--endpoint` to the runner instead of hardcoding those values in task code.
7. For destructive task-batch methods, use `vp node -- scripts/run-task.mjs --allow-destructive "<task-file>"` only after explicit user confirmation, and still pass the SDK destructive confirmation options in code.
8. Do not mutate `NONCE_*` environment variables or spawn alternate SDK processes from task code to change runner behavior.
9. Use compact JSON stdout as the only model-facing data surface.

Host applications should call the local runner or import the local SDK. They should not depend on a separate token cache. Direct SDK integrations may pass profile or endpoint options to `createNonceClient`.
