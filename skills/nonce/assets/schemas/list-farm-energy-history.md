# listFarmEnergyHistory

ListFarmEnergyHistory — read-only

Required: `workspace_id`, `farm_id`

## Purpose

List Farm Energy History

Returns daily energy history for a farm — electricity costs, power consumption, and margin metrics from three perspectives (theoretical, agent-reported, pool-reported). Each record also includes BTC/USD earnings for the period.

Use `start_time` and `end_time` query parameters to specify the date range (ISO 8601). Defaults to the last 7 days.

Requires FARM_READ permission on the target farm.

## Signature

```ts
listFarmEnergyHistory(input: ListFarmEnergyHistoryInput, options?: ReadonlyCallOptions): Promise<ListFarmEnergyHistoryOutput>
```

## Input

```ts
export interface ListFarmEnergyHistoryInput {
  workspace_id: string
  farm_id: string
  /**
   * End time (ISO 8601). Defaults to now.
   */
  end_time?: string
  /**
   * Start time (ISO 8601). Defaults to 7 days ago.
   */
  start_time?: string
}
```

## Output

```ts
export interface ListFarmEnergyHistoryOutput {
  /**
   * Indicates if the request was successful
   */
  success: boolean
  data: {
    energy_summary: {
      theo_power: number | null
      theoEfficiency: number | null
      theo_total_energy: number | null
      theo_total_electricity_cost: number | null
      theo_avg_margin: number | null
      agent_avg_hashrate: number | null
      agent_avg_power: number | null
      agent_total_energy: number | null
      agent_avg_efficiency: number | null
      agent_total_est_electricity_cost: number | null
      agent_avg_margin: number | null
      pool_avg_hashrate: number | null
      pool_avg_power: number | null
      pool_total_energy: number | null
      pool_total_est_electricity_cost: number | null
      pool_avg_margin: number | null
      total_earning_btc: number | null
      total_earning_usd: number | null
    }
    energy_metrics: {
      period: string
      theo_energy: number | null
      theo_electricity_cost: number | null
      theo_margin: number | null
      agent_hashrate: number | null
      agent_power: number | null
      agent_energy: number | null
      agent_efficiency: number | null
      agent_est_electricity_cost: number | null
      agent_margin: number | null
      pool_hashrate: number | null
      pool_power: number | null
      pool_energy: number | null
      pool_est_electricity_cost: number | null
      pool_margin: number | null
      earning_btc: number | null
      earning_usd: number | null
    }[]
    power_metrics: {
      period: string
      pool_power: number | null
      agent_power: number | null
    }[]
  }
  /**
   * Error object (null on success)
   */
  error: null
}
```
