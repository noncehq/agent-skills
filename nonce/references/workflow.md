# Workflow

Use this skill as a local-code execution layer for Nonce MCP.

Run commands from the skill directory.

## Runtime gate

1. Confirm the host is macOS or Windows. Linux is not supported for this skill version.
2. If `vp` is missing, the Node runtime is not the skill-pinned LTS version, `vp env doctor` fails, or dependencies are absent, run the platform bootstrap script directly:
   - macOS: `scripts/bootstrap-runtime.sh`
   - Windows PowerShell: `.\scripts\bootstrap-runtime.ps1`
3. The bootstrap script installs Vite+ if needed, enables managed Node mode, installs the skill-pinned LTS Node runtime, runs `vp env doctor`, and installs package dependencies.
4. After bootstrap, inspect the runtime with `vp run nonce:bootstrap -- --json`. This command checks the runtime; it does not install missing pieces by itself.
5. Proceed only when the runtime check reports a supported platform, a healthy Vite+ environment, and `nodeVersionOk: true`.

## Task flow

1. Authenticate with `vp run nonce:auth -- login` before business queries.
2. Inspect the checked-in generated tool signatures before writing code. Regenerating signatures is a repository maintenance action, not an installed-skill runtime step.
3. Write a TypeScript task file under an ignored skill-local path such as `.nonce-skill/tasks/query.ts`.
4. Import the runtime SDK from the task file, for example `import { createNonceClient } from "../../assets/runtime/src/index.ts";` when using `.nonce-skill/tasks/query.ts`.
5. Run the task through `vp run nonce:run -- .nonce-skill/tasks/query.ts`.
6. Pass `--profile` and `--endpoint` to the runner instead of hardcoding those values in task code.
7. For destructive task-batch methods, use `vp run nonce:run -- --allow-destructive <task-file>` only after explicit user confirmation, and still pass the SDK destructive confirmation options in code.
8. Do not mutate `NONCE_*` environment variables or spawn alternate SDK/MCP processes from task code to change runner behavior.
9. Use compact JSON stdout as the only model-facing data surface.

Host applications should call the local runner or import the local SDK. They should not depend on their own MCP client token cache. Direct SDK integrations may pass profile or endpoint options to `createNonceClient`.
