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
   * Primary pool worker name
   */
  worker_name: string | null
  /**
   * Rack identifier
   */
  rack: string | null
  /**
   * Position within the rack
   */
  position: number | null
  /**
   * Whether the miner is actively hashing
   */
  is_mining: boolean
  status: MinerRunStatus
  /**
   * Operator-managed labels
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
   * Expected hashrate in H/s
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
}
```
