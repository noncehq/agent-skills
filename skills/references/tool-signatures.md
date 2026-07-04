# Tool Signatures

Generated from checked Nonce method definitions; supplemental schemas only fill missing metadata.

- Default endpoint: `https://mcp.nonce.app/mcp`
- Method count: 31

This file is a compact index. Before writing JavaScript task code, read the method's schema file under `assets/schemas/` for the full `<MethodType>Input` / `<MethodType>Output` interfaces.

Do not call schema/reference endpoints for business operations. Runtime calls must go through the local SDK.

Before authenticating, run `node scripts/bootstrap-runtime.mjs --json` with `--profile` when needed. Treat `stateDirWritable: false`, `stateProfileDirWritable: false`, or `credentialDirWritable: false` as auth blockers because OAuth state and credential cache files cannot be written.

Task files can live under `<installed skill root>/.nonce-skill/tasks/` when the runtime check reports `taskDirWritable: true`, or under `recommendedTaskDir` / another writable directory when the installed skill root is read-only.

Import the runtime SDK from the runner-provided `NONCE_SKILL_RUNTIME_URL` so task files do not depend on their filesystem location. Runner task code should receive profile and endpoint selection from runner flags rather than hardcoding them.

```js
const { createNonceClient } = await import(process.env.NONCE_SKILL_RUNTIME_URL);

const client = await createNonceClient();
try {
  const farms = await client.listFarms({ workspace_id: "..." });
  console.log(JSON.stringify({ farms }));
} finally {
  await client.close();
}
```

## Shared Types

```ts
interface CallOptions {
  signal?: AbortSignal
  timeoutMs?: number
}

type ReadonlyCallOptions = CallOptions

interface DestructiveCallOptions extends CallOptions {
  confirmDestructive: true
  confirmation: string
}
```

## Methods

