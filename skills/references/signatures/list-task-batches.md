# listTaskBatches

ListTaskBatches — read-only

Required: `workspace_id`, `farm_id`

## Signature

```ts
listTaskBatches(input: ListTaskBatchesInput, options?: ReadonlyCallOptions): Promise<ListTaskBatchesOutput>
```

## Input

```ts
interface ListTaskBatchesInput {
  workspace_id: string;
  farm_id: string;
  /**
   * Page number (default: 1)
   */
  page?: number;
  /**
   * Number of items per page (default: 10, max: 10000)
   */
  pageSize?: number;
  /**
   * Filter by task name. Supports multiple values separated by comma. Task or event type dispatched to miners or agents. Execution types: `miner.system.reboot`, `miner.log.get`, `miner.light.update`, `miner.power_mode.update`, `miner.pool.update`, `miner.pool.lock`, `miner.firmware.update`, `agent.scan.create`, `agent.self.update`. Event types: `miner.asset.update`, `miner.asset.delete`, `miner.rack_location.update`.
   */
  task_name?: string;
}
```

## Output

```ts
interface ListTaskBatchesOutput {
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
     * Aggregate status of a task batch. `pending` = at least one task is still running; `succeed` = all tasks succeeded; `failed` = all tasks failed, timed out, or were cancelled; `partial_succeed` = finished with a mix of success and failure.
     */
    status: "pending" | "succeed" | "failed" | "partial_succeed";
    /**
     * Number of tasks in the batch
     */
    task_count: number;
    /**
     * Number of succeeded tasks
     */
    succeed_count: number;
    /**
     * Number of failed tasks
     */
    failed_count: number;
    /**
     * Task parameters (JSON). Structure varies by task_name.
     */
    task_params: Record<string, unknown> | null;
    /**
     * Automation trigger context. Keys: trigger ({predicateField, predicateValue}), automation ({id, name}), filterSummary ({total, passed, skippedNonNormal?, skippedAnomaly?, skippedTemperature?}). Null for manually created batches.
     */
    metadata?: Record<string, unknown> | null;
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
   * Pagination metadata
   */
  pagination: {
    /**
     * Total number of items
     */
    total: number;
    /**
     * Maximum number of items per page
     */
    limit: number;
    /**
     * Number of items to skip
     */
    offset: number;
    /**
     * Whether there are more items after this page
     */
    hasNext: boolean;
    /**
     * Whether there are items before this page
     */
    hasPrevious: boolean;
  };
  /**
   * Error object (null on success)
   */
  error: null;
}
```
