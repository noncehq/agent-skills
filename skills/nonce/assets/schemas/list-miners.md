# ListMiners

listMiners — read-only

Required: `workspace_id`, `farm_id`

## Purpose

List Miners

List miners in the farm.

## Code

```js
const result = await nonce.listMiners(input)
```

## CLI

```bash
"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/nonce.mjs" call listMiners --input-file ".nonce/requests/list-miners.json"
```

## Input

```ts
export interface ListMinersInput {
  workspace_id: string
  farm_id: string
  page?: number
  page_size?: number
}
```

## Output

```ts
/**
 * System-managed miner reporting status
 */
export type MinerRunStatus = "online" | "stale"

export interface ListMinersOutput {
  success: true
  data: MinerSummary[]
  pagination: {
    total: number
    page: number
    page_size: number
    total_pages: number
  }
  error: null
}
export interface MinerSummary {
  /**
   * Miner ID
   */
  id: string
  /**
   * Owning workspace ID
   */
  workspace_id: string
  /**
   * Owning farm ID
   */
  farm_id: string
  /**
   * Hardware serial number
   */
  serial_number: string | null
  /**
   * Manufacturer
   */
  make: string
  /**
   * Hardware model
   */
  model: string | null
  /**
   * Current IP address
   */
  ip: string
  /**
   * MAC address
   */
  mac: string | null
  /**
   * Worker name of the first pool connection, which is not necessarily the pool receiving hashrate
   */
  worker_name: string | null
  /**
   * Rack identifier
   */
  rack: string | null
  /**
   * Deprecated: use `rack_row` and `rack_column`. Returns the stored slot value unchanged.
   */
  position: number | null
  /**
   * Rack row, from 1 at the top
   */
  rack_row: number | null
  /**
   * Rack column, from 1 at the left
   */
  rack_column: number | null
  /**
   * Whether the miner is actively hashing
   */
  is_mining: boolean
  status: MinerRunStatus
  /**
   * Miner labels
   */
  tags: string[]
  /**
   * Current power or performance mode
   */
  mining_mode: string
  /**
   * Current third-party mode preset
   */
  mining_mode_preset: string | null
  /**
   * Current hashrate in H/s
   */
  hashrate: number | null
  /**
   * Device-reported expected hashrate in H/s, retained as observation data only; not the product baseline or a substitute for missing theoretical hashrate. Historical values may include legacy specification backfill.
   */
  expected_hashrate: number | null
  /**
   * Current power consumption in watts
   */
  power: number | null
  /**
   * Average board temperature in Celsius
   */
  temperature: number | null
  /**
   * Energy efficiency in J/TH
   */
  efficiency: number | null
  /**
   * Current anomaly bitmask
   */
  anomaly_flags: number
  /**
   * Uptime in seconds
   */
  uptime: number
  /**
   * Last heartbeat time
   */
  last_updated_at: string | null
  /**
   * Mining pool connections reported by the miner
   */
  pools: MinerPool[]
}
export interface MinerPool {
  /**
   * Mining pool Stratum URL
   */
  url: string | null
  /**
   * Worker identity sent to the pool (Stratum user field)
   */
  worker_name: string | null
  /**
   * Whether the miner has a connection to this pool. Several pools can be connected at once; the pool receiving hashrate is the one with the latest last_share_at.
   */
  active: boolean | null
  /**
   * Number of accepted shares
   */
  accepted_shares: number | null
  /**
   * Number of rejected shares
   */
  rejected_shares: number | null
  /**
   * Share rejection rate (percentage)
   */
  rejected_percent: number | null
  /**
   * Share stale rate (percentage)
   */
  stale_percent: number | null
  /**
   * Time of the last accepted share
   */
  last_share_at: string | null
  /**
   * Cumulative accepted share difficulty
   */
  accepted_difficulty: number | null
  /**
   * Cumulative rejected share difficulty
   */
  rejected_difficulty: number | null
  /**
   * Cumulative stale share difficulty
   */
  stale_difficulty: number | null
}
```
