# Tool Signatures

Generated from checked Nonce method definitions; supplemental schemas only fill missing metadata.

- Default endpoint: `https://mcp.nonce.app/mcp`
- Method count: 27

This file is a compact index. Before writing JavaScript task code, read the method's signature file under `references/signatures/` for the full `<MethodType>Input` / `<MethodType>Output` interfaces.

Do not call schema/reference endpoints for business operations. Runtime calls must go through the local SDK.

The example below assumes the task file is `<installed skill root>/.nonce-skill/tasks/query.mjs`. Runner task code should receive profile and endpoint selection from runner flags rather than hardcoding them.

If a task file is placed elsewhere, adjust the import path to the installed `scripts/skill-runtime.mjs` location using the recorded skill root value.

```js
import { createNonceClient } from "../../scripts/skill-runtime.mjs";

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
  signal?: AbortSignal;
  timeoutMs?: number;
}

type ReadonlyCallOptions = CallOptions;

interface DestructiveCallOptions extends CallOptions {
  confirmDestructive: true;
  confirmation: string;
}
```

## Methods

- `listFarms(input: ListFarmsInput, options?: ReadonlyCallOptions): Promise<ListFarmsOutput>` — ListFarms (read-only, required: workspace_id) → [signatures/list-farms.md](signatures/list-farms.md)
- `listMiners(input: ListMinersInput, options?: ReadonlyCallOptions): Promise<ListMinersOutput>` — ListMiners (read-only, required: workspace_id, farm_id) → [signatures/list-miners.md](signatures/list-miners.md)
- `searchMiners(input: SearchMinersInput, options?: ReadonlyCallOptions): Promise<SearchMinersOutput>` — SearchMiners (read-only, required: workspace_id, farm_id) → [signatures/search-miners.md](signatures/search-miners.md)
- `listFarmMetricsHistory(input: ListFarmMetricsHistoryInput, options?: ReadonlyCallOptions): Promise<ListFarmMetricsHistoryOutput>` — ListFarmMetricsHistory (read-only, required: workspace_id, farm_id, from_date, to_date) → [signatures/list-farm-metrics-history.md](signatures/list-farm-metrics-history.md)
- `listMinerHistory(input: ListMinerHistoryInput, options?: ReadonlyCallOptions): Promise<ListMinerHistoryOutput>` — ListMinerHistory (read-only, required: workspace_id, farm_id, miner_id, from_time, to_time) → [signatures/list-miner-history.md](signatures/list-miner-history.md)
- `getMinerTasks(input: GetMinerTasksInput, options?: ReadonlyCallOptions): Promise<GetMinerTasksOutput>` — GetMinerTasks (read-only, required: workspace_id, farm_id, miner_id) → [signatures/get-miner-tasks.md](signatures/get-miner-tasks.md)
- `listMinerRebootEvents(input: ListMinerRebootEventsInput, options?: ReadonlyCallOptions): Promise<ListMinerRebootEventsOutput>` — ListMinerRebootEvents (read-only, required: workspace_id, farm_id) → [signatures/list-miner-reboot-events.md](signatures/list-miner-reboot-events.md)
- `listMinerPoolDiffs(input: ListMinerPoolDiffsInput, options?: ReadonlyCallOptions): Promise<ListMinerPoolDiffsOutput>` — ListMinerPoolDiffs (read-only, required: workspace_id, farm_id, from_time, to_time) → [signatures/list-miner-pool-diffs.md](signatures/list-miner-pool-diffs.md)
- `listAgents(input: ListAgentsInput, options?: ReadonlyCallOptions): Promise<ListAgentsOutput>` — ListAgents (read-only, required: workspace_id) → [signatures/list-agents.md](signatures/list-agents.md)
- `searchAgents(input: SearchAgentsInput, options?: ReadonlyCallOptions): Promise<SearchAgentsOutput>` — SearchAgents (read-only, required: workspace_id) → [signatures/search-agents.md](signatures/search-agents.md)
- `listTaskBatches(input: ListTaskBatchesInput, options?: ReadonlyCallOptions): Promise<ListTaskBatchesOutput>` — ListTaskBatches (read-only, required: workspace_id, farm_id) → [signatures/list-task-batches.md](signatures/list-task-batches.md)
- `createTaskBatchMinerSystemReboot(input: CreateTaskBatchMinerSystemRebootInput, options: DestructiveCallOptions): Promise<CreateTaskBatchMinerSystemRebootOutput>` — CreateTaskBatch_MinerSystemReboot (destructive, required: workspace_id, farm_id, task_name, miner_ids) → [signatures/create-task-batch-miner-system-reboot.md](signatures/create-task-batch-miner-system-reboot.md)
- `createTaskBatchMinerLogGet(input: CreateTaskBatchMinerLogGetInput, options: DestructiveCallOptions): Promise<CreateTaskBatchMinerLogGetOutput>` — CreateTaskBatch_MinerLogGet (destructive, required: workspace_id, farm_id, task_name, miner_ids) → [signatures/create-task-batch-miner-log-get.md](signatures/create-task-batch-miner-log-get.md)
- `createTaskBatchMinerLightUpdate(input: CreateTaskBatchMinerLightUpdateInput, options: DestructiveCallOptions): Promise<CreateTaskBatchMinerLightUpdateOutput>` — CreateTaskBatch_MinerLightUpdate (destructive, required: workspace_id, farm_id, task_name, miner_ids, params) → [signatures/create-task-batch-miner-light-update.md](signatures/create-task-batch-miner-light-update.md)
- `createTaskBatchMinerPowerModeUpdate(input: CreateTaskBatchMinerPowerModeUpdateInput, options: DestructiveCallOptions): Promise<CreateTaskBatchMinerPowerModeUpdateOutput>` — CreateTaskBatch_MinerPower_modeUpdate (destructive, required: workspace_id, farm_id, task_name, miner_ids, params) → [signatures/create-task-batch-miner-power-mode-update.md](signatures/create-task-batch-miner-power-mode-update.md)
- `createTaskBatchMinerFirmwareUpdate(input: CreateTaskBatchMinerFirmwareUpdateInput, options: DestructiveCallOptions): Promise<CreateTaskBatchMinerFirmwareUpdateOutput>` — CreateTaskBatch_MinerFirmwareUpdate (destructive, required: workspace_id, farm_id, task_name, miner_ids, params) → [signatures/create-task-batch-miner-firmware-update.md](signatures/create-task-batch-miner-firmware-update.md)
- `createTaskBatchMinerPoolLock(input: CreateTaskBatchMinerPoolLockInput, options: DestructiveCallOptions): Promise<CreateTaskBatchMinerPoolLockOutput>` — CreateTaskBatch_MinerPoolLock (destructive, required: workspace_id, farm_id, task_name, miner_ids, params) → [signatures/create-task-batch-miner-pool-lock.md](signatures/create-task-batch-miner-pool-lock.md)
- `createTaskBatchAgentScanCreate(input: CreateTaskBatchAgentScanCreateInput, options: DestructiveCallOptions): Promise<CreateTaskBatchAgentScanCreateOutput>` — CreateTaskBatch_AgentScanCreate (destructive, required: workspace_id, farm_id, task_name) → [signatures/create-task-batch-agent-scan-create.md](signatures/create-task-batch-agent-scan-create.md)
- `createTaskBatchAgentIpDiagnosisCreate(input: CreateTaskBatchAgentIpDiagnosisCreateInput, options: DestructiveCallOptions): Promise<CreateTaskBatchAgentIpDiagnosisCreateOutput>` — CreateTaskBatch_AgentIp_diagnosisCreate (destructive, required: workspace_id, farm_id, task_name, params) → [signatures/create-task-batch-agent-ip-diagnosis-create.md](signatures/create-task-batch-agent-ip-diagnosis-create.md)
- `createTaskBatchAgentSelfUpdate(input: CreateTaskBatchAgentSelfUpdateInput, options: DestructiveCallOptions): Promise<CreateTaskBatchAgentSelfUpdateOutput>` — CreateTaskBatch_AgentSelfUpdate (destructive, required: workspace_id, farm_id, task_name) → [signatures/create-task-batch-agent-self-update.md](signatures/create-task-batch-agent-self-update.md)
- `createTaskBatchMinerAssetUpdate(input: CreateTaskBatchMinerAssetUpdateInput, options: DestructiveCallOptions): Promise<CreateTaskBatchMinerAssetUpdateOutput>` — CreateTaskBatch_MinerAssetUpdate (destructive, required: workspace_id, farm_id, task_name, miner_ids, params) → [signatures/create-task-batch-miner-asset-update.md](signatures/create-task-batch-miner-asset-update.md)
- `createTaskBatchMinerAssetDelete(input: CreateTaskBatchMinerAssetDeleteInput, options: DestructiveCallOptions): Promise<CreateTaskBatchMinerAssetDeleteOutput>` — CreateTaskBatch_MinerAssetDelete (destructive, required: workspace_id, farm_id, task_name, miner_ids) → [signatures/create-task-batch-miner-asset-delete.md](signatures/create-task-batch-miner-asset-delete.md)
- `createTaskBatchMinerRackLocationUpdate(input: CreateTaskBatchMinerRackLocationUpdateInput, options: DestructiveCallOptions): Promise<CreateTaskBatchMinerRackLocationUpdateOutput>` — CreateTaskBatch_MinerRack_locationUpdate (destructive, required: workspace_id, farm_id, task_name, updates) → [signatures/create-task-batch-miner-rack-location-update.md](signatures/create-task-batch-miner-rack-location-update.md)
- `searchTaskBatches(input: SearchTaskBatchesInput, options?: ReadonlyCallOptions): Promise<SearchTaskBatchesOutput>` — SearchTaskBatches (read-only, required: workspace_id, farm_id) → [signatures/search-task-batches.md](signatures/search-task-batches.md)
- `getTaskBatch(input: GetTaskBatchInput, options?: ReadonlyCallOptions): Promise<GetTaskBatchOutput>` — GetTaskBatch (read-only, required: workspace_id, farm_id, batch_id) → [signatures/get-task-batch.md](signatures/get-task-batch.md)
- `getTaskBatchTasks(input: GetTaskBatchTasksInput, options?: ReadonlyCallOptions): Promise<GetTaskBatchTasksOutput>` — GetTaskBatchTasks (read-only, required: workspace_id, farm_id, batch_id) → [signatures/get-task-batch-tasks.md](signatures/get-task-batch-tasks.md)
- `listWorkspaces(input?: ListWorkspacesInput, options?: ReadonlyCallOptions): Promise<ListWorkspacesOutput>` — ListWorkspaces (read-only) → [signatures/list-workspaces.md](signatures/list-workspaces.md)
