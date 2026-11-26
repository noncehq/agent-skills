# SearchMiners

searchMiners — read-only

Required: `workspace_id`, `farm_id`

## Purpose

Search Miners

Search miners in the farm with structured filters.

## Code

```js
const result = await nonce.searchMiners(input)
```

## CLI

```bash
"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/nonce.mjs" call searchMiners --input-file ".nonce/requests/search-miners.json"
```

## Input

```ts
/**
 * System-managed miner reporting status
 */
export type MinerRunStatus = "online" | "stale"
/**
 * System-managed miner reporting status
 */
export type MinerRunStatus1 = "online" | "stale"
/**
 * System-managed miner reporting status
 */
export type MinerRunStatus2 = "online" | "stale"
/**
 * System-managed miner reporting status
 */
export type MinerRunStatus3 = "online" | "stale"
/**
 * Structured miner search: either a global keyword or a field-specific match
 */
export type MinerSearch = MinerFieldSearch | MinerGlobalSearch
/**
 * Field available for structured miner keyword search
 */
export type MinerSearchField =
  | "ip"
  | "mac"
  | "serial_number"
  | "hostname"
  | "model"
  | "fw_ver"
  | "firmware"
  | "mining_mode"
  | "rack"
  | "worker_name"
  | "tags"
/**
 * Ordered miner sort clauses
 */
export type MinerSortList = MinerSort[]

export interface SearchMinersInput {
  workspace_id: string
  farm_id: string
  /**
   * Filter by system-managed miner reporting status
   */
  status?: {
    eq?: MinerRunStatus
    ne?: MinerRunStatus1
    in?: MinerRunStatus2[]
    nin?: MinerRunStatus3[]
  }
  /**
   * Filter by exact operator-managed miner tags
   */
  tags?: {
    eq?: string
    ne?: string
    in?: string[]
    nin?: string[]
  }
  /**
   * Filter by exact raw mining mode values. `normal` also matches miners that have not reported a mode.
   */
  mining_mode?: {
    eq?: string
    ne?: string
    in?: string[]
    nin?: string[]
  }
  /**
   * Filter by network mode. `unknown` matches miners whose firmware does not report a mode or that have not been collected yet.
   */
  network_mode?: {
    eq?: "dhcp" | "static" | "unknown"
    ne?: "dhcp" | "static" | "unknown"
    in?: ("dhcp" | "static" | "unknown")[]
    nin?: ("dhcp" | "static" | "unknown")[]
  }
  search?: MinerSearch
  sort?: MinerSortList
  hashrate?: NonnegativeNumericRange
  power?: NonnegativeNumericRange1
  temperature?: NumericRange
  efficiency?: NonnegativeNumericRange2
  runtime?: NonnegativeNumericRange3
  hashrate_realization?: NonnegativeNumericRange4
  last_updated_at?: DateRange
  /**
   * Exact rack name; null selects miners without a rack
   */
  rack?: string | null
  ip_ranges?: string[]
  /**
   * Filter by anomaly type. Uses bitmask matching against the anomaly_flags field.
   */
  anomaly_flags?: {
    eq?:
      | "fan"
      | "power"
      | "temperature"
      | "hashboard"
      | "network"
      | "firmware"
      | "unknown"
      | "control_board"
      | "pool"
      | "low_hashrate"
      | "zero_hashrate"
      | "ineffective_reboot"
    ne?:
      | "fan"
      | "power"
      | "temperature"
      | "hashboard"
      | "network"
      | "firmware"
      | "unknown"
      | "control_board"
      | "pool"
      | "low_hashrate"
      | "zero_hashrate"
      | "ineffective_reboot"
    in?: (
      | "fan"
      | "power"
      | "temperature"
      | "hashboard"
      | "network"
      | "firmware"
      | "unknown"
      | "control_board"
      | "pool"
      | "low_hashrate"
      | "zero_hashrate"
      | "ineffective_reboot"
    )[]
    nin?: (
      | "fan"
      | "power"
      | "temperature"
      | "hashboard"
      | "network"
      | "firmware"
      | "unknown"
      | "control_board"
      | "pool"
      | "low_hashrate"
      | "zero_hashrate"
      | "ineffective_reboot"
    )[]
  }
  /**
   * Filter by the pool receiving hashrate, which is the pool connection with the latest last_share_at. Known pools are named (antpool, f2pool, spiderpool, viabtc); others use the URL host. Miners without any share match no pool condition.
   */
  pool?: {
    eq?: string
    ne?: string
    in?: string[]
    nin?: string[]
  }
  /**
   * Filter by the account of the pool receiving hashrate: the worker name before the first `.`, or the whole worker name without `.`. Miners without any share match no account condition.
   */
  account?: {
    eq?: string
    ne?: string
    in?: string[]
    nin?: string[]
  }
  page?: number
  page_size?: number
}
/**
 * Structured search against one miner field
 */
export interface MinerFieldSearch {
  field: MinerSearchField
  /**
   * Value to match
   */
  value: string
}
/**
 * Keyword search across all searchable miner fields
 */
export interface MinerGlobalSearch {
  /**
   * Keyword to match across all searchable fields
   */
  value: string
}
/**
 * One ordered miner sort clause
 */
export interface MinerSort {
  /**
   * API sort field. rack and rack_location sort by rack name; within a sequential or dynamic rack the order does not follow the slots.
   */
  field:
    | "id"
    | "created_at"
    | "is_mining"
    | "hashrate"
    | "performance"
    | "wattage"
    | "temperature_avg"
    | "efficiency"
    | "uptime"
    | "runtime"
    | "serial_number"
    | "model"
    | "ip"
    | "last_updated_at"
    | "rack"
    | "rack_location"
  /**
   * Sort direction
   */
  direction: "asc" | "desc"
}
/**
 * Hashrate range in H/s
 */
export interface NonnegativeNumericRange {
  /**
   * Exclusive lower bound
   */
  gt?: number
  /**
   * Exclusive upper bound
   */
  lt?: number
}
/**
 * Power range in watts
 */
export interface NonnegativeNumericRange1 {
  /**
   * Exclusive lower bound
   */
  gt?: number
  /**
   * Exclusive upper bound
   */
  lt?: number
}
/**
 * Temperature range in celsius
 */
export interface NumericRange {
  /**
   * Exclusive lower bound
   */
  gt?: number
  /**
   * Exclusive upper bound
   */
  lt?: number
}
/**
 * Efficiency range in J/TH
 */
export interface NonnegativeNumericRange2 {
  /**
   * Exclusive lower bound
   */
  gt?: number
  /**
   * Exclusive upper bound
   */
  lt?: number
}
/**
 * Runtime range in seconds
 */
export interface NonnegativeNumericRange3 {
  /**
   * Exclusive lower bound
   */
  gt?: number
  /**
   * Exclusive upper bound
   */
  lt?: number
}
/**
 * Hashrate realization ratio range: actual hashrate / theoretical hashrate from the linked miner specification. Bounds are strict; 0.8 means 80%. Excludes miners with missing, zero or negative theoretical hashrate or missing actual hashrate; actual zero remains 0%. Never uses expected_hashrate
 */
export interface NonnegativeNumericRange4 {
  /**
   * Exclusive lower bound
   */
  gt?: number
  /**
   * Exclusive upper bound
   */
  lt?: number
}
/**
 * Last report timestamp range
 */
export interface DateRange {
  /**
   * Exclusive lower bound
   */
  gt?: string
  /**
   * Exclusive upper bound
   */
  lt?: string
}
```

## Output

```ts
/**
 * System-managed miner reporting status
 */
export type MinerRunStatus = "online" | "stale"

export interface SearchMinersOutput {
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
