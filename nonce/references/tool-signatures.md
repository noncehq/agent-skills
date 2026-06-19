# Tool Signatures

Generated from Nonce MCP `tools/list`; OpenAPI and observed read-only MCP outputs only fill missing schema metadata.

- MCP endpoint: `https://mcp.nonce.app/mcp`
- OpenAPI supplement: https://docs.nonce.app/api-reference/openapi.json
- Tool count: 27

This file is a compact index. Before writing task code, open `assets/tool-signatures.ts` and read the exact `<MethodType>Input` and `<MethodType>Output` interfaces for every method you call.

Do not call the OpenAPI endpoint for business operations. OpenAPI is only used here to supplement missing schema metadata; runtime calls must go through the local SDK.

The example below assumes the task file is `.nonce-skill/tasks/query.ts`. Runner task code should receive profile and endpoint selection from `nonce:run` flags rather than hardcoding them.

```ts
import { createNonceClient } from "../../scripts/skill-runtime.js";

const client = await createNonceClient();
try {
  const farms = await client.listFarms({ workspace_id: "..." });
  console.log(JSON.stringify({ farms }));
} finally {
  await client.close();
}
```

## Methods

- `listFarms(input: ListFarmsInput, options?: ReadonlyCallOptions): Promise<ListFarmsOutput>` - ListFarms (read-only, input: mcp, output: mcp+openapi, required: workspace_id, openapi: ListFarms)
- `listMiners(input: ListMinersInput, options?: ReadonlyCallOptions): Promise<ListMinersOutput>` - ListMiners (read-only, input: mcp, output: mcp+openapi, required: workspace_id, farm_id, openapi: ListMiners)
- `searchMiners(input: SearchMinersInput, options?: ReadonlyCallOptions): Promise<SearchMinersOutput>` - SearchMiners (read-only, input: mcp, output: mcp+openapi, required: workspace_id, farm_id, openapi: SearchMiners)
- `listFarmMetricsHistory(input: ListFarmMetricsHistoryInput, options?: ReadonlyCallOptions): Promise<ListFarmMetricsHistoryOutput>` - ListFarmMetricsHistory (read-only, input: mcp+openapi, output: mcp+openapi, required: workspace_id, farm_id, from_date, to_date, openapi: ListFarmMetricsHistory)
- `listMinerHistory(input: ListMinerHistoryInput, options?: ReadonlyCallOptions): Promise<ListMinerHistoryOutput>` - ListMinerHistory (read-only, input: mcp+openapi, output: mcp+openapi, required: workspace_id, farm_id, miner_id, from_time, to_time, openapi: ListMinerHistory)
- `getMinerTasks(input: GetMinerTasksInput, options?: ReadonlyCallOptions): Promise<GetMinerTasksOutput>` - GetMinerTasks (read-only, input: mcp+openapi, output: mcp+openapi, required: workspace_id, farm_id, miner_id, openapi: GetMinerTasks)
- `listMinerRebootEvents(input: ListMinerRebootEventsInput, options?: ReadonlyCallOptions): Promise<ListMinerRebootEventsOutput>` - ListMinerRebootEvents (read-only, input: mcp, output: mcp, required: workspace_id, farm_id)
- `listMinerPoolDiffs(input: ListMinerPoolDiffsInput, options?: ReadonlyCallOptions): Promise<ListMinerPoolDiffsOutput>` - ListMinerPoolDiffs (read-only, input: mcp+openapi, output: mcp+openapi, required: workspace_id, farm_id, from_time, to_time, openapi: ListMinerPoolDiffs)
- `listAgents(input: ListAgentsInput, options?: ReadonlyCallOptions): Promise<ListAgentsOutput>` - ListAgents (read-only, input: mcp, output: mcp+openapi, required: workspace_id, openapi: ListAgents)
- `searchAgents(input: SearchAgentsInput, options?: ReadonlyCallOptions): Promise<SearchAgentsOutput>` - SearchAgents (read-only, input: mcp+openapi, output: mcp+openapi, required: workspace_id, openapi: SearchAgents)
- `listTaskBatches(input: ListTaskBatchesInput, options?: ReadonlyCallOptions): Promise<ListTaskBatchesOutput>` - ListTaskBatches (read-only, input: mcp, output: mcp+openapi, required: workspace_id, farm_id, openapi: ListTaskBatches)
- `createTaskBatchMinerSystemReboot(input: CreateTaskBatchMinerSystemRebootInput, options: DestructiveCallOptions): Promise<CreateTaskBatchMinerSystemRebootOutput>` - CreateTaskBatch_MinerSystemReboot (destructive, input: mcp, output: mcp+openapi, required: workspace_id, farm_id, task_name, miner_ids, openapi: CreateTaskBatch)
- `createTaskBatchMinerLogGet(input: CreateTaskBatchMinerLogGetInput, options: DestructiveCallOptions): Promise<CreateTaskBatchMinerLogGetOutput>` - CreateTaskBatch_MinerLogGet (destructive, input: mcp, output: mcp+openapi, required: workspace_id, farm_id, task_name, miner_ids, openapi: CreateTaskBatch)
- `createTaskBatchMinerLightUpdate(input: CreateTaskBatchMinerLightUpdateInput, options: DestructiveCallOptions): Promise<CreateTaskBatchMinerLightUpdateOutput>` - CreateTaskBatch_MinerLightUpdate (destructive, input: mcp, output: mcp+openapi, required: workspace_id, farm_id, task_name, miner_ids, params, openapi: CreateTaskBatch)
- `createTaskBatchMinerPowerModeUpdate(input: CreateTaskBatchMinerPowerModeUpdateInput, options: DestructiveCallOptions): Promise<CreateTaskBatchMinerPowerModeUpdateOutput>` - CreateTaskBatch_MinerPower_modeUpdate (destructive, input: mcp, output: mcp+openapi, required: workspace_id, farm_id, task_name, miner_ids, params, openapi: CreateTaskBatch)
- `createTaskBatchMinerFirmwareUpdate(input: CreateTaskBatchMinerFirmwareUpdateInput, options: DestructiveCallOptions): Promise<CreateTaskBatchMinerFirmwareUpdateOutput>` - CreateTaskBatch_MinerFirmwareUpdate (destructive, input: mcp, output: mcp+openapi, required: workspace_id, farm_id, task_name, miner_ids, params, openapi: CreateTaskBatch)
- `createTaskBatchMinerPoolLock(input: CreateTaskBatchMinerPoolLockInput, options: DestructiveCallOptions): Promise<CreateTaskBatchMinerPoolLockOutput>` - CreateTaskBatch_MinerPoolLock (destructive, input: mcp, output: mcp+openapi, required: workspace_id, farm_id, task_name, miner_ids, params, openapi: CreateTaskBatch)
- `createTaskBatchAgentScanCreate(input: CreateTaskBatchAgentScanCreateInput, options: DestructiveCallOptions): Promise<CreateTaskBatchAgentScanCreateOutput>` - CreateTaskBatch_AgentScanCreate (destructive, input: mcp, output: mcp+openapi, required: workspace_id, farm_id, task_name, openapi: CreateTaskBatch)
- `createTaskBatchAgentIpDiagnosisCreate(input: CreateTaskBatchAgentIpDiagnosisCreateInput, options: DestructiveCallOptions): Promise<CreateTaskBatchAgentIpDiagnosisCreateOutput>` - CreateTaskBatch_AgentIp_diagnosisCreate (destructive, input: mcp, output: mcp+openapi, required: workspace_id, farm_id, task_name, params, openapi: CreateTaskBatch)
- `createTaskBatchAgentSelfUpdate(input: CreateTaskBatchAgentSelfUpdateInput, options: DestructiveCallOptions): Promise<CreateTaskBatchAgentSelfUpdateOutput>` - CreateTaskBatch_AgentSelfUpdate (destructive, input: mcp, output: mcp+openapi, required: workspace_id, farm_id, task_name, openapi: CreateTaskBatch)
- `createTaskBatchMinerAssetUpdate(input: CreateTaskBatchMinerAssetUpdateInput, options: DestructiveCallOptions): Promise<CreateTaskBatchMinerAssetUpdateOutput>` - CreateTaskBatch_MinerAssetUpdate (destructive, input: mcp, output: mcp+openapi, required: workspace_id, farm_id, task_name, miner_ids, params, openapi: CreateTaskBatch)
- `createTaskBatchMinerAssetDelete(input: CreateTaskBatchMinerAssetDeleteInput, options: DestructiveCallOptions): Promise<CreateTaskBatchMinerAssetDeleteOutput>` - CreateTaskBatch_MinerAssetDelete (destructive, input: mcp, output: mcp+openapi, required: workspace_id, farm_id, task_name, miner_ids, openapi: CreateTaskBatch)
- `createTaskBatchMinerRackLocationUpdate(input: CreateTaskBatchMinerRackLocationUpdateInput, options: DestructiveCallOptions): Promise<CreateTaskBatchMinerRackLocationUpdateOutput>` - CreateTaskBatch_MinerRack_locationUpdate (destructive, input: mcp, output: mcp+openapi, required: workspace_id, farm_id, task_name, updates, openapi: CreateTaskBatch)
- `searchTaskBatches(input: SearchTaskBatchesInput, options?: ReadonlyCallOptions): Promise<SearchTaskBatchesOutput>` - SearchTaskBatches (read-only, input: mcp+openapi, output: mcp+openapi, required: workspace_id, farm_id, openapi: SearchTaskBatches)
- `getTaskBatch(input: GetTaskBatchInput, options?: ReadonlyCallOptions): Promise<GetTaskBatchOutput>` - GetTaskBatch (read-only, input: mcp, output: mcp, required: workspace_id, farm_id, batch_id, openapi: GetTaskBatch)
- `getTaskBatchTasks(input: GetTaskBatchTasksInput, options?: ReadonlyCallOptions): Promise<GetTaskBatchTasksOutput>` - GetTaskBatchTasks (read-only, input: mcp, output: mcp, required: workspace_id, farm_id, batch_id)
- `listWorkspaces(input?: ListWorkspacesInput, options?: ReadonlyCallOptions): Promise<ListWorkspacesOutput>` - ListWorkspaces (read-only, input: mcp, output: observed-mcp)
