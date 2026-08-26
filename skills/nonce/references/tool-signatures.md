# Tool Signatures

Generated from checked Nonce method definitions; supplemental schemas only fill missing metadata.

- Default endpoint: `https://mcp.nonce.app/mcp`
- Method count: 33

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

## Shared Types

The complete generated client declaration is available at `scripts/client.d.mts`. These are the shared options used by every method:

```ts
interface NonceCallOptions {
  signal?: AbortSignal
  timeoutMs?: number
}

type NonceReadonlyCallOptions = NonceCallOptions

interface NonceDestructiveCallOptions extends NonceCallOptions {
  confirmDestructive: true
  confirmation: string
}

interface NonceClientOptions {
  allowDestructive?: boolean
  profile?: string
}
```

## Methods

- `listWorkspaces` — ListWorkspaces (read-only) → [schemas/list-workspaces.md](../assets/schemas/list-workspaces.md)
- `getBitcoinMetrics` — GetBitcoinMetrics (read-only) → [schemas/get-bitcoin-metrics.md](../assets/schemas/get-bitcoin-metrics.md)
- `queryBitcoinMetrics` — QueryBitcoinMetrics (read-only, required: from, to) → [schemas/query-bitcoin-metrics.md](../assets/schemas/query-bitcoin-metrics.md)
- `listFarms` — ListFarms (read-only, required: workspace_id) → [schemas/list-farms.md](../assets/schemas/list-farms.md)
- `getFarm` — GetFarm (read-only, required: workspace_id, farm_id) → [schemas/get-farm.md](../assets/schemas/get-farm.md)
- `listAgents` — ListAgents (read-only, required: workspace_id, farm_id) → [schemas/list-agents.md](../assets/schemas/list-agents.md)
- `getAgent` — GetAgent (read-only, required: workspace_id, farm_id, agent_id) → [schemas/get-agent.md](../assets/schemas/get-agent.md)
- `listMiners` — ListMiners (read-only, required: workspace_id, farm_id) → [schemas/list-miners.md](../assets/schemas/list-miners.md)
- `searchMiners` — SearchMiners (read-only, required: workspace_id, farm_id) → [schemas/search-miners.md](../assets/schemas/search-miners.md)
- `getMiner` — GetMiner (read-only, required: workspace_id, farm_id, miner_id) → [schemas/get-miner.md](../assets/schemas/get-miner.md)
- `listMinerRebootTasks` — ListMinerRebootTasks (read-only, required: workspace_id, farm_id, miner_id) → [schemas/list-miner-reboot-tasks.md](../assets/schemas/list-miner-reboot-tasks.md)
- `listMinerTasks` — ListMinerTasks (read-only, required: workspace_id, farm_id, miner_id) → [schemas/list-miner-tasks.md](../assets/schemas/list-miner-tasks.md)
- `queryMinerMetrics` — QueryMinerMetrics (read-only, required: workspace_id, farm_id, miner_id, from, to) → [schemas/query-miner-metrics.md](../assets/schemas/query-miner-metrics.md)
- `queryFarmMetrics` — QueryFarmMetrics (read-only, required: workspace_id, farm_id, from, to) → [schemas/query-farm-metrics.md](../assets/schemas/query-farm-metrics.md)
- `queryFarmMinerMetrics` — QueryFarmMinerMetrics (read-only, required: workspace_id, farm_id) → [schemas/query-farm-miner-metrics.md](../assets/schemas/query-farm-miner-metrics.md)
- `listFarmRebootEvents` — ListFarmRebootEvents (read-only, required: workspace_id, farm_id) → [schemas/list-farm-reboot-events.md](../assets/schemas/list-farm-reboot-events.md)
- `listMinerRebootEvents` — ListMinerRebootEvents (read-only, required: workspace_id, farm_id, miner_id) → [schemas/list-miner-reboot-events.md](../assets/schemas/list-miner-reboot-events.md)
- `listTaskBatches` — ListTaskBatches (read-only, required: workspace_id, farm_id) → [schemas/list-task-batches.md](../assets/schemas/list-task-batches.md)
- `searchTaskBatches` — SearchTaskBatches (read-only, required: workspace_id, farm_id) → [schemas/search-task-batches.md](../assets/schemas/search-task-batches.md)
- `getTaskBatch` — GetTaskBatch (read-only, required: workspace_id, farm_id, task_batch_id) → [schemas/get-task-batch.md](../assets/schemas/get-task-batch.md)
- `listTaskBatchTasks` — ListTaskBatchTasks (read-only, required: workspace_id, farm_id, task_batch_id) → [schemas/list-task-batch-tasks.md](../assets/schemas/list-task-batch-tasks.md)
- `createRebootTaskBatch` — CreateRebootTaskBatch (destructive, required: workspace_id, farm_id, miner_ids) → [schemas/create-reboot-task-batch.md](../assets/schemas/create-reboot-task-batch.md)
- `createFirmwareUpdateTaskBatch` — CreateFirmwareUpdateTaskBatch (destructive, required: workspace_id, farm_id, miner_ids, params) → [schemas/create-firmware-update-task-batch.md](../assets/schemas/create-firmware-update-task-batch.md)
- `createPoolLockTaskBatch` — CreatePoolLockTaskBatch (destructive, required: workspace_id, farm_id, miner_ids, params) → [schemas/create-pool-lock-task-batch.md](../assets/schemas/create-pool-lock-task-batch.md)
- `createPowerModeUpdateTaskBatch` — CreatePowerModeUpdateTaskBatch (destructive, required: workspace_id, farm_id, miner_ids, params) → [schemas/create-power-mode-update-task-batch.md](../assets/schemas/create-power-mode-update-task-batch.md)
- `createLightUpdateTaskBatch` — CreateLightUpdateTaskBatch (destructive, required: workspace_id, farm_id, miner_ids, params) → [schemas/create-light-update-task-batch.md](../assets/schemas/create-light-update-task-batch.md)
- `createLogGetTaskBatch` — CreateLogGetTaskBatch (destructive, required: workspace_id, farm_id, miner_ids) → [schemas/create-log-get-task-batch.md](../assets/schemas/create-log-get-task-batch.md)
- `createTagsUpdateTaskBatch` — CreateTagsUpdateTaskBatch (destructive, required: workspace_id, farm_id, miner_ids, params) → [schemas/create-tags-update-task-batch.md](../assets/schemas/create-tags-update-task-batch.md)
- `createRackLocationUpdateTaskBatch` — CreateRackLocationUpdateTaskBatch (destructive, required: workspace_id, farm_id, updates) → [schemas/create-rack-location-update-task-batch.md](../assets/schemas/create-rack-location-update-task-batch.md)
- `createRecordDeleteTaskBatch` — CreateRecordDeleteTaskBatch (destructive, required: workspace_id, farm_id, miner_ids) → [schemas/create-record-delete-task-batch.md](../assets/schemas/create-record-delete-task-batch.md)
- `createAgentScanTaskBatch` — CreateAgentScanTaskBatch (destructive, required: workspace_id, farm_id, params) → [schemas/create-agent-scan-task-batch.md](../assets/schemas/create-agent-scan-task-batch.md)
- `createAgentIpDiagnosisTaskBatch` — CreateAgentIpDiagnosisTaskBatch (destructive, required: workspace_id, farm_id, params) → [schemas/create-agent-ip-diagnosis-task-batch.md](../assets/schemas/create-agent-ip-diagnosis-task-batch.md)
- `createAgentSelfUpdateTaskBatch` — CreateAgentSelfUpdateTaskBatch (destructive, required: workspace_id, farm_id, params) → [schemas/create-agent-self-update-task-batch.md](../assets/schemas/create-agent-self-update-task-batch.md)
