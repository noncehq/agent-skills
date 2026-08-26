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
export interface SearchMinersInput {
  workspace_id: string
  farm_id: string
  /**
   * Filter by system-managed miner reporting status
   */
  status?: {
    /**
     * System-managed miner reporting status
     */
    eq?: "online" | "stale"
    /**
     * System-managed miner reporting status
     */
    ne?: "online" | "stale"
    in?: ("online" | "stale")[]
    nin?: ("online" | "stale")[]
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
   * Filter by exact raw mining mode values
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
  /**
   * Structured miner search: either a global keyword or a field-specific match
   */
  search?:
    | {
        /**
         * Field available for structured miner keyword search
         */
        field:
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
         * Value to match
         */
        value: string
      }
    | {
        /**
         * Keyword to match across all searchable fields
         */
        value: string
      }
  /**
   * Ordered miner sort clauses
   */
  sort?: {
    /**
     * API sort field
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
  }[]
  /**
   * Hashrate range in H/s
   */
  hashrate?: {
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
  power?: {
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
  temperature?: {
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
  efficiency?: {
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
  runtime?: {
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
   * Hashrate realization ratio range, where 0.8 means 80%
   */
  hashrate_realization?: {
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
  last_updated_at?: {
    /**
     * Exclusive lower bound
     */
    gt?: string
    /**
     * Exclusive upper bound
     */
    lt?: string
  }
  /**
   * Exact rack identifier
   */
  rack?: string
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
    )[]
  }
  page?: number
  page_size?: number
}
```

## Output

```ts
export interface SearchMinersOutput {
  success: true
  data: {
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
    /**
     * System-managed miner reporting status
     */
    status: "online" | "stale"
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
