# CreateLightUpdateTaskBatch

createLightUpdateTaskBatch — destructive

Required: `workspace_id`, `farm_id`

## Purpose

Create Light Update Task Batch

## Code

```js
const result = await nonce.createLightUpdateTaskBatch(input, {
  confirmDestructive: true,
  confirmation: "<confirmed target and effect>",
})
```

## CLI

```bash
"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/nonce.mjs" call createLightUpdateTaskBatch --input-file ".nonce/requests/create-light-update-task-batch.json" --allow-destructive --confirmation "<confirmed target and effect>"
```

## Input

```ts
export interface CreateLightUpdateTaskBatchInput {
  workspace_id: string
  farm_id: string
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

export interface CreateLightUpdateTaskBatchOutput {
  success: true
  data: CreateTaskBatchResult
  error: null
}
/**
 * Result of a task batch creation.
 */
export interface CreateTaskBatchResult {
  /**
   * Created task batches
   */
  batches: {
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
     * Tasks created in this batch
     */
    task_count: number
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
  }[]
  summary: {
    /**
     * Miners with tasks created
     */
    created_count: number
    /**
     * Miners skipped
     */
    skipped_count: number
    /**
     * Miners that failed to process
     */
    failed_count: number
  }
  /**
   * Skipped miners grouped by reason
   */
  skipped?: {
    /**
     * Reason a miner was skipped during task batch creation. `no_change` = miner is already in the requested state; `unsupported_mode` = miner hardware does not support the requested mode; `miner_not_found` = miner id was not found in the workspace or farm; `unstable_miner` = miner row is flagged unstable and cannot accept actions.
     */
    reason: "no_change" | "unsupported_mode" | "miner_not_found" | "unstable_miner"
    /**
     * Human-readable skip explanation
     */
    message: string
    /**
     * Affected miner IDs
     */
    miner_ids: string[]
  }[]
}
```
