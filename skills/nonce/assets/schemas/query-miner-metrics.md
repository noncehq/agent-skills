# QueryMinerMetrics

queryMinerMetrics — read-only

Required: `workspace_id`, `farm_id`, `miner_id`, `from`, `to`

## Purpose

Query Miner Metrics

Query time-bucketed performance metrics for a single miner.

## Code

```js
const result = await nonce.queryMinerMetrics(input)
```

## CLI

```bash
"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/nonce.mjs" call queryMinerMetrics --input-file ".nonce/requests/query-miner-metrics.json"
```

## Input

```ts
export interface QueryMinerMetricsInput {
  workspace_id: string
  farm_id: string
  miner_id: string
  /**
   * Inclusive start of the query range in ISO 8601 format
   */
  from: string
  /**
   * Exclusive end of the query range in ISO 8601 format
   */
  to: string
  /**
   * Time resolution of the returned metric snapshots. Range limits: 1 day for 10min, 7 days for hour, 90 days for day, 365 days for week. All buckets in the range are always present; buckets without data contain null metric values.
   */
  granularity?: "10min" | "hour" | "day" | "week"
}
```

## Output

```ts
export interface QueryMinerMetricsOutput {
  success: true
  data: {
    /**
     * Miner ID
     */
    miner_id: string
    /**
     * Inclusive start of the query range
     */
    from: string
    /**
     * Exclusive end of the query range
     */
    to: string
    granularity: "10min" | "hour" | "day" | "week"
    snapshots: {
      /**
       * Start of the metric bucket
       */
      period: string
      /**
       * Average hashrate in H/s
       */
      hashrate: number | null
      /**
       * Average power consumption in watts
       */
      wattage: number | null
      /**
       * Average temperature in Celsius
       */
      temp: number | null
      /**
       * Average uptime in seconds
       */
      uptime: number | null
      /**
       * Average uptime ratio
       */
      uptime_ratio: number | null
      /**
       * Last valid mining mode in the bucket
       */
      mining_mode: string | null
      /**
       * Combined anomaly bitmask in the bucket
       */
      anomaly_flags: number | null
    }[]
  }
  error: null
}
```
