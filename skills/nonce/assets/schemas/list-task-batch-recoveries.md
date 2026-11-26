# ListTaskBatchRecoveries

listTaskBatchRecoveries — read-only

Required: `workspace_id`, `farm_id`, `task_batch_id`

## Purpose

List Task Batch Recoveries

List succeeded tasks in one task batch with their linked reboot snapshots and recovery. Recovery is null when the task has no linked reboot event or hashprice data.

## Code

```js
const result = await nonce.listTaskBatchRecoveries(input)
```

## CLI

```bash
"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/nonce.mjs" call listTaskBatchRecoveries --input-file ".nonce/requests/list-task-batch-recoveries.json"
```

## Input

```ts
export interface ListTaskBatchRecoveriesInput {
  workspace_id: string
  farm_id: string
  /**
   * Task Batch ID
   */
  task_batch_id: string
  page?: number
  page_size?: number
}
```

## Output

```ts
export interface ListTaskBatchRecoveriesOutput {
  success: true
  data: {
    /**
     * Task ID
     */
    task_id: string
    /**
     * Miner ID
     */
    miner_id: string
    /**
     * Task completion time
     */
    done_at: string
    /**
     * Snapshot before the reboot
     */
    before: {
      /**
       * Average hashrate in H/s
       */
      avg_hashrate: number | null
    }
    /**
     * Snapshot after the reboot
     */
    after: {
      /**
       * Average hashrate in H/s
       */
      avg_hashrate: number | null
    }
    /**
     * Recovery for this task. Null when the task has no linked reboot event, a hashrate snapshot is missing, or no hashprice exists for the completion day.
     */
    recovery: {
      /**
       * Recovered hashrate in H/s, max(after average - before average, 0). Averages use T-30 to T-5 minutes before and T+15 to T+60 minutes after the reboot.
       */
      hashrate: number
      /**
       * Estimated 24-hour revenue in USD from the recovered hashrate at the hashprice of the task completion day. This is a projection, not realized income.
       */
      revenue_24h_usd: number
      /**
       * Hashprice in USD per PH/s per day on the completion day
       */
      hashprice_usd: number
    } | null
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
