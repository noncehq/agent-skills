# ListMinerTasks

listMinerTasks — read-only

Required: `workspace_id`, `farm_id`, `miner_id`

## Purpose

List Miner Tasks

Return task execution history for a specific miner.

## Code

```js
const result = await nonce.listMinerTasks(input)
```

## CLI

```bash
"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/nonce.mjs" call listMinerTasks --input-file ".nonce/requests/list-miner-tasks.json"
```

## Input

```ts
export interface ListMinerTasksInput {
  workspace_id: string
  farm_id: string
  miner_id: string
  page?: number
  page_size?: number
  /**
   * Filter by task name
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
  /**
   * Filter by task status
   */
  status?: "created" | "queuing" | "pending" | "succeed" | "failed" | "timed_out" | "cancelled"
  /**
   * Start of time range (ISO 8601). Defaults to 30 days ago. Must be within the last 30 days.
   */
  from_time?: string
  /**
   * End of time range (ISO 8601). Defaults to now.
   */
  to_time?: string
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

export interface ListMinerTasksOutput {
  success: true
  data: MinerTask[]
  pagination: {
    total: number
    page: number
    page_size: number
    total_pages: number
  }
  error: null
}
/**
 * A task execution record for a single miner. Use task_name to filter by operation type. Available task names: miner.system.reboot (reboot the miner), miner.log.get (download miner logs), miner.light.update (toggle miner indicator light), miner.power_mode.update (change mining power mode), miner.pool.update (update mining pool configuration), miner.pool.lock (lock or unlock pool settings), miner.firmware.update (update miner firmware).
 */
export interface MinerTask {
  /**
   * Task ID
   */
  task_id: string
  /**
   * Task Batch ID, or null for tasks created before batch tracking
   */
  batch_id: string | null
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
   * Task execution status. `created` = enqueued but not yet picked up by an agent; `queuing` = accepted by the agent and waiting in its local queue; `pending` = actively executing on the miner; `succeed` = finished successfully; `failed` = finished with an error; `timed_out` = exceeded its execution deadline; `cancelled` = aborted before completion.
   */
  status: "created" | "queuing" | "pending" | "succeed" | "failed" | "timed_out" | "cancelled"
  /**
   * Task parameters
   */
  params: {
    [k: string]: unknown
  } | null
  /**
   * Error details if task failed
   */
  error: {
    [k: string]: unknown
  } | null
  /**
   * Task execution result
   */
  result: {
    [k: string]: unknown
  } | null
  created_by: Actor
  /**
   * Task creation time
   */
  created_at: string
  /**
   * Last update time
   */
  updated_at: string
}
```
