# Tool Signatures

Generated from Nonce MCP `tools/list`; OpenAPI and observed read-only MCP outputs only fill missing schema metadata.

- MCP endpoint: `https://mcp.nonce.app/mcp`
- OpenAPI supplement: https://docs.nonce.app/api-reference/openapi.json
- Tool count: 27

Import SDK types from `assets/runtime/src/generated/tool-signatures.ts`.

```ts
const client = await createNonceClient({ profile: "default" });
try {
  const farms = await client.listFarms({ workspace_id: "..." });
} finally {
  await client.close();
}
```

## Methods

- `listFarms(input: ListFarmsInput, options?: ReadonlyCallOptions): Promise<ListFarmsOutput>` - ListFarms (read-only, input: mcp, output: mcp+openapi, openapi: ListFarms)
- `listMiners(input: ListMinersInput, options?: ReadonlyCallOptions): Promise<ListMinersOutput>` - ListMiners (read-only, input: mcp, output: mcp+openapi, openapi: ListMiners)
- `searchMiners(input: SearchMinersInput, options?: ReadonlyCallOptions): Promise<SearchMinersOutput>` - SearchMiners (read-only, input: mcp, output: mcp+openapi, openapi: SearchMiners)
- `listFarmMetricsHistory(input: ListFarmMetricsHistoryInput, options?: ReadonlyCallOptions): Promise<ListFarmMetricsHistoryOutput>` - ListFarmMetricsHistory (read-only, input: mcp+openapi, output: mcp+openapi, openapi: ListFarmMetricsHistory)
- `listMinerHistory(input: ListMinerHistoryInput, options?: ReadonlyCallOptions): Promise<ListMinerHistoryOutput>` - ListMinerHistory (read-only, input: mcp+openapi, output: mcp+openapi, openapi: ListMinerHistory)
- `getMinerTasks(input: GetMinerTasksInput, options?: ReadonlyCallOptions): Promise<GetMinerTasksOutput>` - GetMinerTasks (read-only, input: mcp+openapi, output: mcp+openapi, openapi: GetMinerTasks)
- `listMinerRebootEvents(input: ListMinerRebootEventsInput, options?: ReadonlyCallOptions): Promise<ListMinerRebootEventsOutput>` - ListMinerRebootEvents (read-only, input: mcp, output: mcp)
- `listMinerPoolDiffs(input: ListMinerPoolDiffsInput, options?: ReadonlyCallOptions): Promise<ListMinerPoolDiffsOutput>` - ListMinerPoolDiffs (read-only, input: mcp+openapi, output: mcp+openapi, openapi: ListMinerPoolDiffs)
- `listAgents(input: ListAgentsInput, options?: ReadonlyCallOptions): Promise<ListAgentsOutput>` - ListAgents (read-only, input: mcp, output: mcp+openapi, openapi: ListAgents)
- `searchAgents(input: SearchAgentsInput, options?: ReadonlyCallOptions): Promise<SearchAgentsOutput>` - SearchAgents (read-only, input: mcp+openapi, output: mcp+openapi, openapi: SearchAgents)
- `listTaskBatches(input: ListTaskBatchesInput, options?: ReadonlyCallOptions): Promise<ListTaskBatchesOutput>` - ListTaskBatches (read-only, input: mcp, output: mcp+openapi, openapi: ListTaskBatches)
- `createTaskBatchMinerSystemReboot(input: CreateTaskBatchMinerSystemRebootInput, options: DestructiveCallOptions): Promise<CreateTaskBatchMinerSystemRebootOutput>` - CreateTaskBatch_MinerSystemReboot (destructive, input: mcp, output: mcp+openapi, openapi: CreateTaskBatch)
- `createTaskBatchMinerLogGet(input: CreateTaskBatchMinerLogGetInput, options: DestructiveCallOptions): Promise<CreateTaskBatchMinerLogGetOutput>` - CreateTaskBatch_MinerLogGet (destructive, input: mcp, output: mcp+openapi, openapi: CreateTaskBatch)
- `createTaskBatchMinerLightUpdate(input: CreateTaskBatchMinerLightUpdateInput, options: DestructiveCallOptions): Promise<CreateTaskBatchMinerLightUpdateOutput>` - CreateTaskBatch_MinerLightUpdate (destructive, input: mcp, output: mcp+openapi, openapi: CreateTaskBatch)
- `createTaskBatchMinerPowerModeUpdate(input: CreateTaskBatchMinerPowerModeUpdateInput, options: DestructiveCallOptions): Promise<CreateTaskBatchMinerPowerModeUpdateOutput>` - CreateTaskBatch_MinerPower_modeUpdate (destructive, input: mcp, output: mcp+openapi, openapi: CreateTaskBatch)
- `createTaskBatchMinerFirmwareUpdate(input: CreateTaskBatchMinerFirmwareUpdateInput, options: DestructiveCallOptions): Promise<CreateTaskBatchMinerFirmwareUpdateOutput>` - CreateTaskBatch_MinerFirmwareUpdate (destructive, input: mcp, output: mcp+openapi, openapi: CreateTaskBatch)
- `createTaskBatchMinerPoolLock(input: CreateTaskBatchMinerPoolLockInput, options: DestructiveCallOptions): Promise<CreateTaskBatchMinerPoolLockOutput>` - CreateTaskBatch_MinerPoolLock (destructive, input: mcp, output: mcp+openapi, openapi: CreateTaskBatch)
- `createTaskBatchAgentScanCreate(input: CreateTaskBatchAgentScanCreateInput, options: DestructiveCallOptions): Promise<CreateTaskBatchAgentScanCreateOutput>` - CreateTaskBatch_AgentScanCreate (destructive, input: mcp, output: mcp+openapi, openapi: CreateTaskBatch)
- `createTaskBatchAgentIpDiagnosisCreate(input: CreateTaskBatchAgentIpDiagnosisCreateInput, options: DestructiveCallOptions): Promise<CreateTaskBatchAgentIpDiagnosisCreateOutput>` - CreateTaskBatch_AgentIp_diagnosisCreate (destructive, input: mcp, output: mcp+openapi, openapi: CreateTaskBatch)
- `createTaskBatchAgentSelfUpdate(input: CreateTaskBatchAgentSelfUpdateInput, options: DestructiveCallOptions): Promise<CreateTaskBatchAgentSelfUpdateOutput>` - CreateTaskBatch_AgentSelfUpdate (destructive, input: mcp, output: mcp+openapi, openapi: CreateTaskBatch)
- `createTaskBatchMinerAssetUpdate(input: CreateTaskBatchMinerAssetUpdateInput, options: DestructiveCallOptions): Promise<CreateTaskBatchMinerAssetUpdateOutput>` - CreateTaskBatch_MinerAssetUpdate (destructive, input: mcp, output: mcp+openapi, openapi: CreateTaskBatch)
- `createTaskBatchMinerAssetDelete(input: CreateTaskBatchMinerAssetDeleteInput, options: DestructiveCallOptions): Promise<CreateTaskBatchMinerAssetDeleteOutput>` - CreateTaskBatch_MinerAssetDelete (destructive, input: mcp, output: mcp+openapi, openapi: CreateTaskBatch)
- `createTaskBatchMinerRackLocationUpdate(input: CreateTaskBatchMinerRackLocationUpdateInput, options: DestructiveCallOptions): Promise<CreateTaskBatchMinerRackLocationUpdateOutput>` - CreateTaskBatch_MinerRack_locationUpdate (destructive, input: mcp, output: mcp+openapi, openapi: CreateTaskBatch)
- `searchTaskBatches(input: SearchTaskBatchesInput, options?: ReadonlyCallOptions): Promise<SearchTaskBatchesOutput>` - SearchTaskBatches (read-only, input: mcp+openapi, output: mcp+openapi, openapi: SearchTaskBatches)
- `getTaskBatch(input: GetTaskBatchInput, options?: ReadonlyCallOptions): Promise<GetTaskBatchOutput>` - GetTaskBatch (read-only, input: mcp, output: mcp, openapi: GetTaskBatch)
- `getTaskBatchTasks(input: GetTaskBatchTasksInput, options?: ReadonlyCallOptions): Promise<GetTaskBatchTasksOutput>` - GetTaskBatchTasks (read-only, input: mcp, output: mcp)
- `listWorkspaces(input?: ListWorkspacesInput, options?: ReadonlyCallOptions): Promise<ListWorkspacesOutput>` - ListWorkspaces (read-only, input: mcp, output: observed-mcp)
