# createTaskBatchMinerAssetUpdate

CreateTaskBatch_MinerAssetUpdate — destructive

Required: `workspace_id`, `farm_id`, `task_name`, `miner_ids`, `params`

## Signature

```ts
createTaskBatchMinerAssetUpdate(input: CreateTaskBatchMinerAssetUpdateInput, options: DestructiveCallOptions): Promise<CreateTaskBatchMinerAssetUpdateOutput>
```

## Input

```ts
interface CreateTaskBatchMinerAssetUpdateInput {
  workspace_id: string;
  farm_id: string;
  /**
   * Update miner lifecycle status in inventory. Metadata-only; does not affect mining operation.
   */
  task_name: "miner.asset.update";
  /**
   * Array of miner IDs to execute task on
   */
  miner_ids: string[];
  /**
   * Asset status update parameters.
   */
  params: {
    /**
     * New asset status for the miners
     */
    status: "online" | "on_rack" | "off_rack" | "transit" | "maintenance" | "retired" | "archived";
    /**
     * Optional comment for the status update
     */
    comment?: string;
  };
}
```

## Output

```ts
interface CreateTaskBatchMinerAssetUpdateOutput {
  /**
   * Indicates if the request was successful
   */
  success: boolean;
  /**
   * Array of items
   */
  data: {
    /**
     * Miner task batch ID
     */
    batch_id: string;
    /**
     * Miner task name
     */
    task_name:
      | "agent.scan.create"
      | "agent.ip_diagnosis.create"
      | "agent.self.update"
      | "miner.system.reboot"
      | "miner.log.get"
      | "miner.light.update"
      | "miner.power_mode.update"
      | "miner.pool.update"
      | "miner.pool.lock"
      | "miner.firmware.update"
      | "miner.asset.update"
      | "miner.asset.delete"
      | "miner.rack_location.update";
    /**
     * Number of tasks in the batch
     */
    task_count: number;
    /**
     * Task parameters (JSON). Structure varies by task_name.
     */
    task_params: Record<string, unknown> | null;
    /**
     * Represents an entity that performs actions in the system (user, API key, or system)
     */
    created_by: Record<string, unknown> | null;
    /**
     * This is a timestamp in ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ.
     */
    created_at: string;
  }[];
  /**
   * Error object (null on success)
   */
  error: null;
  meta: {
    summary: {
      created_count: number;
      skipped_count: number;
    };
    skipped?: {
      /**
       * Reason a miner was skipped during task batch creation. `no_change` = miner is already in the requested state; `unsupported_mode` = miner hardware does not support the requested mode; `miner_not_found` = miner id was not found in the workspace or farm; `unstable_miner` = miner row is flagged unstable and cannot accept actions.
       */
      reason: "no_change" | "unsupported_mode" | "miner_not_found" | "unstable_miner";
      message: string;
      miner_ids: string[];
    }[];
  };
}
```
