# Workflow

Use this skill as a local-code execution layer for Nonce resources.

Run commands with the installed skill root as the working directory. The skill root is the directory containing `SKILL.md`; do not assume any fixed filesystem path.

## Path setup

1. Resolve the installed skill root from the location of this `SKILL.md`.
2. Print the resolved value before running any scripts so it is visible in the session.
3. Keep using the printed value for all later commands and task-code imports.

macOS/Linux:

```bash
export NONCE_SKILL_HOME="<installed skill root>"
printf 'NONCE_SKILL_HOME=%s\n' "$NONCE_SKILL_HOME"
cd "$NONCE_SKILL_HOME"
test -f SKILL.md && test -f scripts/run-task.mjs && test -f scripts/skill-runtime.mjs
```

Windows PowerShell:

```powershell
$NonceSkillHome = "<installed skill root>"
Write-Output "NonceSkillHome=$NonceSkillHome"
Set-Location $NonceSkillHome
Test-Path .\SKILL.md
Test-Path .\scripts\run-task.mjs
Test-Path .\scripts\skill-runtime.mjs
```

## Runtime gate

1. Confirm the host is macOS, Linux, or Windows.
2. If `vp` is missing, the Node runtime is not the skill-pinned LTS version, or `vp env doctor` fails, run the platform bootstrap script directly:
   - macOS/Linux: `./scripts/bootstrap-runtime.sh`
   - Windows PowerShell: `powershell -ExecutionPolicy Bypass -File .\scripts\bootstrap-runtime.ps1`
3. The bootstrap script installs Vite+ if needed, enables managed Node mode, installs the skill-pinned LTS Node runtime, and runs `vp env doctor`.
4. After bootstrap, inspect the runtime with `vp node -- scripts/bootstrap-runtime.mjs --json`. This command checks the runtime; it does not install missing pieces by itself.
5. Proceed only when the runtime check reports a supported platform, a healthy Vite+ environment, and `nodeVersionOk: true`.

## Task flow

1. Authenticate with `vp node -- scripts/auth.mjs login` before business queries.
2. Read `references/tool-signatures.md` for the method index, then read the specific method's schema file under `assets/schemas/` for full Input and Output interfaces. Regenerating schemas is not an installed-skill runtime step.
3. Write a JavaScript module task file under an ignored path inside the installed skill root, such as `.nonce-skill/tasks/query.mjs`.
4. Import the runtime SDK relative to the task file. From `<installed skill root>/.nonce-skill/tasks/query.mjs`, use `import { createNonceClient } from "../../scripts/skill-runtime.mjs";`.
5. Run the task through `vp node -- scripts/run-task.mjs ".nonce-skill/tasks/query.mjs"`.
6. Pass `--profile` and `--endpoint` to the runner instead of hardcoding those values in task code.
7. For destructive task-batch methods, use `vp node -- scripts/run-task.mjs --allow-destructive "<task-file>"` only after explicit user confirmation, and still pass the SDK destructive confirmation options in code.
8. Do not mutate `NONCE_*` environment variables or spawn alternate SDK processes from task code to change runner behavior.
9. Use compact JSON stdout as the only model-facing data surface.

## Destructive task flow

1. Use read-only discovery calls to resolve the exact `workspace_id`, `farm_id`, `miner_id`, and task target set.
2. Present a concise plan with workspace, farm, miner count or IDs, task type, parameters, and expected effect.
3. Ask for explicit confirmation before writing or running the destructive task file.
4. Execute with both runner approval (`--allow-destructive`) and SDK approval (`confirmDestructive: true` plus a non-empty `confirmation` string).
5. Return compact JSON with the created task batch or failure details.

External integrations should call the local runner or import the local SDK. They should not depend on a separate token cache. Direct SDK integrations may pass profile or endpoint options to `createNonceClient`.
