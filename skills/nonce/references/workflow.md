# Workflow

Use project-local JavaScript to call Nonce MCP through the bundled
`scripts/client.mjs` module. Keep intermediate MCP results in the execution
process and return only compact, task-relevant output to the model.

The fixed `scripts/nonce.mjs` CLI remains available for one-off calls and
diagnostics. Do not use repeated CLI calls as the primary analysis workflow.

## Path setup

Keep the current project as the working directory. Resolve the installed skill
root and exact Node executable once, print them, and reuse them.

macOS/Linux:

```bash
export NONCE_SKILL_HOME="<installed skill root>"
export NONCE_NODE="$(node -p 'process.execPath')"
printf 'NONCE_SKILL_HOME=%s\nNONCE_NODE=%s\n' "$NONCE_SKILL_HOME" "$NONCE_NODE"
test -f "$NONCE_SKILL_HOME/SKILL.md"
test -f "$NONCE_SKILL_HOME/scripts/client.mjs"
```

Windows PowerShell:

```powershell
$NonceSkillHome = "<installed skill root>"
$NonceNode = node -p "process.execPath"
Write-Output "NonceSkillHome=$NonceSkillHome"
Write-Output "NonceNode=$NonceNode"
Test-Path (Join-Path $NonceSkillHome "SKILL.md")
Test-Path (Join-Path $NonceSkillHome "scripts\client.mjs")
```

## Runtime gate

Run the detection-only check from the current project.

macOS/Linux:

```bash
"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/bootstrap-runtime.mjs" \
  --project-dir "$PWD" \
  --json
```

Windows PowerShell:

```powershell
& $NonceNode (Join-Path $NonceSkillHome "scripts\bootstrap-runtime.mjs") `
  --project-dir (Get-Location).Path `
  --json
```

Proceed only on macOS, Linux, or Windows with Node major 22 or 24. Use the
reported `nodePath` when it differs from the value resolved above. Treat
`stateDirWritable`, `stateProfileDirWritable`, and `credentialDirWritable`
failures as authentication blockers, and `dataDirWritable: false` as a blocker
for project code or data under `.nonce/`.

The runtime check never installs Node, Vite+, a package manager, or other
software. If Node is unsupported, stop and report that Node 22 or 24 LTS is
required.

## Authentication

Check status, then log in only when needed:

```bash
"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/auth.mjs" status
"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/auth.mjs" login
```

Pass `--profile "<name>"` to authentication and client creation when using a
non-default profile. The installed client always connects to
`https://mcp.nonce.app/mcp` and does not accept an endpoint override.

## Code flow

1. Read `references/tool-signatures.md` for the compact method index.
2. Read only the method schema files needed by the current task under
   `assets/schemas/`.
3. Write the analysis under `.nonce/code/<task>.mjs`.
4. Import `scripts/client.mjs` from the installed skill root passed as the first
   script argument.
5. Create one client, compose all required MCP calls, and close it in `finally`.
6. Paginate, filter, aggregate, and join inside the process. Do not print raw
   MCP responses.
7. Print one compact JSON result containing only the fields needed for the next
   decision. Persist reusable intermediates under `.nonce/` when necessary.

Example:

```js
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const skillHome = process.argv[2];
if (!skillHome) throw new Error("Pass NONCE_SKILL_HOME as the first script argument");

const clientUrl = pathToFileURL(join(skillHome, "scripts", "client.mjs")).href;
const { createNonceClient } = await import(clientUrl);
const nonce = await createNonceClient();

const rows = (result) => {
  const value = result?.data?.data ?? result?.data ?? [];
  return Array.isArray(value) ? value : [];
};

try {
  const workspaces = rows(await nonce.listWorkspaces({}));
  const workspace = workspaces[0];
  if (!workspace) throw new Error("No accessible Nonce workspace");

  const farms = rows(
    await nonce.listFarms({
      page: 1,
      pageSize: 10000,
      workspace_id: workspace.workspace_id,
    }),
  );

  const summaries = [];
  for (const farm of farms) {
    const miners = rows(
      await nonce.listMiners({
        farm_id: farm.farm_id,
        page: 1,
        pageSize: 10000,
        workspace_id: workspace.workspace_id,
      }),
    );
    summaries.push({
      farm: farm.name ?? farm.farm_name ?? farm.farm_id,
      minerCount: miners.length,
      offlineCount: miners.filter((miner) => miner.status === "offline").length,
    });
  }

  console.log(JSON.stringify({ farmCount: farms.length, farms: summaries }));
} finally {
  await nonce.close();
}
```

Run it from the project:

```bash
"$NONCE_NODE" ".nonce/code/farm-summary.mjs" "$NONCE_SKILL_HOME"
```

PowerShell:

```powershell
& $NonceNode ".nonce\code\farm-summary.mjs" $NonceSkillHome
```

Use normal JavaScript control flow for pagination, conditionals, calculations,
and joins. Avoid loading or logging fields unrelated to the user's question.
For large result sets, keep only aggregates and a small representative sample
in the final JSON.

## One-off CLI

Use the CLI when one method call is sufficient or when diagnosing the
connection:

```bash
"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/nonce.mjs" call listWorkspaces \
  --input '{}' \
  --output ".nonce/results/list-workspaces.json"
```

The CLI validates the input against the generated MCP schema. Use
`--input-file` for reusable request JSON, `--output` to avoid printing large
responses, `tools` to list methods, and `describe <method>` to inspect one
schema.

## Write flow

The code client and CLI retain the complete MCP write tool set.

1. Resolve the exact workspace, farm, miners, and target set with read methods.
2. Read the selected `CreateTaskBatch_*` schema.
3. Present the target, parameters, and expected physical or operational effect.
4. Obtain explicit user confirmation for that exact plan.
5. Enable destructive methods only in the code that performs the confirmed
   operation, and include the confirmation again on the method call:

   ```js
   const nonce = await createNonceClient({ allowDestructive: true });
   try {
     const result = await nonce.createTaskBatchMinerSystemReboot(input, {
       confirmDestructive: true,
       confirmation: "User confirmed rebooting the listed miners in the selected farm.",
     });
     console.log(JSON.stringify({ taskBatch: result?.data?.data ?? result?.data ?? result }));
   } finally {
     await nonce.close();
   }
   ```

6. Never reuse approval for a different target set, method, parameter, or
   effect.

For a one-off CLI write, both approval flags remain mandatory:

```bash
"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/nonce.mjs" call createTaskBatchMinerSystemReboot \
  --input-file ".nonce/requests/reboot.json" \
  --allow-destructive \
  --confirmation "User confirmed rebooting the listed miners in the selected farm." \
  --output ".nonce/results/reboot-task.json"
```
