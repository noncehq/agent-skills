# ListMinerRebootTasks

listMinerRebootTasks — read-only

Required: `workspace_id`, `farm_id`, `miner_id`

## Purpose

List Miner Reboot Tasks

List reboot task history for a miner. Equivalent to ListMinerTasks with task_name=miner.system.reboot.

## Code

```js
const result = await nonce.listMinerRebootTasks(input)
```

## CLI

```bash
"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/nonce.mjs" call listMinerRebootTasks --input-file ".nonce/requests/list-miner-reboot-tasks.json"
```

## Input

```ts
export interface ListMinerRebootTasksInput {
  workspace_id: string
  farm_id: string
  miner_id: string
  page?: number
  page_size?: number
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
export interface ListMinerRebootTasksOutput {
  success: true
  data: {
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
    /**
     * Represents an entity that performs actions in the system (user, API key, or system)
     */
    created_by: {
      [k: string]: unknown
    } | null
    /**
     * Task creation time
     */
    created_at: string
    /**
     * Last update time
     */
    updated_at: string
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
