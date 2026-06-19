# getMinerTasks

GetMinerTasks — read-only

Required: `workspace_id`, `farm_id`, `miner_id`

## Signature

```ts
getMinerTasks(input: GetMinerTasksInput, options?: ReadonlyCallOptions): Promise<GetMinerTasksOutput>
```

## Input

```ts
export interface GetMinerTasksInput {
  workspace_id: string
  farm_id: string
  miner_id: string
  /**
   * Page number (default: 1)
   */
  page?: number
  /**
   * Number of items per page (default: 10, max: 10000)
   */
  pageSize?: number
  /**
   * Miner task name
   */
  task_name?:
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
   * Task execution status. `created` = enqueued but not yet picked up by an agent; `queuing` = accepted by the agent and waiting in its local queue; `pending` = actively executing on the miner; `succeed` = finished successfully; `failed` = finished with an error; `timed_out` = exceeded its execution deadline; `cancelled` = aborted before completion.
   */
  status?: "created" | "queuing" | "pending" | "succeed" | "failed" | "timed_out" | "cancelled"
  /**
   * Start time for task history in ISO 8601 format with timezone offset. Must be within the last 7 days. Defaults to 7 days ago if not provided
   */
  from_time?: string
  /**
   * End time for task history in ISO 8601 format with timezone offset. Must be within the last 7 days. Defaults to now if not provided
   */
  to_time?: string
}
```

## Output

```ts
/**
 * Represents an entity that performs actions in the system (user, API key, or system)
 */
export type GetMinerTasksOutputActor = {
  [k: string]: unknown
} | null

export interface GetMinerTasksOutput {
  /**
   * Indicates if the request was successful
   */
  success: boolean
  /**
   * Array of items
   */
  data: GetMinerTasksOutputMinerTask[]
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
/**
 * A task execution record for a single miner
 */
export interface GetMinerTasksOutputMinerTask {
  /**
   * Miner task ID
   */
  task_id: string
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
   * Task execution status. `created` = enqueued but not yet picked up by an agent; `queuing` = accepted by the agent and waiting in its local queue; `pending` = actively executing on the miner; `succeed` = finished successfully; `failed` = finished with an error; `timed_out` = exceeded its execution deadline; `cancelled` = aborted before completion.
   */
  status: "created" | "queuing" | "pending" | "succeed" | "failed" | "timed_out" | "cancelled"
  /**
   * Task parameters (JSON)
   */
  params: {
    [k: string]: unknown
  } | null
  /**
   * Error details if task failed (JSON)
   */
  error: {
    [k: string]: unknown
  } | null
  /**
   * Task execution result (JSON)
   */
  result: {
    [k: string]: unknown
  } | null
  created_by: GetMinerTasksOutputActor
  /**
   * This is a timestamp in ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ.
   */
  created_at: string
  /**
   * This is a timestamp in ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ.
   */
  updated_at: string
}
```
