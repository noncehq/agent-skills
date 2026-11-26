# QueryAutomationMetrics

queryAutomationMetrics — read-only

Required: `workspace_id`, `farm_id`, `automation_id`, `from_time`, `to_time`

## Purpose

Query Automation Metrics

Query execution counts per bucket for one automation. Batches are bucketed by creation time and tasks by completion time; only succeeded tasks are counted. Reboot automations also report recovered hashrate and estimated 24-hour revenue.

## Code

```js
const result = await nonce.queryAutomationMetrics(input)
```

## CLI

```bash
"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/nonce.mjs" call queryAutomationMetrics --input-file ".nonce/requests/query-automation-metrics.json"
```

## Input

```ts
export interface QueryAutomationMetricsInput {
  workspace_id: string
  farm_id: string
  /**
   * Automation ID
   */
  automation_id: string
  /**
   * Inclusive start of the query range in ISO 8601 format
   */
  from_time: string
  /**
   * Exclusive end of the query range in ISO 8601 format
   */
  to_time: string
  /**
   * Time resolution of the returned buckets. Range limits: 90 days for day, 365 days for week. All buckets in the range are present; buckets without executions report zero counts.
   */
  granularity?: "day" | "week"
}
```

## Output

```ts
export interface QueryAutomationMetricsOutput {
  success: true
  data: {
    /**
     * Automation ID
     */
    automation_id: string
    /**
     * Task type the automation dispatches
     */
    task_name: string
    /**
     * Inclusive start of the query range
     */
    from_time: string
    /**
     * Exclusive end of the query range
     */
    to_time: string
    granularity: "day" | "week"
    buckets: {
      /**
       * Start of the bucket
       */
      period: string
      /**
       * Task batches created in the bucket
       */
      batch_count: number
      /**
       * Tasks that succeeded in the bucket
       */
      task_count: number
      /**
       * Sum of per-task recovery for reboot automations. Null for other automation types. Zero when no succeeded task in the bucket has recovery data. A miner rebooted more than once in the bucket contributes each reboot separately.
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
      } | null
    }[]
  }
  error: null
}
```
