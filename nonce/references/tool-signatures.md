# Tool Signatures

Generated from checked Nonce method definitions; supplemental schemas only fill missing metadata.

- Default endpoint: `https://mcp.nonce.app/mcp`
- Method count: 27

This file is a compact index. Before writing JavaScript task code, open `assets/tool-signatures.ts` from the installed skill root recorded during path setup and read the exact `<MethodType>Input` and `<MethodType>Output` interfaces for every method you call.

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

## Methods

- `listFarms(input: ListFarmsInput, options?: ReadonlyCallOptions): Promise<ListFarmsOutput>` - ListFarms (read-only, required: workspace_id)
- `listMiners(input: ListMinersInput, options?: ReadonlyCallOptions): Promise<ListMinersOutput>` - ListMiners (read-only, required: workspace_id, farm_id)
- `searchMiners(input: SearchMinersInput, options?: ReadonlyCallOptions): Promise<SearchMinersOutput>` - SearchMiners (read-only, required: workspace_id, farm_id)
- `listFarmMetricsHistory(input: ListFarmMetricsHistoryInput, options?: ReadonlyCallOptions): Promise<ListFarmMetricsHistoryOutput>` - ListFarmMetricsHistory (read-only, required: workspace_id, farm_id, from_date, to_date)
- `listMinerHistory(input: ListMinerHistoryInput, options?: ReadonlyCallOptions): Promise<ListMinerHistoryOutput>` - ListMinerHistory (read-only, required: workspace_id, farm_id, miner_id, from_time, to_time)
- `getMinerTasks(input: GetMinerTasksInput, options?: ReadonlyCallOptions): Promise<GetMinerTasksOutput>` - GetMinerTasks (read-only, required: workspace_id, farm_id, miner_id)
- `listMinerRebootEvents(input: ListMinerRebootEventsInput, options?: ReadonlyCallOptions): Promise<ListMinerRebootEventsOutput>` - ListMinerRebootEvents (read-only, required: workspace_id, farm_id)
- `listMinerPoolDiffs(input: ListMinerPoolDiffsInput, options?: ReadonlyCallOptions): Promise<ListMinerPoolDiffsOutput>` - ListMinerPoolDiffs (read-only, required: workspace_id, farm_id, from_time, to_time)
- `listAgents(input: ListAgentsInput, options?: ReadonlyCallOptions): Promise<ListAgentsOutput>` - ListAgents (read-only, required: workspace_id)
- `searchAgents(input: SearchAgentsInput, options?: ReadonlyCallOptions): Promise<SearchAgentsOutput>` - SearchAgents (read-only, required: workspace_id)
- `listTaskBatches(input: ListTaskBatchesInput, options?: ReadonlyCallOptions): Promise<ListTaskBatchesOutput>` - ListTaskBatches (read-only, required: workspace_id, farm_id)
- `createTaskBatchMinerSystemReboot(input: CreateTaskBatchMinerSystemRebootInput, options: DestructiveCallOptions): Promise<CreateTaskBatchMinerSystemRebootOutput>` - CreateTaskBatch_MinerSystemReboot (destructive, required: workspace_id, farm_id, task_name, miner_ids)
- `createTaskBatchMinerLogGet(input: CreateTaskBatchMinerLogGetInput, options: DestructiveCallOptions): Promise<CreateTaskBatchMinerLogGetOutput>` - CreateTaskBatch_MinerLogGet (destructive, required: workspace_id, farm_id, task_name, miner_ids)
- `createTaskBatchMinerLightUpdate(input: CreateTaskBatchMinerLightUpdateInput, options: DestructiveCallOptions): Promise<CreateTaskBatchMinerLightUpdateOutput>` - CreateTaskBatch_MinerLightUpdate (destructive, required: workspace_id, farm_id, task_name, miner_ids, params)
- `createTaskBatchMinerPowerModeUpdate(input: CreateTaskBatchMinerPowerModeUpdateInput, options: DestructiveCallOptions): Promise<CreateTaskBatchMinerPowerModeUpdateOutput>` - CreateTaskBatch_MinerPower_modeUpdate (destructive, required: workspace_id, farm_id, task_name, miner_ids, params)
- `createTaskBatchMinerFirmwareUpdate(input: CreateTaskBatchMinerFirmwareUpdateInput, options: DestructiveCallOptions): Promise<CreateTaskBatchMinerFirmwareUpdateOutput>` - CreateTaskBatch_MinerFirmwareUpdate (destructive, required: workspace_id, farm_id, task_name, miner_ids, params)
- `createTaskBatchMinerPoolLock(input: CreateTaskBatchMinerPoolLockInput, options: DestructiveCallOptions): Promise<CreateTaskBatchMinerPoolLockOutput>` - CreateTaskBatch_MinerPoolLock (destructive, required: workspace_id, farm_id, task_name, miner_ids, params)
- `createTaskBatchAgentScanCreate(input: CreateTaskBatchAgentScanCreateInput, options: DestructiveCallOptions): Promise<CreateTaskBatchAgentScanCreateOutput>` - CreateTaskBatch_AgentScanCreate (destructive, required: workspace_id, farm_id, task_name)
- `createTaskBatchAgentIpDiagnosisCreate(input: CreateTaskBatchAgentIpDiagnosisCreateInput, options: DestructiveCallOptions): Promise<CreateTaskBatchAgentIpDiagnosisCreateOutput>` - CreateTaskBatch_AgentIp_diagnosisCreate (destructive, required: workspace_id, farm_id, task_name, params)
- `createTaskBatchAgentSelfUpdate(input: CreateTaskBatchAgentSelfUpdateInput, options: DestructiveCallOptions): Promise<CreateTaskBatchAgentSelfUpdateOutput>` - CreateTaskBatch_AgentSelfUpdate (destructive, required: workspace_id, farm_id, task_name)
- `createTaskBatchMinerAssetUpdate(input: CreateTaskBatchMinerAssetUpdateInput, options: DestructiveCallOptions): Promise<CreateTaskBatchMinerAssetUpdateOutput>` - CreateTaskBatch_MinerAssetUpdate (destructive, required: workspace_id, farm_id, task_name, miner_ids, params)
- `createTaskBatchMinerAssetDelete(input: CreateTaskBatchMinerAssetDeleteInput, options: DestructiveCallOptions): Promise<CreateTaskBatchMinerAssetDeleteOutput>` - CreateTaskBatch_MinerAssetDelete (destructive, required: workspace_id, farm_id, task_name, miner_ids)
- `createTaskBatchMinerRackLocationUpdate(input: CreateTaskBatchMinerRackLocationUpdateInput, options: DestructiveCallOptions): Promise<CreateTaskBatchMinerRackLocationUpdateOutput>` - CreateTaskBatch_MinerRack_locationUpdate (destructive, required: workspace_id, farm_id, task_name, updates)
- `searchTaskBatches(input: SearchTaskBatchesInput, options?: ReadonlyCallOptions): Promise<SearchTaskBatchesOutput>` - SearchTaskBatches (read-only, required: workspace_id, farm_id)
- `getTaskBatch(input: GetTaskBatchInput, options?: ReadonlyCallOptions): Promise<GetTaskBatchOutput>` - GetTaskBatch (read-only, required: workspace_id, farm_id, batch_id)
- `getTaskBatchTasks(input: GetTaskBatchTasksInput, options?: ReadonlyCallOptions): Promise<GetTaskBatchTasksOutput>` - GetTaskBatchTasks (read-only, required: workspace_id, farm_id, batch_id)
- `listWorkspaces(input?: ListWorkspacesInput, options?: ReadonlyCallOptions): Promise<ListWorkspacesOutput>` - ListWorkspaces (read-only)
