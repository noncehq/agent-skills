# queryMinerMetrics

QueryMinerMetrics — read-only

Required: `workspace_id`, `farm_id`, `miner_id`

## Purpose

Query Miner Metrics

Query time-bucketed performance metrics for one miner. Range limits are 1 day for 10min, 7 days for hour, 90 days for day, and 365 days for week.

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
}
```

## Output

```ts
export interface QueryMinerMetricsOutput {
  success: true
  data: MinerMetrics
  error: null
}
export interface MinerMetrics {
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
  snapshots: MinerMetricSnapshot[]
}
export interface MinerMetricSnapshot {
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
}
```
