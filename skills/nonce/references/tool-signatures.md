# Tool Signatures

Generated from checked Nonce method definitions; supplemental schemas only fill missing metadata.

- Default endpoint: `https://mcp.nonce.app/mcp`
- Method count: 31

This file is a compact index. Before calling a method, read its schema file under `assets/schemas/` for the full `<MethodType>Input` / `<MethodType>Output` interfaces.

Do not call schema/reference endpoints for business operations. Runtime calls should go through the bundled `scripts/client.mjs` module from project-local code under `.nonce/code/`. Use `scripts/nonce.mjs` only for a one-off call or diagnosis.

Before authenticating, run `node "$NONCE_SKILL_HOME/scripts/bootstrap-runtime.mjs" --project-dir "$PWD" --json` with `--profile` when needed. Assign the reported `nodePath` to `NONCE_NODE` and use that exact executable for auth and method calls. Treat `stateDirWritable: false`, `stateProfileDirWritable: false`, `credentialDirWritable: false`, or `dataDirWritable: false` as blockers.

Store agent-authored code and reusable data under the project-owned `.nonce/` directory, never under the installed skill root. Skill updates may replace the entire installed directory.

The client keeps OAuth credentials internal and fixes the endpoint to `https://mcp.nonce.app/mcp`. Create one client, compose the required MCP calls in the same process, filter or aggregate their results in code, and close the client in `finally`.

```js
import { join } from "node:path"
import { pathToFileURL } from "node:url"

const skillHome = process.argv[2]
if (!skillHome) throw new Error("Pass NONCE_SKILL_HOME as the first script argument")
const clientUrl = pathToFileURL(join(skillHome, "scripts", "client.mjs")).href
const { createNonceClient } = await import(clientUrl)
const nonce = await createNonceClient()

try {
  const result = await nonce.listFarms({ workspace_id: "..." })
  const rows = result?.data?.data ?? result?.data ?? []
  console.log(JSON.stringify({ farmCount: rows.length }))
} finally {
  await nonce.close()
}
```

Log only the compact result needed for the next decision. Do not print full MCP responses. Keep large intermediate data inside the process or write it under `.nonce/` when it must persist.

The fixed CLI remains available for one-off calls:

```bash
"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/nonce.mjs" call listFarms \
  --input-file ".nonce/requests/list-farms.json" \
  --output ".nonce/results/list-farms.json"
```

For a destructive method, first present the exact target and expected effect and obtain explicit user confirmation. In code, create the client with `allowDestructive: true` and pass `confirmDestructive: true` plus the confirmation to that one method call. In the CLI, add both `--allow-destructive` and `--confirmation "<confirmed target and effect>"`.

## Methods

