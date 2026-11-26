# QueryFarmMetrics

queryFarmMetrics — read-only

Required: `workspace_id`, `farm_id`, `from_time`, `to_time`

## Purpose

Query Farm Metrics

Query time-bucketed aggregate metrics for a farm.

## Code

```js
const result = await nonce.queryFarmMetrics(input)
```

## CLI

```bash
"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/nonce.mjs" call queryFarmMetrics --input-file ".nonce/requests/query-farm-metrics.json"
```

## Input

```ts
export interface QueryFarmMetricsInput {
  workspace_id: string
  farm_id: string
  /**
   * Inclusive start of the query range in ISO 8601 format
   */
  from_time: string
  /**
   * Exclusive end of the query range in ISO 8601 format
   */
  to_time: string
  /**
   * Time resolution of the returned metric snapshots. Range limits: 1 day for 10min, 7 days for hour, 90 days for day, 365 days for week. All buckets in the range are always present; buckets without data contain null metric values.
   */
  granularity?: "10min" | "hour" | "day" | "week"
}
```

## Output

```ts
export interface QueryFarmMetricsOutput {
  success: true
  data: FarmMetrics
  error: null
}
export interface FarmMetrics {
  /**
   * Farm ID
   */
  farm_id: string
  /**
   * Inclusive start of the query range
   */
  from_time: string
  /**
   * Exclusive end of the query range
   */
  to_time: string
  granularity: "10min" | "hour" | "day" | "week"
  snapshots: FarmMetricSnapshot[]
}
export interface FarmMetricSnapshot {
  /**
   * Start of the metric bucket
   */
  period: string
  /**
   * Data reported by mining pool APIs, as opposed to Agent-reported data
   */
  pool: {
    /**
     * Average pool hashrate in H/s
     */
    hashrate: number | null
    /**
     * Average online pool miner count
     */
    online_miners: number | null
    /**
     * Average offline pool miner count
     */
    offline_miners: number | null
  }
  agent: {
    /**
     * Average Agent-reported hashrate in H/s
     */
    hashrate: number | null
    /**
     * Average online Agent miner count
     */
    online_miners: number | null
    /**
     * Average offline Agent miner count
     */
    offline_miners: number | null
  }
  finance: {
    /**
     * BTC earned during the bucket
     */
    earning_btc: number | null
  }
  electricity: {
    /**
     * Agent-reported energy during the bucket in kWh
     */
    agent_energy: number | null
    /**
     * Agent energy cost during the bucket in USD
     */
    agent_electricity_cost: number | null
    /**
     * Energy during the bucket in kWh, estimated from pool-reported hashrate and theoretical efficiency
     */
    pool_energy: number | null
    /**
     * Cost of pool_energy during the bucket in USD
     */
    pool_electricity_cost: number | null
    /**
     * Theoretical energy during the bucket in kWh
     */
    theo_energy: number | null
    /**
     * Theoretical energy cost during the bucket in USD
     */
    theo_electricity_cost: number | null
  }
}
```
