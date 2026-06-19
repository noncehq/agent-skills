# createTaskBatchMinerRackLocationUpdate

CreateTaskBatch_MinerRack_locationUpdate — destructive

Required: `workspace_id`, `farm_id`, `task_name`, `updates`

## Signature

```ts
createTaskBatchMinerRackLocationUpdate(input: CreateTaskBatchMinerRackLocationUpdateInput, options: DestructiveCallOptions): Promise<CreateTaskBatchMinerRackLocationUpdateOutput>
```

## Input

```ts
export interface CreateTaskBatchMinerRackLocationUpdateInput {
  workspace_id: string
  farm_id: string
  /**
   * Update miner rack / position metadata in inventory. Metadata-only; does not affect mining operation.
   */
  task_name: "miner.rack_location.update"
  /**
   * Per-miner rack location updates. Each entry updates one miner; unchanged miners are omitted from the array.
   */
  updates: {
    miner_id: string
    /**
     * Rack identifier (up to 50 chars). Null to clear.
     */
    rack: string | null
    /**
     * Slot position within the rack (non-negative integer). Null to clear.
     */
    position: number | null
  }[]
  params?: {
    [k: string]: unknown
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

export interface CreateTaskBatchMinerRackLocationUpdateOutput {
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
  meta: CreateTaskBatchMeta
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
    | "miner.asset.update"
    | "miner.asset.delete"
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