- `listFarms(input: ListFarmsInput, options?: ReadonlyCallOptions): Promise<ListFarmsOutput>` — ListFarms (read-only, required: workspace_id) → [schemas/list-farms.md](../assets/schemas/list-farms.md)
- `listMiners(input: ListMinersInput, options?: ReadonlyCallOptions): Promise<ListMinersOutput>` — ListMiners (read-only, required: workspace_id, farm_id) → [schemas/list-miners.md](../assets/schemas/list-miners.md)
- `searchMiners(input: SearchMinersInput, options?: ReadonlyCallOptions): Promise<SearchMinersOutput>` — SearchMiners (read-only, required: workspace_id, farm_id) → [schemas/search-miners.md](../assets/schemas/search-miners.md)
- `getMinerStats(input: GetMinerStatsInput, options?: ReadonlyCallOptions): Promise<GetMinerStatsOutput>` — GetMinerStats (read-only, required: workspace_id, farm_id) → [schemas/get-miner-stats.md](../assets/schemas/get-miner-stats.md)
- `listFarmMetricsHistory(input: ListFarmMetricsHistoryInput, options?: ReadonlyCallOptions): Promise<ListFarmMetricsHistoryOutput>` — ListFarmMetricsHistory (read-only, required: workspace_id, farm_id, from_date, to_date) → [schemas/list-farm-metrics-history.md](../assets/schemas/list-farm-metrics-history.md)
- `listFarmEnergyHistory(input: ListFarmEnergyHistoryInput, options?: ReadonlyCallOptions): Promise<ListFarmEnergyHistoryOutput>` — ListFarmEnergyHistory (read-only, required: workspace_id, farm_id) → [schemas/list-farm-energy-history.md](../assets/schemas/list-farm-energy-history.md)
- `listMinerHistory(input: ListMinerHistoryInput, options?: ReadonlyCallOptions): Promise<ListMinerHistoryOutput>` — ListMinerHistory (read-only, required: workspace_id, farm_id, miner_id, from_time, to_time) → [schemas/list-miner-history.md](../assets/schemas/list-miner-history.md)
- `getMinerTasks(input: GetMinerTasksInput, options?: ReadonlyCallOptions): Promise<GetMinerTasksOutput>` — GetMinerTasks (read-only, required: workspace_id, farm_id, miner_id) → [schemas/get-miner-tasks.md](../assets/schemas/get-miner-tasks.md)
- `listMinerRebootEvents(input: ListMinerRebootEventsInput, options?: ReadonlyCallOptions): Promise<ListMinerRebootEventsOutput>` — ListMinerRebootEvents (read-only, required: workspace_id, farm_id) → [schemas/list-miner-reboot-events.md](../assets/schemas/list-miner-reboot-events.md)
- `getMinerRebootEvents(input: GetMinerRebootEventsInput, options?: ReadonlyCallOptions): Promise<GetMinerRebootEventsOutput>` — GetMinerRebootEvents (read-only, required: workspace_id, farm_id, miner_id) → [schemas/get-miner-reboot-events.md](../assets/schemas/get-miner-reboot-events.md)
- `listMinerPoolDiffs(input: ListMinerPoolDiffsInput, options?: ReadonlyCallOptions): Promise<ListMinerPoolDiffsOutput>` — ListMinerPoolDiffs (read-only, required: workspace_id, farm_id, from_time, to_time) → [schemas/list-miner-pool-diffs.md](../assets/schemas/list-miner-pool-diffs.md)
- `listAgents(input: ListAgentsInput, options?: ReadonlyCallOptions): Promise<ListAgentsOutput>` — ListAgents (read-only, required: workspace_id) → [schemas/list-agents.md](../assets/schemas/list-agents.md)
- `searchAgents(input: SearchAgentsInput, options?: ReadonlyCallOptions): Promise<SearchAgentsOutput>` — SearchAgents (read-only, required: workspace_id) → [schemas/search-agents.md](../assets/schemas/search-agents.md)
- `listTaskBatches(input: ListTaskBatchesInput, options?: ReadonlyCallOptions): Promise<ListTaskBatchesOutput>` — ListTaskBatches (read-only, required: workspace_id, farm_id) → [schemas/list-task-batches.md](../assets/schemas/list-task-batches.md)
- `createTaskBatchMinerSystemReboot(input: CreateTaskBatchMinerSystemRebootInput, options: DestructiveCallOptions): Promise<CreateTaskBatchMinerSystemRebootOutput>` — CreateTaskBatch_MinerSystemReboot (destructive, required: workspace_id, farm_id, task_name, miner_ids) → [schemas/create-task-batch-miner-system-reboot.md](../assets/schemas/create-task-batch-miner-system-reboot.md)
- `createTaskBatchMinerLogGet(input: CreateTaskBatchMinerLogGetInput, options: DestructiveCallOptions): Promise<CreateTaskBatchMinerLogGetOutput>` — CreateTaskBatch_MinerLogGet (destructive, required: workspace_id, farm_id, task_name, miner_ids) → [schemas/create-task-batch-miner-log-get.md](../assets/schemas/create-task-batch-miner-log-get.md)
- `createTaskBatchMinerLightUpdate(input: CreateTaskBatchMinerLightUpdateInput, options: DestructiveCallOptions): Promise<CreateTaskBatchMinerLightUpdateOutput>` — CreateTaskBatch_MinerLightUpdate (destructive, required: workspace_id, farm_id, task_name, miner_ids, params) → [schemas/create-task-batch-miner-light-update.md](../assets/schemas/create-task-batch-miner-light-update.md)
- `createTaskBatchMinerPowerModeUpdate(input: CreateTaskBatchMinerPowerModeUpdateInput, options: DestructiveCallOptions): Promise<CreateTaskBatchMinerPowerModeUpdateOutput>` — CreateTaskBatch_MinerPower_modeUpdate (destructive, required: workspace_id, farm_id, task_name, miner_ids, params) → [schemas/create-task-batch-miner-power-mode-update.md](../assets/schemas/create-task-batch-miner-power-mode-update.md)
- `createTaskBatchMinerFirmwareUpdate(input: CreateTaskBatchMinerFirmwareUpdateInput, options: DestructiveCallOptions): Promise<CreateTaskBatchMinerFirmwareUpdateOutput>` — CreateTaskBatch_MinerFirmwareUpdate (destructive, required: workspace_id, farm_id, task_name, miner_ids, params) → [schemas/create-task-batch-miner-firmware-update.md](../assets/schemas/create-task-batch-miner-firmware-update.md)
- `createTaskBatchMinerPoolLock(input: CreateTaskBatchMinerPoolLockInput, options: DestructiveCallOptions): Promise<CreateTaskBatchMinerPoolLockOutput>` — CreateTaskBatch_MinerPoolLock (destructive, required: workspace_id, farm_id, task_name, miner_ids, params) → [schemas/create-task-batch-miner-pool-lock.md](../assets/schemas/create-task-batch-miner-pool-lock.md)
- `createTaskBatchAgentScanCreate(input: CreateTaskBatchAgentScanCreateInput, options: DestructiveCallOptions): Promise<CreateTaskBatchAgentScanCreateOutput>` — CreateTaskBatch_AgentScanCreate (destructive, required: workspace_id, farm_id, task_name) → [schemas/create-task-batch-agent-scan-create.md](../assets/schemas/create-task-batch-agent-scan-create.md)
- `createTaskBatchAgentIpDiagnosisCreate(input: CreateTaskBatchAgentIpDiagnosisCreateInput, options: DestructiveCallOptions): Promise<CreateTaskBatchAgentIpDiagnosisCreateOutput>` — CreateTaskBatch_AgentIp_diagnosisCreate (destructive, required: workspace_id, farm_id, task_name, params) → [schemas/create-task-batch-agent-ip-diagnosis-create.md](../assets/schemas/create-task-batch-agent-ip-diagnosis-create.md)
- `createTaskBatchAgentSelfUpdate(input: CreateTaskBatchAgentSelfUpdateInput, options: DestructiveCallOptions): Promise<CreateTaskBatchAgentSelfUpdateOutput>` — CreateTaskBatch_AgentSelfUpdate (destructive, required: workspace_id, farm_id, task_name) → [schemas/create-task-batch-agent-self-update.md](../assets/schemas/create-task-batch-agent-self-update.md)
- `createTaskBatchMinerAssetUpdate(input: CreateTaskBatchMinerAssetUpdateInput, options: DestructiveCallOptions): Promise<CreateTaskBatchMinerAssetUpdateOutput>` — CreateTaskBatch_MinerAssetUpdate (destructive, required: workspace_id, farm_id, task_name, miner_ids, params) → [schemas/create-task-batch-miner-asset-update.md](../assets/schemas/create-task-batch-miner-asset-update.md)
- `createTaskBatchMinerAssetDelete(input: CreateTaskBatchMinerAssetDeleteInput, options: DestructiveCallOptions): Promise<CreateTaskBatchMinerAssetDeleteOutput>` — CreateTaskBatch_MinerAssetDelete (destructive, required: workspace_id, farm_id, task_name, miner_ids) → [schemas/create-task-batch-miner-asset-delete.md](../assets/schemas/create-task-batch-miner-asset-delete.md)
- `createTaskBatchMinerRackLocationUpdate(input: CreateTaskBatchMinerRackLocationUpdateInput, options: DestructiveCallOptions): Promise<CreateTaskBatchMinerRackLocationUpdateOutput>` — CreateTaskBatch_MinerRack_locationUpdate (destructive, required: workspace_id, farm_id, task_name, updates) → [schemas/create-task-batch-miner-rack-location-update.md](../assets/schemas/create-task-batch-miner-rack-location-update.md)
- `searchTaskBatches(input: SearchTaskBatchesInput, options?: ReadonlyCallOptions): Promise<SearchTaskBatchesOutput>` — SearchTaskBatches (read-only, required: workspace_id, farm_id) → [schemas/search-task-batches.md](../assets/schemas/search-task-batches.md)
- `getTaskBatch(input: GetTaskBatchInput, options?: ReadonlyCallOptions): Promise<GetTaskBatchOutput>` — GetTaskBatch (read-only, required: workspace_id, farm_id, batch_id) → [schemas/get-task-batch.md](../assets/schemas/get-task-batch.md)
- `getTaskBatchTasks(input: GetTaskBatchTasksInput, options?: ReadonlyCallOptions): Promise<GetTaskBatchTasksOutput>` — GetTaskBatchTasks (read-only, required: workspace_id, farm_id, batch_id) → [schemas/get-task-batch-tasks.md](../assets/schemas/get-task-batch-tasks.md)
- `listWorkspaces(input?: ListWorkspacesInput, options?: ReadonlyCallOptions): Promise<ListWorkspacesOutput>` — ListWorkspaces (read-only) → [schemas/list-workspaces.md](../assets/schemas/list-workspaces.md)
- `listBtcNetworkHistory(input?: ListBtcNetworkHistoryInput, options?: ReadonlyCallOptions): Promise<ListBtcNetworkHistoryOutput>` — ListBtcNetworkHistory (read-only) → [schemas/list-btc-network-history.md](../assets/schemas/list-btc-network-history.md)
