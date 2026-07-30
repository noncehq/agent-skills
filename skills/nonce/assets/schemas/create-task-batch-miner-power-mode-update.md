# createTaskBatchMinerPowerModeUpdate

CreateTaskBatch_MinerPower_modeUpdate — destructive

Required: `workspace_id`, `farm_id`, `task_name`, `miner_ids`, `params`

## Purpose

Switch miner mining power mode. Affects hashrate and power consumption.

## Code

```js
const result = await nonce.createTaskBatchMinerPowerModeUpdate(input, {
  confirmDestructive: true,
  confirmation: "<confirmed target and effect>",
})
```

## CLI

```bash
"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/nonce.mjs" call createTaskBatchMinerPowerModeUpdate --input-file ".nonce/requests/create-task-batch-miner-power-mode-update.json" --allow-destructive --confirmation "<confirmed target and effect>"
```

## Input

```ts
export interface CreateTaskBatchMinerPowerModeUpdateInput {
  workspace_id: string
  farm_id: string
  /**
   * Switch miner mining power mode. Affects hashrate and power consumption.
   */
  task_name: "miner.power_mode.update"
  /**
   * Array of miner IDs to execute task on
   */
  miner_ids: string[]
  /**
   * Mining mode parameters.
   */
  params: {
    /**
     * Mining performance mode level or firmware preset name
     */
    mode:
      | (
          | "low"
          | "normal"
          | "high"
          | "sleep"
          | "J/T 19.0, Hashrate ~125TH/s"
          | "J/T 20.0, Hashrate ~135TH/s"
          | "J/T 21.0, Hashrate ~145TH/s"
          | "J/T 21.5, Hashrate ~155TH/s"
          | "J/T 22.0, Hashrate ~165TH/s"
          | "J/T 22.5, Hashrate ~170TH/s"
          | "J/T 23.0, Hashrate ~175TH/s"
          | "5600W"
          | "5800W"
          | "6000W"
          | "6200W"
          | "6400W"
          | "6600W"
        )
      | string
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

export interface CreateTaskBatchMinerPowerModeUpdateOutput {
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
