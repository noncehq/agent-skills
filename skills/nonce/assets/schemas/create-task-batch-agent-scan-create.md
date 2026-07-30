# createTaskBatchAgentScanCreate

CreateTaskBatch_AgentScanCreate — destructive

Required: `workspace_id`, `farm_id`, `task_name`

## Purpose

Trigger agent network scan to discover miners. Long-running; populates miner inventory on completion.

## Code

```js
const result = await nonce.createTaskBatchAgentScanCreate(input, {
  confirmDestructive: true,
  confirmation: "<confirmed target and effect>",
})
```

## CLI

```bash
"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/nonce.mjs" call createTaskBatchAgentScanCreate --input-file ".nonce/requests/create-task-batch-agent-scan-create.json" --allow-destructive --confirmation "<confirmed target and effect>"
```

## Input

```ts
export interface CreateTaskBatchAgentScanCreateInput {
  workspace_id: string
  farm_id: string
  /**
   * Trigger agent network scan to discover miners. Long-running; populates miner inventory on completion.
   */
  task_name: "agent.scan.create"
  /**
   * Agent scan parameters (optional).
   */
  params?: {
    /**
     * IP ranges to scan (optional). If omitted, agent scans all configured ranges.
     */
    ip_ranges?: {
      /**
       * IP range record ID
       */
      id: string
      /**
       * IP range in CIDR notation
       */
      range: string
      /**
       * Whether to continue scanning this range periodically (optional)
       */
      auto_scan?: boolean
    }[]
  }
}
```

## Output

```ts
/**
 * Represents an entity that performs actions in the system (user, API key, or system)
 */
export type Actor = {
  [k: string]: unknown
} | null

export interface CreateTaskBatchAgentScanCreateOutput {
  /**
   * Indicates if the request was successful
   */
  success: boolean
  /**
   * Array of items
   */
  data: MinerTaskBatch[]
  /**
   * Error object (null on success)
   */
  error: null
  meta?: CreateTaskBatchMeta
}
export interface MinerTaskBatch {
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
    | "miner.tags.update"
    | "miner.record.delete"
    | "miner.rack_location.update"
  /**
   * Number of tasks in the batch
   */
  task_count: number
  /**
   * Task parameters (JSON). Structure varies by task_name.
   */
  task_params: {
    [k: string]: unknown
  } | null
  created_by: Actor
  /**
   * This is a timestamp in ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ.
   */
  created_at: string
}
export interface CreateTaskBatchMeta {
  summary: {
    created_count: number
    skipped_count: number
  }
  skipped?: {
    /**
     * Reason a miner was skipped during task batch creation. `no_change` = miner is already in the requested state; `unsupported_mode` = miner hardware does not support the requested mode; `miner_not_found` = miner id was not found in the workspace or farm; `unstable_miner` = miner row is flagged unstable and cannot accept actions.
     */
    reason: "no_change" | "unsupported_mode" | "miner_not_found" | "unstable_miner"
    message: string
    miner_ids: string[]
  }[]
}
```
