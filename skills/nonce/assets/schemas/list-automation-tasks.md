# ListAutomationTasks

listAutomationTasks — read-only

Required: `workspace_id`, `farm_id`, `automation_id`, `from_time`, `to_time`

## Purpose

List Automation Tasks

List succeeded tasks dispatched by one automation in the time range, newest first. Each task carries its linked reboot snapshots and recovery when available.

## Code

```js
const result = await nonce.listAutomationTasks(input)
```

## CLI

```bash
"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/nonce.mjs" call listAutomationTasks --input-file ".nonce/requests/list-automation-tasks.json"
```

## Input

```ts
export interface ListAutomationTasksInput {
  workspace_id: string
  farm_id: string
  /**
   * Automation ID
   */
  automation_id: string
  page?: number
  page_size?: number
  /**
   * Inclusive start of the query range in ISO 8601 format
   */
  from_time: string
  /**
   * Exclusive end of the query range in ISO 8601 format
   */
  to_time: string
}
```

## Output

```ts
export interface ListAutomationTasksOutput {
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
