# GetTaskBatch

getTaskBatch — read-only

Required: `workspace_id`, `farm_id`, `task_batch_id`

## Purpose

Get Task Batch

## Code

```js
const result = await nonce.getTaskBatch(input)
```

## CLI

```bash
"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/nonce.mjs" call getTaskBatch --input-file ".nonce/requests/get-task-batch.json"
```

## Input

```ts
export interface GetTaskBatchInput {
  workspace_id: string
  farm_id: string
  /**
   * Task Batch ID
   */
  task_batch_id: string
}
```

## Output

```ts
export interface GetTaskBatchOutput {
  success: true
  data: {
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
    /**
     * Represents an entity that performs actions in the system (user, API key, or system)
     */
    created_by: {
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
    /**
     * Batch creation time
     */
    created_at: string
    /**
     * Tasks waiting for an agent
     */
    created_count: number
    /**
     * Tasks waiting in an agent queue
     */
    queuing_count: number
    /**
     * Tasks currently executing
     */
    pending_count: number
    /**
     * Tasks that failed
     */
    failed_count: number
    /**
     * Tasks that timed out
     */
    timed_out_count: number
    /**
     * Tasks that were cancelled
     */
    cancelled_count: number
  }
  error: null
}
```