- `listFarms` — ListFarms (read-only, required: workspace_id) → [schemas/list-farms.md](../assets/schemas/list-farms.md)
- `listMiners` — ListMiners (read-only, required: workspace_id, farm_id) → [schemas/list-miners.md](../assets/schemas/list-miners.md)
- `searchMiners` — SearchMiners (read-only, required: workspace_id, farm_id) → [schemas/search-miners.md](../assets/schemas/search-miners.md)
- `getMinerStats` — GetMinerStats (read-only, required: workspace_id, farm_id) → [schemas/get-miner-stats.md](../assets/schemas/get-miner-stats.md)
- `listFarmMetricsHistory` — ListFarmMetricsHistory (read-only, required: workspace_id, farm_id, from_date, to_date) → [schemas/list-farm-metrics-history.md](../assets/schemas/list-farm-metrics-history.md)
- `listFarmEnergyHistory` — ListFarmEnergyHistory (read-only, required: workspace_id, farm_id) → [schemas/list-farm-energy-history.md](../assets/schemas/list-farm-energy-history.md)
- `listMinerHistory` — ListMinerHistory (read-only, required: workspace_id, farm_id, miner_id, from_time, to_time) → [schemas/list-miner-history.md](../assets/schemas/list-miner-history.md)
- `getMinerTasks` — GetMinerTasks (read-only, required: workspace_id, farm_id, miner_id) → [schemas/get-miner-tasks.md](../assets/schemas/get-miner-tasks.md)
- `listMinerRebootEvents` — ListMinerRebootEvents (read-only, required: workspace_id, farm_id) → [schemas/list-miner-reboot-events.md](../assets/schemas/list-miner-reboot-events.md)
- `getMinerRebootEvents` — GetMinerRebootEvents (read-only, required: workspace_id, farm_id, miner_id) → [schemas/get-miner-reboot-events.md](../assets/schemas/get-miner-reboot-events.md)
- `listMinerPoolDiffs` — ListMinerPoolDiffs (read-only, required: workspace_id, farm_id, from_time, to_time) → [schemas/list-miner-pool-diffs.md](../assets/schemas/list-miner-pool-diffs.md)
- `listAgents` — ListAgents (read-only, required: workspace_id) → [schemas/list-agents.md](../assets/schemas/list-agents.md)
- `searchAgents` — SearchAgents (read-only, required: workspace_id) → [schemas/search-agents.md](../assets/schemas/search-agents.md)
- `listTaskBatches` — ListTaskBatches (read-only, required: workspace_id, farm_id) → [schemas/list-task-batches.md](../assets/schemas/list-task-batches.md)
- `createTaskBatchMinerSystemReboot` — CreateTaskBatch_MinerSystemReboot (destructive, required: workspace_id, farm_id, task_name, miner_ids) → [schemas/create-task-batch-miner-system-reboot.md](../assets/schemas/create-task-batch-miner-system-reboot.md)
- `createTaskBatchMinerLogGet` — CreateTaskBatch_MinerLogGet (destructive, required: workspace_id, farm_id, task_name, miner_ids) → [schemas/create-task-batch-miner-log-get.md](../assets/schemas/create-task-batch-miner-log-get.md)
- `createTaskBatchMinerLightUpdate` — CreateTaskBatch_MinerLightUpdate (destructive, required: workspace_id, farm_id, task_name, miner_ids, params) → [schemas/create-task-batch-miner-light-update.md](../assets/schemas/create-task-batch-miner-light-update.md)
- `createTaskBatchMinerPowerModeUpdate` — CreateTaskBatch_MinerPower_modeUpdate (destructive, required: workspace_id, farm_id, task_name, miner_ids, params) → [schemas/create-task-batch-miner-power-mode-update.md](../assets/schemas/create-task-batch-miner-power-mode-update.md)
- `createTaskBatchMinerFirmwareUpdate` — CreateTaskBatch_MinerFirmwareUpdate (destructive, required: workspace_id, farm_id, task_name, miner_ids, params) → [schemas/create-task-batch-miner-firmware-update.md](../assets/schemas/create-task-batch-miner-firmware-update.md)
- `createTaskBatchMinerPoolLock` — CreateTaskBatch_MinerPoolLock (destructive, required: workspace_id, farm_id, task_name, miner_ids, params) → [schemas/create-task-batch-miner-pool-lock.md](../assets/schemas/create-task-batch-miner-pool-lock.md)
- `createTaskBatchAgentScanCreate` — CreateTaskBatch_AgentScanCreate (destructive, required: workspace_id, farm_id, task_name) → [schemas/create-task-batch-agent-scan-create.md](../assets/schemas/create-task-batch-agent-scan-create.md)
- `createTaskBatchAgentIpDiagnosisCreate` — CreateTaskBatch_AgentIp_diagnosisCreate (destructive, required: workspace_id, farm_id, task_name, params) → [schemas/create-task-batch-agent-ip-diagnosis-create.md](../assets/schemas/create-task-batch-agent-ip-diagnosis-create.md)
- `createTaskBatchAgentSelfUpdate` — CreateTaskBatch_AgentSelfUpdate (destructive, required: workspace_id, farm_id, task_name) → [schemas/create-task-batch-agent-self-update.md](../assets/schemas/create-task-batch-agent-self-update.md)
- `createTaskBatchMinerTagsUpdate` — CreateTaskBatch_MinerTagsUpdate (destructive, required: workspace_id, farm_id, task_name, miner_ids, params) → [schemas/create-task-batch-miner-tags-update.md](../assets/schemas/create-task-batch-miner-tags-update.md)
- `createTaskBatchMinerRecordDelete` — CreateTaskBatch_MinerRecordDelete (destructive, required: workspace_id, farm_id, task_name, miner_ids) → [schemas/create-task-batch-miner-record-delete.md](../assets/schemas/create-task-batch-miner-record-delete.md)
- `createTaskBatchMinerRackLocationUpdate` — CreateTaskBatch_MinerRack_locationUpdate (destructive, required: workspace_id, farm_id, task_name, updates) → [schemas/create-task-batch-miner-rack-location-update.md](../assets/schemas/create-task-batch-miner-rack-location-update.md)
- `searchTaskBatches` — SearchTaskBatches (read-only, required: workspace_id, farm_id) → [schemas/search-task-batches.md](../assets/schemas/search-task-batches.md)
- `getTaskBatch` — GetTaskBatch (read-only, required: workspace_id, farm_id, batch_id) → [schemas/get-task-batch.md](../assets/schemas/get-task-batch.md)
- `getTaskBatchTasks` — GetTaskBatchTasks (read-only, required: workspace_id, farm_id, batch_id) → [schemas/get-task-batch-tasks.md](../assets/schemas/get-task-batch-tasks.md)
- `listWorkspaces` — ListWorkspaces (read-only) → [schemas/list-workspaces.md](../assets/schemas/list-workspaces.md)
- `listBtcNetworkHistory` — ListBtcNetworkHistory (read-only) → [schemas/list-btc-network-history.md](../assets/schemas/list-btc-network-history.md)
