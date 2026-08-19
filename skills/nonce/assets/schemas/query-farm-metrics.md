# queryFarmMetrics

QueryFarmMetrics — read-only

Required: `workspace_id`, `farm_id`

## Purpose

Query Farm Metrics

Query farm metrics using raw performance data for 10min and hour buckets and daily metrics for day and week buckets. Range limits match Query Miner Metrics.

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
  from: string
  /**
   * Exclusive end of the query range
   */
  to: string
  granularity: "10min" | "hour" | "day" | "week"
  snapshots: FarmMetricSnapshot[]
}
export interface FarmMetricSnapshot {
  /**
   * Start of the metric bucket
   */
  period: string
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
     * Estimated pool energy during the bucket in kWh
     */
    pool_energy: number | null
    /**
     * Estimated pool energy cost during the bucket in USD
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
