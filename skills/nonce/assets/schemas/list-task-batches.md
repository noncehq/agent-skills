# listTaskBatches

ListTaskBatches — read-only

Required: `workspace_id`, `farm_id`

## Purpose

List Task Batches

## Code

```js
const result = await nonce.listTaskBatches(input)
```

## CLI

```bash
"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/nonce.mjs" call listTaskBatches --input-file ".nonce/requests/list-task-batches.json"
```

## Input

```ts
export interface ListTaskBatchesInput {
  workspace_id: string
  farm_id: string
  page?: number
  page_size?: number
  /**
   * Task name filter
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
    | "miner.tags.update"
    | "miner.record.delete"
    | "miner.rack_location.update"
}
```

## Output

```ts
/**
 * Represents an entity that performs actions in the system (user, API key, or system)
 */
export type Actor = {
  /**
   * The type of actor
   */
  type: "user" | "apikey" | "system"
  /**
   * The unique identifier of the actor
   */
  id: string
  /**
   * The display name of the actor
   */
  name: string | null
  /**
   * The avatar URL of the actor
   */
  avatar: string | null
  /**
   * Additional metadata about the actor
   */
  metadata?: {
    [k: string]: unknown
  }
} | null

export interface ListTaskBatchesOutput {
  success: true
  data: TaskBatchSummary[]
  pagination: {
    total: number
    page: number
    page_size: number
    total_pages: number
  }
  error: null
}
export interface TaskBatchSummary {
  /**
   * Task Batch ID
   */
  id: string
  /**
   * Task or event type dispatched to miners or agents. Execution types: `miner.system.reboot`, `miner.log.get`, `miner.light.update`, `miner.power_mode.update`, `miner.pool.update`, `miner.pool.lock`, `miner.firmware.update`, `agent.scan.create`, `agent.ip_diagnosis.create`, `agent.self.update`. Event types: `miner.tags.update`, `miner.record.delete`, `miner.rack_location.update`.
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
    | "miner.tags.update"
    | "miner.record.delete"
    | "miner.rack_location.update"
  /**
   * Aggregate status of a task batch. `pending` = at least one task is still running; `succeed` = all tasks succeeded; `failed` = all tasks failed, timed out, or were cancelled; `partial_succeed` = finished with a mix of success and failure.
   */
  status: "pending" | "succeed" | "failed" | "partial_succeed"
  /**
   * Total tasks in the batch
   */
  task_count: number
  /**
   * Tasks that succeeded
   */
  succeed_count: number
  /**
   * Tasks that failed, timed out, or were cancelled
   */
  unsuccessful_count: number
  /**
   * Batch parameters
   */
  task_params: {
    [k: string]: unknown
  } | null
  /**
   * Batch metadata
   */
  metadata: {
    [k: string]: unknown
  } | null
  created_by: Actor
  /**
   * Batch creation time
   */
  created_at: string
}
```
