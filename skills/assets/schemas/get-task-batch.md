# getTaskBatch

GetTaskBatch — read-only

Required: `workspace_id`, `farm_id`, `batch_id`

## Signature

```ts
getTaskBatch(input: GetTaskBatchInput, options?: ReadonlyCallOptions): Promise<GetTaskBatchOutput>
```

## Input

```ts
export interface GetTaskBatchInput {
  workspace_id: string
  farm_id: string
  batch_id: string
}
```

## Output

```ts
export interface GetTaskBatchOutput {
  /**
   * Indicates if the request was successful
   */
  success: boolean
  data: {
    /**
     * Miner task batch ID
     */
    batch_id: string
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
      | "miner.rack_location.update"
    /**
     * Aggregate status of a task batch. `pending` = at least one task is still running; `succeed` = all tasks succeeded; `failed` = all tasks failed, timed out, or were cancelled; `partial_succeed` = finished with a mix of success and failure.
     */
    status: "pending" | "succeed" | "failed" | "partial_succeed"
    /**
     * Total number of tasks in the batch
     */
    task_count: number
    /**
     * Tasks enqueued but not yet picked up
     */
    created_count: number
    /**
     * Tasks accepted by agent, waiting in local queue
     */
    queuing_count: number
    /**
     * Tasks actively executing on the miner
     */
    pending_count: number
    /**
     * Tasks finished successfully
     */
    succeed_count: number
    /**
     * Tasks finished with an error
     */
    failed_count: number
    /**
     * Tasks that exceeded their execution deadline
     */
    timed_out_count: number
    /**
     * Tasks aborted before completion
     */
    cancelled_count: number
    /**
     * Task parameters (JSON). Structure varies by task_name.
     */
    task_params: {
      [k: string]: unknown
    } | null
    /**
     * Automation trigger context. Keys: trigger ({predicateField, predicateValue}), automation ({id, name}), filterSummary ({total, passed, skippedNonNormal?, skippedAnomaly?, skippedTemperature?}). Null for manually created batches.
     */
    metadata?: {
      [k: string]: unknown
    } | null
    /**
     * Represents an entity that performs actions in the system (user, API key, or system)
     */
    created_by: {
      [k: string]: unknown
    } | null
    /**
     * This is a timestamp in ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ.
     */
    created_at: string
  }
  /**
   * Error object (null on success)
   */
  error: null
}
```
