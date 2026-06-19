# searchTaskBatches

SearchTaskBatches — read-only

Required: `workspace_id`, `farm_id`

## Signature

```ts
searchTaskBatches(input: SearchTaskBatchesInput, options?: ReadonlyCallOptions): Promise<SearchTaskBatchesOutput>
```

## Input

```ts
export interface SearchTaskBatchesInput {
  workspace_id: string
  farm_id: string
  /**
   * Enum or ID filter operators. Provide at least one operator.
   */
  status?: {
    /**
     * Aggregate status of a task batch. `pending` = at least one task is still running; `succeed` = all tasks succeeded; `failed` = all tasks failed, timed out, or were cancelled; `partial_succeed` = finished with a mix of success and failure.
     */
    eq?: "pending" | "succeed" | "failed" | "partial_succeed"
    in?: ("pending" | "succeed" | "failed" | "partial_succeed")[]
  }
  /**
   * Enum or ID filter operators. Provide at least one operator.
   */
  task_name?: {
    /**
     * Task or event type dispatched to miners or agents. Execution types: `miner.system.reboot`, `miner.log.get`, `miner.light.update`, `miner.power_mode.update`, `miner.pool.update`, `miner.pool.lock`, `miner.firmware.update`, `agent.scan.create`, `agent.ip_diagnosis.create`, `agent.self.update`. Event types: `miner.asset.update`, `miner.asset.delete`, `miner.rack_location.update`.
     */
    eq?:
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
    in?: (
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
    )[]
  }
  /**
   * Actor type filter. Only `eq` operator supported; multi-type filtering is not available.
   */
  actor_type?: {
    /**
     * Actor type used to filter task batches by creator. `user` = batches created by human users through the Nonce app; `automation` = batches created by the Automation workflow system; `api` = batches created via private-api or connect-api tokens.
     */
    eq?: "user" | "automation" | "api"
  }
  /**
   * Date filter operators using ISO 8601 UTC strings. Provide at least one operator.
   */
  created_at?: {
    eq?: string
    gt?: string
    gte?: string
    lt?: string
    lte?: string
  }
  page?: number
  limit?: number
}
```

## Output

```ts
/**
 * Represents an entity that performs actions in the system (user, API key, or system)
 */
export type SearchTaskBatchesOutputActor = {
  [k: string]: unknown
} | null

export interface SearchTaskBatchesOutput {
  /**
   * Indicates if the request was successful
   */
  success: boolean
  /**
   * Array of items
   */
  data: SearchTaskBatchesOutputTaskBatchSummary[]
  /**
   * Pagination metadata
   */
  pagination: {
    /**
     * Total number of items
     */
    total: number
    /**
     * Maximum number of items per page
     */
    limit: number
    /**
     * Number of items to skip
     */
    offset: number
    /**
     * Whether there are more items after this page
     */
    hasNext: boolean
    /**
     * Whether there are items before this page
     */
    hasPrevious: boolean
  }
  /**
   * Error object (null on success)
   */
  error: null
}
export interface SearchTaskBatchesOutputTaskBatchSummary {
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
   * Number of tasks in the batch
   */
  task_count: number
  /**
   * Number of succeeded tasks
   */
  succeed_count: number
  /**
   * Number of failed tasks
   */
  failed_count: number
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
  created_by: SearchTaskBatchesOutputActor
  /**
   * This is a timestamp in ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ.
   */
  created_at: string
}
```
