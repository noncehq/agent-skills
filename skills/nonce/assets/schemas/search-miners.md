# searchMiners

SearchMiners — read-only

Required: `workspace_id`, `farm_id`

## Purpose

Search Miners

Search miners in the farm with operator-object filters. Supports id, agent_id, serial number, MAC address, lifecycle status, and health status criteria. Omit body for an unfiltered first-page list.

## Signature

```ts
searchMiners(input: SearchMinersInput, options?: ReadonlyCallOptions): Promise<SearchMinersOutput>
```

## Input

```ts
export interface SearchMinersInput {
  workspace_id: string
  farm_id: string
  /**
   * Miner ID filter. Supports exact match (`eq`) or set membership (`in`).
   */
  id?: {
    eq?: string
    ne?: string
    in?: string[]
    nin?: string[]
  }
  /**
   * String filter operators. Provide at least one operator.
   */
  agent_id?: {
    eq?: string
    contains?: string
  }
  /**
   * String filter operators. Provide at least one operator.
   */
  sn?: {
    eq?: string
    contains?: string
  }
  /**
   * String filter operators. Provide at least one operator.
   */
  mac?: {
    eq?: string
    contains?: string
  }
  /**
   * Run status filter. Accepted values: `online`, `stale`.
   */
  status?: {
    eq?: string
    ne?: string
    in?: string[]
    nin?: string[]
  }
  /**
   * Tag filter (operator-managed labels). Overlap match. Preset values: `maintenance`, `retired`, `off_rack`, `transit`, `archived`, plus free-form custom tags.
   */
  tags?: {
    eq?: string
    ne?: string
    in?: string[]
    nin?: string[]
  }
  /**
   * Unstable filter. `true` returns only miners with non-null `unstable_reason`. Omit to include both stable and unstable miners.
   */
  unstable?: boolean
  /**
   * **Deprecated** — legacy combined filter. Use `status` and `tags` instead. Values are auto-routed to the matching axis. Note: run-state and tags are independent — filtering by a run-state value (e.g. `online`) does not exclude miners carrying tags. Will be removed in a future major version.
   */
  lifecycle_statuses?: {
    eq?: string
    ne?: string
    in?: string[]
    nin?: string[]
  }
  /**
   * **Deprecated** — accepted for backward compatibility but ignored at runtime. Use `anomaly_filters` (anomaly bitmask) or `hashrate_realization` (ratio range) instead.
   */
  health_statuses?: {
    eq?: string
    ne?: string
    in?: string[]
    nin?: string[]
  }
  /**
   * Filter miners by IPv4 ranges. A miner matches if its IP falls into any of the provided ranges. Each item accepts one of: single address `192.168.1.5`, CIDR `192.168.1.0/24`, or hyphen range `192.168.1.1-192.168.1.254`. At most 10 ranges per request.
   */
  ip_ranges?: string[]
  page?: number
  limit?: number
}
```

## Output

```ts
export interface SearchMinersOutput {
  /**
   * Indicates if the request was successful
   */
  success: boolean
  /**
   * Array of items
   */
  data: Miner[]
  /**
   * Pagination metadata
   */
  pagination: {
    /**
     * Total number of items
     */
    total: number
    /**
     * Maximum number of items per page
     */
    limit: number
    /**
     * Number of items to skip
     */
    offset: number
    /**
     * Whether there are more items after this page
     */
    hasNext: boolean
    /**
     * Whether there are items before this page
     */
    hasPrevious: boolean
  }
  /**
   * Error object (null on success)
   */
  error: null
}
export interface Miner {
  /**
   * Miner identifier
   */
  id: string
  /**
   * Farm this miner belongs to
   */
  farm_id: string
  /**
   * Workspace (tenant) identifier
   */
  workspace_id: string
  /**
   * Hardware serial number
   */
  serial_number: string | null
  /**
   * Manufacturer (e.g. Bitmain, MicroBT)
   */
  make: string
  /**
   * Hardware model (e.g. S19 Pro, M50S)
   */
  model: string | null
  /**
   * Current IP address
   */
  ip: string
  /**
   * MAC address
   */
  mac: string
  /**
   * Whether the miner is actively hashing
   */
  is_mining: boolean
  /**
   * Run status (system-managed). Values: online | stale.
   */
  status: string
  /**
   * Operator-managed labels (multi-value). Presets: maintenance | retired | off_rack | transit | archived, plus free-form custom tags. Empty when none.
   */
  tags?: string[]
  /**
   * Deprecated; always null. Operator labels moved to `tags`.
   */
  ops_status: string | null
  /**
   * Current power/performance mode
   */
  mining_mode: string
  /**
   * Real-time hashrate in H/s
   */
  hashrate: number | null
  /**
   * Expected hashrate in H/s
   */
  expected_hashrate: number | null
  /**
   * Real-time power consumption in watts
   */
  power: number | null
  /**
   * Average board temperature in celsius
   */
  temp: number | null
  /**
   * Energy efficiency in J/TH
   */
  efficiency: number | null
  /**
   * Bitmask of active anomalies. Bits: 0=fan, 1=power, 2=temperature, 3=hashboard, 4=network, 5=firmware, 6=unknown, 8=control_board, 9=pool.
   */
  anomaly_flags?: number
  /**
   * Uptime in seconds
   */
  uptime: number | null
  /**
   * Last heartbeat timestamp (ISO 8601)
   */
  last_updated_at: string | null
  /**
   * Total reboots aggregated from daily miner_metrics over the default 7-day window. Null when no metrics have been computed yet. >= 10 in 7 days is considered high-frequency.
   */
  reboot_count: number | null
  /**
   * Reboots where pre-reboot uptime was < 10 min (boot cycling), aggregated over the default 7-day window. Null when no metrics have been computed yet. High ratio (> 50% of reboot_count) suggests hardware fault.
   */
  low_uptime_reboot_count: number | null
}
```
