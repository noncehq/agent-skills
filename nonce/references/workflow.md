# Workflow

Use this skill as a local-code execution layer for Nonce MCP.

Run commands from the skill directory.

## Runtime gate

1. Confirm the host is macOS or Windows. Linux is not supported for this skill version.
2. If `vp` is missing, `vp env doctor` fails, or dependencies are absent, run the platform bootstrap script directly:
   - macOS: `scripts/bootstrap-runtime.sh`
   - Windows PowerShell: `.\scripts\bootstrap-runtime.ps1`
3. After bootstrap, inspect the runtime with `vp run nonce:bootstrap -- --json`. This command checks the runtime; it does not install missing pieces by itself.
4. Proceed only when the runtime check reports a supported platform and a healthy Vite+ Node environment.

## Task flow

1. Authenticate with `nonce:auth` before business queries.
2. Inspect the checked-in generated tool signatures before writing code. Regenerating signatures is a repository maintenance action, not an installed-skill runtime step.
3. Write a TypeScript task file under an ignored skill-local path such as `.nonce-skill/tasks/query.ts`.
4. Import the runtime SDK from the task file, for example `import { createNonceClient } from "../../assets/runtime/src/index.ts";` when using `.nonce-skill/tasks/query.ts`.
5. Run the task through `vp run nonce:run -- .nonce-skill/tasks/query.ts`.
6. Pass `--profile`, `--endpoint`, or `--file-credentials` to the runner instead of hardcoding those values in task code.
7. For destructive task-batch methods, use `vp run nonce:run -- --allow-destructive <task-file>` only after explicit user confirmation, and still pass the SDK destructive confirmation options in code.
8. Do not mutate `NONCE_*` environment variables or spawn alternate SDK/MCP processes from task code to change runner behavior.
9. Use compact JSON stdout as the only model-facing data surface.

Host applications should call the local runner or import the local SDK. They should not depend on their own MCP client token cache. Direct SDK integrations may pass profile, endpoint, or credential-storage options to `createNonceClient`; runner task code should receive those values from runner flags.
