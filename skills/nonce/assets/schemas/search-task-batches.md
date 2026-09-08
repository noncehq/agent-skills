# SearchTaskBatches

searchTaskBatches — read-only

Required: `workspace_id`, `farm_id`

## Purpose

Search Task Batches

## Code

```js
const result = await nonce.searchTaskBatches(input)
```

## CLI

```bash
"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/nonce.mjs" call searchTaskBatches --input-file ".nonce/requests/search-task-batches.json"
```

## Input

```ts
export interface SearchTaskBatchesInput {
  workspace_id: string
  farm_id: string
  /**
   * Aggregate batch status filter
   */
  status?: {
    /**
     * Aggregate status of a task batch. `pending` = at least one task is still running; `succeed` = all tasks succeeded; `failed` = all tasks failed, timed out, or were cancelled; `partial_succeed` = finished with a mix of success and failure.
     */
    eq?: "pending" | "succeed" | "failed" | "partial_succeed"
    in?: ("pending" | "succeed" | "failed" | "partial_succeed")[]
  }
  /**
   * Task name filter
   */
  task_name?: {
    /**
     * Task or event type dispatched to miners or agents. Execution types: `miner.system.reboot`, `miner.log.get`, `miner.light.update`, `miner.power_mode.update`, `miner.pool.update`, `miner.pool.lock`, `miner.firmware.update`, `agent.scan.create`, `agent.ip_diagnosis.create`, `agent.self.update`. Event types: `miner.tags.update`, `miner.record.delete`, `miner.rack_location.update`.
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
      | "miner.tags.update"
      | "miner.record.delete"
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
      | "miner.tags.update"
      | "miner.record.delete"
      | "miner.rack_location.update"
    )[]
  }
  /**
   * Creator type filter
   */
  actor_type?: {
    /**
     * Actor type used to filter task batches by creator. `user` = batches created by human users through the Nonce app; `automation` = batches created by the Automation workflow system; `api` = batches created via private-api tokens.
     */
    eq: "user" | "automation" | "api"
  }
  /**
   * Exclusive creation time bounds
   */
  created_at?: {
    gt?: string
    lt?: string
  }
  page?: number
  page_size?: number
}
```

## Output

```ts
export interface SearchTaskBatchesOutput {
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
  }[]
  pagination: {
    total: number
    page: number
    page_size: number
    total_pages: number
  }
  error: null
}
```
