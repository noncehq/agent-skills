/* eslint-disable */
// Generated file. Do not edit by hand.
// Source of truth: checked Nonce method definitions; supplemental schemas only fill missing metadata.

// Type reference for project code that imports scripts/client.mjs.

export interface ListWorkspacesInput {}
export interface ListWorkspacesOutput {
  success: true
  data: Workspace[]
  error: null
}
export interface Workspace {
  /**
   * Workspace ID
   */
  id: string
  /**
   * Workspace name
   */
  name: string
  /**
   * Workspace slug
   */
  slug: string
  relations: "member"[]
  /**
   * Effective Public API permissions
   */
  permissions: (
    | "workspace.read"
    | "workspace.manage"
    | "farm.read"
    | "farm.manage"
    | "miner.read"
    | "miner.manage"
    | "miner.high_risk_manage"
  )[]
}
export interface GetBitcoinMetricsInput {}
export interface GetBitcoinMetricsOutput {
  success: true
  data: BitcoinMetrics
  error: null
}
export interface BitcoinMetrics {
  /**
   * Current Bitcoin price in USD
   */
  bitcoin_price: number
  /**
   * Current hashprice in USD per PH/s per day
   */
  hashprice_usd: number
  /**
   * Current hashprice in BTC per PH/s per day
   */
  hashprice_btc: number
  /**
   * Current network hashrate in H/s
   */
  network_hashrate: number
  /**
   * Current network difficulty
   */
  network_difficulty: number
  /**
   * Data observation time
   */
  period: string
}
export interface QueryBitcoinMetricsInput {
  /**
   * Inclusive start of the query range in ISO 8601 format
   */
  from_time: string
  /**
   * Exclusive end of the query range in ISO 8601 format
   */
  to_time: string
  /**
   * Time resolution of the returned snapshots. Only day is supported.
   */
  granularity?: "day"
}
export interface QueryBitcoinMetricsOutput {
  success: true
  data: {
    /**
     * Inclusive start of the query range
     */
    from_time: string
    /**
     * Exclusive end of the query range
     */
    to_time: string
    granularity: "day"
    snapshots: {
      /**
       * Start of the time bucket for this data point
       */
      period: string
      /**
       * Bitcoin price in USD
       */
      bitcoin_price: number
      /**
       * Hashprice in USD per PH/s per day
       */
      hashprice_usd: number
      /**
       * Hashprice in BTC per PH/s per day
       */
      hashprice_btc: number
      /**
       * Network hashrate in H/s
       */
      network_hashrate: number
      /**
       * Network difficulty
       */
      network_difficulty: number
    }[]
  }
  error: null
}
export interface ListFarmsInput {
  workspace_id: string
  page?: number
  page_size?: number
}
export interface ListFarmsOutput {
  success: true
  data: Farm[]
  pagination: {
    total: number
    page: number
    page_size: number
    total_pages: number
  }
  error: null
}
export interface Farm {
  /**
   * Farm ID
   */
  id: string
  /**
   * Owning workspace ID
   */
  workspace_id: string
  /**
   * Farm name
   */
  name: string | null
  /**
   * Farm description
   */
  description: string | null
  /**
   * Farm location
   */
  location: string | null
  /**
   * Farm operational status
   */
  status:
    | "running"
    | "shutdown"
    | "curtailment"
    | "partial_curtailment"
    | "leasing"
    | "maintenance"
    | "decommissioning"
    | "decommissioned"
  /**
   * Whether the farm is archived
   */
  archived: boolean
  /**
   * Hosting fee in USD per kWh
   */
  hosting_fee: number | null
  /**
   * Creation time in ISO 8601 format
   */
  created_at: string | null
  /**
   * Last update time in ISO 8601 format
   */
  updated_at: string | null
}
export interface GetFarmInput {
  workspace_id: string
  farm_id: string
}
export interface GetFarmOutput {
  success: true
  data: {
    /**
     * Farm ID
     */
    id: string
    /**
     * Owning workspace ID
     */
    workspace_id: string
    /**
     * Farm name
     */
    name: string | null
    /**
     * Farm description
     */
    description: string | null
    /**
     * Farm location
     */
    location: string | null
    /**
     * Farm operational status
     */
    status:
      | "running"
      | "shutdown"
      | "curtailment"
      | "partial_curtailment"
      | "leasing"
      | "maintenance"
      | "decommissioning"
      | "decommissioned"
    /**
     * Whether the farm is archived
     */
    archived: boolean
    /**
     * Hosting fee in USD per kWh
     */
    hosting_fee: number | null
    /**
     * Creation time in ISO 8601 format
     */
    created_at: string | null
    /**
     * Last update time in ISO 8601 format
     */
    updated_at: string | null
  }
  error: null
}
export interface ListAgentsInput {
  workspace_id: string
  farm_id: string
  page?: number
  page_size?: number
}
export interface ListAgentsOutput {
  success: true
  data: AgentSummary[]
  pagination: {
    total: number
    page: number
    page_size: number
    total_pages: number
  }
  error: null
}
export interface AgentSummary {
  /**
   * Agent ID
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
   * Current Agent status
   */
  status: string | null
  /**
   * Installed Agent version
   */
  version: string | null
  /**
   * Agent uptime in seconds
   */
  uptime: number | null
  /**
   * Last online time
   */
  last_online_at: string | null
  /**
   * Last heartbeat time
   */
  last_updated_at: string | null
}
export interface GetAgentInput {
  workspace_id: string
  farm_id: string
  agent_id: string
}
export interface GetAgentOutput {
  success: true
  data: {
    /**
     * Agent ID
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
     * Current Agent status
     */
    status: string | null
    /**
     * Installed Agent version
     */
    version: string | null
    /**
     * Agent uptime in seconds
     */
    uptime: number | null
    /**
     * Last online time
     */
    last_online_at: string | null
    /**
     * Last heartbeat time
     */
    last_updated_at: string | null
    /**
     * Public Agent host identity
     */
    host: {
      /**
       * Host name reported by the Agent
       */
      hostname: string | null
      /**
       * Operating system family
       */
      platform: string | null
      /**
       * Operating system release description
       */
      os: string | null
      /**
       * Agent host IP address
       */
      ip: string | null
    } | null
  }
  error: null
}
export interface ListAutomationsInput {
  workspace_id: string
  farm_id: string
  page?: number
  page_size?: number
}
export interface ListAutomationsOutput {
  success: true
  data: {
    /**
     * Automation ID
     */
    id: string
    /**
     * Automation name
     */
    name: string
    /**
     * Task type the automation dispatches
     */
    task_name: string
    /**
     * Whether the automation is active
     */
    enabled: boolean
    /**
     * Creation time
     */
    created_at: string
    /**
     * Last update time
     */
    updated_at: string
  }[]
  pagination: {
    total: number
    page: number
    page_size: number
    total_pages: number
  }
  error: null
}
export interface QueryAutomationMetricsInput {
  workspace_id: string
  farm_id: string
  /**
   * Automation ID
   */
  automation_id: string
  /**
   * Inclusive start of the query range in ISO 8601 format
   */
  from_time: string
  /**
   * Exclusive end of the query range in ISO 8601 format
   */
  to_time: string
  /**
   * Time resolution of the returned buckets. Range limits: 90 days for day, 365 days for week. All buckets in the range are present; buckets without executions report zero counts.
   */
  granularity?: "day" | "week"
}
export interface QueryAutomationMetricsOutput {
  success: true
  data: {
    /**
     * Automation ID
     */
    automation_id: string
    /**
     * Task type the automation dispatches
     */
    task_name: string
    /**
     * Inclusive start of the query range
     */
    from_time: string
    /**
     * Exclusive end of the query range
     */
    to_time: string
    granularity: "day" | "week"
    buckets: {
      /**
       * Start of the bucket
       */
      period: string
      /**
       * Task batches created in the bucket
       */
      batch_count: number
      /**
       * Tasks that succeeded in the bucket
       */
      task_count: number
      /**
       * Sum of per-task recovery for reboot automations. Null for other automation types. Zero when no succeeded task in the bucket has recovery data. A miner rebooted more than once in the bucket contributes each reboot separately.
       */
      recovery: {
        /**
         * Recovered hashrate in H/s, max(after average - before average, 0). Averages use T-30 to T-5 minutes before and T+15 to T+60 minutes after the reboot.
         */
        hashrate: number
        /**
         * Estimated 24-hour revenue in USD from the recovered hashrate at the hashprice of the task completion day. This is a projection, not realized income.
         */
        revenue_24h_usd: number
      } | null
    }[]
  }
  error: null
}
export interface ListAutomationTasksInput {
  workspace_id: string
  farm_id: string
  /**
   * Automation ID
   */
  automation_id: string
  page?: number
  page_size?: number
  /**
   * Inclusive start of the query range in ISO 8601 format
   */
  from_time: string
  /**
   * Exclusive end of the query range in ISO 8601 format
   */
  to_time: string
}
export interface ListAutomationTasksOutput {
  success: true
  data: {
    /**
     * Task ID
     */
    task_id: string
    /**
     * Miner ID
     */
    miner_id: string
    /**
     * Task completion time
     */
    done_at: string
    /**
     * Snapshot before the reboot
     */
    before: {
      /**
       * Average hashrate in H/s
       */
      avg_hashrate: number | null
    }
    /**
     * Snapshot after the reboot
     */
    after: {
      /**
       * Average hashrate in H/s
       */
      avg_hashrate: number | null
    }
    /**
     * Recovery for this task. Null when the task has no linked reboot event, a hashrate snapshot is missing, or no hashprice exists for the completion day.
     */
    recovery: {
      /**
       * Recovered hashrate in H/s, max(after average - before average, 0). Averages use T-30 to T-5 minutes before and T+15 to T+60 minutes after the reboot.
       */
      hashrate: number
      /**
       * Estimated 24-hour revenue in USD from the recovered hashrate at the hashprice of the task completion day. This is a projection, not realized income.
       */
      revenue_24h_usd: number
      /**
       * Hashprice in USD per PH/s per day on the completion day
       */
      hashprice_usd: number
    } | null
  }[]
  pagination: {
    total: number
    page: number
    page_size: number
    total_pages: number
  }
  error: null
}
export interface ListMinersInput {
  workspace_id: string
  farm_id: string
  page?: number
  page_size?: number
}
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
export interface GetMinerInput {
  workspace_id: string
  farm_id: string
  miner_id: string
}
export interface GetMinerOutput {
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
     * Worker name of the first pool connection, which is not necessarily the pool receiving hashrate
     */
    worker_name: string | null
    /**
     * Rack identifier
     */
    rack: string | null
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
    /**
     * System-managed miner reporting status
     */
    status: "online" | "stale"
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
    pools: {
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
    }[]
    /**
     * Reporting Agent ID
     */
    agent_id: string
    /**
     * Miner hostname
     */
    hostname: string | null
    /**
     * Firmware name
     */
    firmware: string
    /**
     * Firmware version
     */
    firmware_version: string
    /**
     * Reported network configuration
     */
    network: {
      /**
       * How the address is assigned
       */
      mode: ("dhcp" | "static") | null
      /**
       * Address currently in use
       */
      ip: string | null
      /**
       * Subnet mask currently in use
       */
      netmask: string | null
      /**
       * Gateway in use. Null when the firmware does not report one, which is the case for Antminer derivatives on DHCP
       */
      gateway: string | null
      /**
       * DNS servers in use, as the miner reports them
       */
      dns: string | null
    } | null
    /**
     * Matched hardware submodel
     */
    submodel: string | null
    /**
     * Factory specification hashrate in H/s from the linked miner specification (miner_spec.theo_hashrate), including a linked model fallback specification. The sole product baseline; null when no specification hashrate is available. Never falls back to expected_hashrate.
     */
    theoretical_hashrate: number | null
    /**
     * Expected power consumption in watts
     */
    expected_power: number | null
    /**
     * Expected efficiency in J/TH
     */
    expected_efficiency: number | null
    /**
     * Configured power limit in watts
     */
    power_limit: number | null
    /**
     * Environment temperature in Celsius
     */
    environment_temperature: number | null
    /**
     * Average inlet temperature in Celsius
     */
    inlet_temperature: number | null
    /**
     * Average outlet temperature in Celsius
     */
    outlet_temperature: number | null
    /**
     * Reported chip count
     */
    total_chips: number | null
    /**
     * Expected chip count
     */
    expected_chips: number | null
    /**
     * Whether the last health check succeeded
     */
    last_check_succeed: boolean
    /**
     * Reason the miner identity is unstable
     */
    unstable_reason: string | null
    /**
     * Creation time
     */
    created_at: string | null
    /**
     * Last record update time
     */
    updated_at: string | null
  }
  error: null
}
export interface ListRacksInput {
  workspace_id: string
  farm_id: string
}
export interface ListRacksOutput {
  success: true
  data: {
    /**
     * Rack ID
     */
    id: string
    /**
     * Rack name
     */
    rack: string
    /**
     * Number of rows
     */
    rows: number
    /**
     * Number of columns
     */
    columns: number
    /**
     * How miners take slots: sequential places each miner by its IP from the lowest IP in the rack and keeps gaps, dynamic fills slots in IP order without gaps, manual keeps the slot saved on each miner
     */
    allocation: "sequential" | "dynamic" | "manual"
    /**
     * Lists candidate miners when the rack is edited; not used to place miners.
     */
    ip_range: string | null
    /**
     * Miners in the rack; equals searching miners with this rack
     */
    miner_count: number
  }[]
  error: null
}
export interface ListMinerRebootTasksInput {
  workspace_id: string
  farm_id: string
  miner_id: string
  page?: number
  page_size?: number
  /**
   * Filter by task status
   */
  status?: "created" | "queuing" | "pending" | "succeed" | "failed" | "timed_out" | "cancelled"
  /**
   * Start of time range (ISO 8601). Defaults to 30 days ago. Must be within the last 30 days.
   */
  from_time?: string
  /**
   * End of time range (ISO 8601). Defaults to now.
   */
  to_time?: string
}
export interface ListMinerRebootTasksOutput {
  success: true
  data: {
    /**
     * Task ID
     */
    task_id: string
    /**
     * Task Batch ID, or null for tasks created before batch tracking
     */
    batch_id: string | null
    /**
     * Task or event type dispatched to miners or agents. Execution types: `miner.system.reboot`, `miner.log.get`, `miner.light.update`, `miner.power_mode.update`, `miner.pool.update`, `miner.pool.lock`, `miner.firmware.update`, `agent.scan.create`, `agent.ip_diagnosis.create`, `agent.self.update`, `agent.pause`, `agent.resume`, `agent.ip_report.start`, `agent.ip_report.stop`, `agent.miner.refresh`. Event types: `miner.tags.update`, `miner.record.delete`, `miner.rack_location.update`. Other values may appear for task types added after this list.
     */
    task_name: string
    /**
     * Task execution status. `created` = enqueued but not yet picked up by an agent; `queuing` = accepted by the agent and waiting in its local queue; `pending` = actively executing on the miner; `succeed` = finished successfully; `failed` = finished with an error; `timed_out` = exceeded its execution deadline; `cancelled` = aborted before completion.
     */
    status: "created" | "queuing" | "pending" | "succeed" | "failed" | "timed_out" | "cancelled"
    /**
     * Task parameters
     */
    params: {
      [k: string]: unknown
    } | null
    /**
     * Error details if task failed
     */
    error: {
      [k: string]: unknown
    } | null
    /**
     * Task execution result
     */
    result: {
      [k: string]: unknown
    } | null
    /**
     * Represents an entity that performs actions in the system (user, API key, or system)
     */
    created_by: {
      /**
       * The type of actor
       */
      type: "user" | "apikey" | "system"
      /**
       * The unique identifier of the actor
       */
      id: string
      /**
       * The display name of the actor
       */
      name: string | null
      /**
       * The avatar URL of the actor
       */
      avatar: string | null
      /**
       * Additional metadata about the actor
       */
      metadata?: {
        [k: string]: unknown
      }
    } | null
    /**
     * Task creation time
     */
    created_at: string
    /**
     * Last update time
     */
    updated_at: string
  }[]
  pagination: {
    total: number
    page: number
    page_size: number
    total_pages: number
  }
  error: null
}
export interface ListMinerTasksInput {
  workspace_id: string
  farm_id: string
  miner_id: string
  page?: number
  page_size?: number
  /**
   * Filter by task name
   */
  task_name?:
    | "agent.scan.create"
    | "agent.ip_diagnosis.create"
    | "agent.self.update"
    | "agent.pause"
    | "agent.resume"
    | "agent.ip_report.start"
    | "agent.ip_report.stop"
    | "agent.miner.refresh"
    | "miner.system.reboot"
    | "miner.log.get"
    | "miner.light.update"
    | "miner.power_mode.update"
    | "miner.pool.update"
    | "miner.pool.lock"
    | "miner.firmware.update"
    | "miner.network.update"
    | "miner.tags.update"
    | "miner.record.delete"
    | "miner.rack_location.update"
  /**
   * Filter by task status
   */
  status?: "created" | "queuing" | "pending" | "succeed" | "failed" | "timed_out" | "cancelled"
  /**
   * Start of time range (ISO 8601). Defaults to 30 days ago. Must be within the last 30 days.
   */
  from_time?: string
  /**
   * End of time range (ISO 8601). Defaults to now.
   */
  to_time?: string
}
export interface ListMinerTasksOutput {
  success: true
  data: {
    /**
     * Task ID
     */
    task_id: string
    /**
     * Task Batch ID, or null for tasks created before batch tracking
     */
    batch_id: string | null
    /**
     * Task or event type dispatched to miners or agents. Execution types: `miner.system.reboot`, `miner.log.get`, `miner.light.update`, `miner.power_mode.update`, `miner.pool.update`, `miner.pool.lock`, `miner.firmware.update`, `agent.scan.create`, `agent.ip_diagnosis.create`, `agent.self.update`, `agent.pause`, `agent.resume`, `agent.ip_report.start`, `agent.ip_report.stop`, `agent.miner.refresh`. Event types: `miner.tags.update`, `miner.record.delete`, `miner.rack_location.update`. Other values may appear for task types added after this list.
     */
    task_name: string
    /**
     * Task execution status. `created` = enqueued but not yet picked up by an agent; `queuing` = accepted by the agent and waiting in its local queue; `pending` = actively executing on the miner; `succeed` = finished successfully; `failed` = finished with an error; `timed_out` = exceeded its execution deadline; `cancelled` = aborted before completion.
     */
    status: "created" | "queuing" | "pending" | "succeed" | "failed" | "timed_out" | "cancelled"
    /**
     * Task parameters
     */
    params: {
      [k: string]: unknown
    } | null
    /**
     * Error details if task failed
     */
    error: {
      [k: string]: unknown
    } | null
    /**
     * Task execution result
     */
    result: {
      [k: string]: unknown
    } | null
    /**
     * Represents an entity that performs actions in the system (user, API key, or system)
     */
    created_by: {
      /**
       * The type of actor
       */
      type: "user" | "apikey" | "system"
      /**
       * The unique identifier of the actor
       */
      id: string
      /**
       * The display name of the actor
       */
      name: string | null
      /**
       * The avatar URL of the actor
       */
      avatar: string | null
      /**
       * Additional metadata about the actor
       */
      metadata?: {
        [k: string]: unknown
      }
    } | null
    /**
     * Task creation time
     */
    created_at: string
    /**
     * Last update time
     */
    updated_at: string
  }[]
  pagination: {
    total: number
    page: number
    page_size: number
    total_pages: number
  }
  error: null
}
export interface QueryMinerMetricsInput {
  workspace_id: string
  farm_id: string
  miner_id: string
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
  from_time: string
  /**
   * Exclusive end of the query range
   */
  to_time: string
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
export interface QueryFarmHashrateComparisonMetricsInput {
  workspace_id: string
  farm_id: string
  /**
   * Inclusive start of the current comparison window in ISO 8601 format
   */
  from_time: string
  /**
   * Exclusive end of the current comparison window in ISO 8601 format
   */
  to_time: string
}
export interface QueryFarmHashrateComparisonMetricsOutput {
  success: true
  data: {
    /**
     * Farm ID
     */
    farm_id: string
    /**
     * Daily aggregate period used for the comparison
     */
    period: string
    current: {
      /**
       * Inclusive start of the comparison window
       */
      from_time: string
      /**
       * Exclusive end of the comparison window
       */
      to_time: string
      /**
       * Data reported by mining pool APIs
       */
      pool: {
        /**
         * Average pool hashrate in H/s
         */
        hashrate: number | null
      }
    }
    previous: {
      /**
       * Inclusive start of the comparison window
       */
      from_time: string
      /**
       * Exclusive end of the comparison window
       */
      to_time: string
      /**
       * Data reported by mining pool APIs
       */
      pool: {
        /**
         * Average pool hashrate in H/s
         */
        hashrate: number | null
      }
    }
    change: {
      pool: {
        /**
         * Absolute change in average pool hashrate in H/s
         */
        hashrate: number | null
      }
    }
    change_ratio: {
      pool: {
        /**
         * Relative change in average pool hashrate; null when either window is missing or the previous value is not positive
         */
        hashrate: number | null
      }
    }
  }
  error: null
}
export interface QueryFarmMinerMetricsInput {
  workspace_id: string
  farm_id: string
}
export interface QueryFarmMinerMetricsOutput {
  success: true
  data: FarmMinerMetrics
  error: null
}
/**
 * Real-time aggregate miner classification and distribution snapshot for a farm.
 */
export interface FarmMinerMetrics {
  /**
   * Data observation time
   */
  period: string
  /**
   * Configured farm miner capacity, or null when it is not configured
   */
  theo: number | null
  /**
   * Total number of non-deleted miners, including stale miners
   */
  total: number
  /**
   * Independent healthy, abnormal, sleeping, and stale miner counts
   */
  classification: {
    healthy: number
    abnormal: number
    sleep: number
    stale: number
  }
  /**
   * Abnormal miner counts and co-occurring anomaly counts by anomaly type
   */
  anomaly_breakdown: {
    hashboard: {
      count: number
      also_has: {
        [k: string]: unknown
      }
    }
    temperature: {
      count: number
      also_has: {
        [k: string]: unknown
      }
    }
    fan: {
      count: number
      also_has: {
        [k: string]: unknown
      }
    }
    network: {
      count: number
      also_has: {
        [k: string]: unknown
      }
    }
    pool: {
      count: number
      also_has: {
        [k: string]: unknown
      }
    }
    power: {
      count: number
      also_has: {
        [k: string]: unknown
      }
    }
    control_board: {
      count: number
      also_has: {
        [k: string]: unknown
      }
    }
    firmware: {
      count: number
      also_has: {
        [k: string]: unknown
      }
    }
    low_hashrate: {
      count: number
      also_has: {
        [k: string]: unknown
      }
    }
    zero_hashrate: {
      count: number
      also_has: {
        [k: string]: unknown
      }
    }
    ineffective_reboot: {
      count: number
      also_has: {
        [k: string]: unknown
      }
    }
    unknown: {
      count: number
      also_has: {
        [k: string]: unknown
      }
    }
  }
  /**
   * Online miner distribution by mining mode and preset, each with its firmware breakdown
   */
  mining_modes: FarmMiningModeCount[]
  /**
   * Online miner distribution by model and resolved specification, with its firmware distribution
   */
  miner_models: FarmMinerModelMetrics[]
}
export interface FarmMiningModeCount {
  /**
   * Mining mode name
   */
  mining_mode: string
  /**
   * Third-party firmware preset name when the mining mode is preset
   */
  mining_mode_preset: string | null
  /**
   * Number of online miners in this mode
   */
  count: number
  /**
   * Firmware breakdown of this mode, most common first. Counts sum to `count`.
   */
  firmwares: FarmMiningModeFirmwareCount[]
}
export interface FarmMiningModeFirmwareCount {
  /**
   * Firmware name, or null when the miners report none
   */
  firmware: string | null
  /**
   * Number of online miners in this mode running this firmware
   */
  count: number
}
export interface FarmMinerModelMetrics {
  /**
   * Miner model name
   */
  model: string | null
  /**
   * Factory specification hashrate in H/s from the linked miner specification (miner_spec.theo_hashrate), including a linked model fallback specification. The sole product baseline; null when no specification hashrate is available. Never falls back to expected_hashrate.
   */
  theoretical_hashrate: number | null
  submodel: string | null
  /**
   * Number of online miners of this model
   */
  count: number
  /**
   * Average expected hashrate in H/s
   */
  average_expected_hashrate: number | null
  /**
   * Firmware distribution within this model and submodel, most common first. Counts sum to count.
   */
  firmwares: FarmMinerModelFirmwareCount[]
}
export interface FarmMinerModelFirmwareCount {
  /**
   * Reported firmware name, or null when unknown
   */
  firmware: string | null
  /**
   * Number of online miners using this firmware
   */
  count: number
}
export interface QueryFarmAccountMetricsInput {
  workspace_id: string
  farm_id: string
}
export interface QueryFarmAccountMetricsOutput {
  success: true
  /**
   * Real-time online miner distribution of a farm by account.
   */
  data: {
    /**
     * Data observation time
     */
    period: string
    /**
     * Online miner distribution by account, most miners first. A miner's account comes from the pool connection with the latest last_share_at, which receives its hashrate. Miners without any share have null pool and account.
     */
    accounts: {
      /**
       * Pool of the account: a known pool name (antpool, f2pool, spiderpool, viabtc) or the URL host
       */
      pool: string | null
      /**
       * Account on the pool: the worker name before the first `.`, or the whole worker name without `.`
       */
      account: string | null
      /**
       * Number of online miners
       */
      count: number
      /**
       * Total hashrate of these miners in H/s
       */
      hashrate: number
    }[]
  }
  error: null
}
export interface QueryFarmMonitorEventMetricsInput {
  workspace_id: string
  farm_id: string
  /**
   * Inclusive window start. Selects events that started or ended within the window. Defaults to 24 hours before to_time; at most 7 days. With status=active and both bounds omitted, the selection covers all matching active events. event_ids replaces the window.
   */
  from_time?: string
  /**
   * Exclusive window end. Defaults to the request time when a window applies.
   */
  to_time?: string
  /**
   * Monitor types to include; defaults to all supported types
   */
  monitor_type?: ("agent_offline" | "agent_miner_data_stale" | "miner_offline" | "hashrate_drop" | "low_hashrate")[]
  /**
   * Object types to include, intersected with monitor_type. Use ["farm","agent"] to reconstruct the incident timeline.
   */
  object_type?: ("farm" | "agent" | "miner")[]
  /**
   * Events of one miner, agent or farm object
   */
  object_id?: string
  /**
   * Selects miner events whose miner is currently managed by this agent. Applies to miner monitor types only.
   */
  agent_id?: string
  /**
   * Exact event IDs (1..100) within the farm. Replaces the time window; other filters still apply.
   */
  event_ids?: string[]
  /**
   * true selects events with a recorded alert entry; false selects event-only records.
   */
  alert_entered?: boolean
  /**
   * active = ended_at is null; ended = ended_at is set.
   */
  status?: "active" | "ended"
}
export interface QueryFarmMonitorEventMetricsOutput {
  success: true
  data: {
    /**
     * Data observation time used as the reference for window defaults and histogram buckets.
     */
    period: string
    /**
     * Effective inclusive window start after defaults; null when the selection has no time condition.
     */
    from_time: string | null
    /**
     * Effective exclusive window end after defaults; null when the selection has no time condition.
     */
    to_time: string | null
    /**
     * Number of events matching the selection across all monitor types.
     */
    total: number
    /**
     * One entry per monitor type with at least one matching event, ordered by count descending then monitor_type ascending. An object can appear under several monitor types.
     */
    monitor_types: {
      /**
       * Monitor type; also the grouping key of event metrics
       */
      monitor_type: "agent_offline" | "agent_miner_data_stale" | "miner_offline" | "hashrate_drop" | "low_hashrate"
      /**
       * Kind of object a monitor event describes
       */
      object_type: "farm" | "agent" | "miner"
      /**
       * Number of events matching the selection.
       */
      count: number
      /**
       * Number of distinct objects within this monitor type.
       */
      distinct_object_count: number
      /**
       * Number of active events matching all selection filters.
       */
      active_count: number
      earliest_started_at: string
      latest_started_at: string
      /**
       * Matching events by age of started_at relative to period: [0,1h), [1h,24h), [24h,7d), [7d,infinity). Future timestamps have age zero. The buckets sum to count and are independent of the query window.
       */
      started_at_histogram: {
        lt_1h: number
        lt_24h: number
        lt_7d: number
        ge_7d: number
      }
    }[]
  }
  error: null
}
export interface SearchFarmMonitorEventsInput {
  workspace_id: string
  farm_id: string
  /**
   * Inclusive window start. Selects events that started or ended within the window. Defaults to 24 hours before to_time; at most 7 days. With status=active and both bounds omitted, the selection covers all matching active events. event_ids replaces the window.
   */
  from_time?: string
  /**
   * Exclusive window end. Defaults to the request time when a window applies.
   */
  to_time?: string
  /**
   * Monitor types to include; defaults to all supported types
   */
  monitor_type?: ("agent_offline" | "agent_miner_data_stale" | "miner_offline" | "hashrate_drop" | "low_hashrate")[]
  /**
   * Object types to include, intersected with monitor_type. Use ["farm","agent"] to reconstruct the incident timeline.
   */
  object_type?: ("farm" | "agent" | "miner")[]
  /**
   * Events of one miner, agent or farm object
   */
  object_id?: string
  /**
   * Selects miner events whose miner is currently managed by this agent. Applies to miner monitor types only.
   */
  agent_id?: string
  /**
   * Exact event IDs (1..100) within the farm. Replaces the time window; other filters still apply.
   */
  event_ids?: string[]
  /**
   * true selects events with a recorded alert entry; false selects event-only records.
   */
  alert_entered?: boolean
  /**
   * active = ended_at is null; ended = ended_at is set.
   */
  status?: "active" | "ended"
  /**
   * summary returns snapshot=null. snapshot adds the frozen rule, evaluation context, object snapshot and alert entry context of each event and limits page_size to 100.
   */
  detail?: "summary" | "snapshot"
  /**
   * Sort direction of started_at, id
   */
  order?: "asc" | "desc"
  page?: number
  /**
   * Page size, 1..500 (1..100 when detail=snapshot)
   */
  page_size?: number
}
export interface SearchFarmMonitorEventsOutput {
  success: true
  data: {
    event_id: string
    /**
     * Monitor type; also the grouping key of event metrics
     */
    monitor_type: "agent_offline" | "agent_miner_data_stale" | "miner_offline" | "hashrate_drop" | "low_hashrate"
    /**
     * Kind of object a monitor event describes
     */
    object_type: "farm" | "agent" | "miner"
    /**
     * Farm ID, agent ID or miner ID depending on object_type
     */
    object_id: string
    /**
     * Severity as stored, e.g. WARNING
     */
    severity: string
    /**
     * state_change = condition became true while monitored; monitor_activation = already true when the monitor was enabled
     */
    detection_reason: string
    started_at: string
    detected_at: string
    /**
     * Time the event ended; null while active.
     */
    ended_at: string | null
    /**
     * Reason the event ended: signal_cleared means the rolling hashrate decrease signal ended, not restored production; recovered and object/configuration changes retain their own meanings. Current farm health is read from current metrics.
     */
    end_reason: string | null
    /**
     * Time of recorded alert entry; event-only records use null
     */
    entered_at: string | null
    /**
     * Current live row of the object; null for farm events and for deleted or moved objects
     */
    current:
      | (
          | {
              object_type: "miner"
              agent_id: string
              /**
               * System-managed reporting status: online or stale
               */
              status: string
              model: string | null
              rack: string | null
              rack_row: number | null
              rack_column: number | null
              ip: string
              /**
               * Current hashrate in H/s
               */
              hashrate: number | null
              /**
               * Expected hashrate in H/s
               */
              expected_hashrate: number | null
              last_updated_at: string | null
            }
          | {
              object_type: "agent"
              status: string | null
              version: string | null
              last_online_at: string | null
              last_updated_at: string | null
            }
        )
      | null
    /**
     * Populated only when detail=snapshot
     */
    snapshot:
      | (
          | {
              monitor_type: "agent_offline"
              /**
               * Monitor rule parameters frozen when the event was created
               */
              effective_parameters: {
                [k: string]: unknown
              } | null
              /**
               * Event evaluation context
               */
              evaluation_snapshot: {
                last_online_at?: string | null
                [k: string]: unknown
              } | null
              /**
               * Agent row frozen when the event was created
               */
              object_snapshot: {
                agent_id?: string | null
                host?: {
                  [k: string]: unknown
                } | null
                version?: string | null
                uptime?: number | null
                last_online_at?: string | null
                last_updated_at?: string | null
                farm_name?: string | null
                /**
                 * Farm description shown as alias
                 */
                farm_alias?: string | null
                [k: string]: unknown
              } | null
              /**
               * Evaluation context recorded at alert entry; event-only records use null
               */
              alert_entry_snapshot: {
                event_started_at?: string | null
                last_online_at?: string | null
                offline_after_seconds?: number | null
                agent_last_updated_at?: string | null
                managed_miner_count?: number | null
                /**
                 * H/s
                 */
                expected_hashrate_total?: number | null
                expected_hashrate_miner_count?: number | null
                [k: string]: unknown
              } | null
              /**
               * Validation problems of this record, e.g. object_snapshot_invalid. The affected field is null.
               */
              warnings: string[]
            }
          | {
              monitor_type: "agent_miner_data_stale"
              /**
               * Monitor rule parameters frozen when the event was created
               */
              effective_parameters: {
                [k: string]: unknown
              } | null
              /**
               * Event evaluation context
               */
              evaluation_snapshot: {
                last_updated_at?: string | null
                [k: string]: unknown
              } | null
              /**
               * Agent row frozen when the event was created
               */
              object_snapshot: {
                agent_id?: string | null
                host?: {
                  [k: string]: unknown
                } | null
                version?: string | null
                uptime?: number | null
                last_online_at?: string | null
                last_updated_at?: string | null
                farm_name?: string | null
                /**
                 * Farm description shown as alias
                 */
                farm_alias?: string | null
                [k: string]: unknown
              } | null
              /**
               * Evaluation context recorded at alert entry; event-only records use null
               */
              alert_entry_snapshot: {
                event_started_at?: string | null
                agent_host?: {
                  [k: string]: unknown
                } | null
                agent_version?: string | null
                agent_uptime?: number | null
                agent_last_online_at?: string | null
                agent_last_updated_at?: string | null
                managed_miner_count?: number | null
                /**
                 * H/s
                 */
                expected_hashrate_total?: number | null
                expected_hashrate_miner_count?: number | null
                [k: string]: unknown
              } | null
              /**
               * Validation problems of this record, e.g. object_snapshot_invalid. The affected field is null.
               */
              warnings: string[]
            }
          | {
              monitor_type: "miner_offline"
              /**
               * Monitor rule parameters frozen when the event was created
               */
              effective_parameters: {
                [k: string]: unknown
              } | null
              /**
               * Event evaluation context
               */
              evaluation_snapshot: {
                last_updated_at?: string | null
                stale_at?: string | null
                [k: string]: unknown
              } | null
              /**
               * Miner row frozen when the event was created
               */
              object_snapshot: {
                agent_id?: string | null
                ip?: string | null
                mac?: string | null
                make?: string | null
                model?: string | null
                serial_number?: string | null
                /**
                 * H/s
                 */
                expected_hashrate?: number | null
                rack?: string | null
                rack_row?: number | null
                rack_column?: number | null
                network?: {
                  [k: string]: unknown
                } | null
                farm_name?: string | null
                /**
                 * Farm description shown as alias
                 */
                farm_alias?: string | null
                [k: string]: unknown
              } | null
              /**
               * Evaluation context recorded at alert entry; event-only records use null
               */
              alert_entry_snapshot: {
                event_started_at?: string | null
                agent_last_online_at?: string | null
                agent_last_updated_at?: string | null
                [k: string]: unknown
              } | null
              /**
               * Validation problems of this record, e.g. object_snapshot_invalid. The affected field is null.
               */
              warnings: string[]
            }
          | {
              monitor_type: "hashrate_drop"
              /**
               * Monitor rule parameters frozen when the event was created
               */
              effective_parameters: {
                [k: string]: unknown
              } | null
              /**
               * Event evaluation context
               */
              evaluation_snapshot: {
                /**
                 * IDs of the farm's pool settings, frozen with the event baseline.
                 */
                pool_ids?: string[] | null
                /**
                 * Raw pool hashrate sum at the first breach, in H/s.
                 */
                first_breach_hashrate?: number | null
                /**
                 * Fixed mean of the six complete raw pool hashrate samples preceding the first breach, in H/s.
                 */
                baseline_hashrate?: number | null
                baseline_periods?: string[] | null
                entry_confirmation_samples?: number | null
                recovery_confirmation_samples?: number | null
                [k: string]: unknown
              } | null
              /**
               * Farm row frozen when the event was created
               */
              object_snapshot: {
                farm_name?: string | null
                /**
                 * Farm description shown as alias
                 */
                farm_alias?: string | null
                [k: string]: unknown
              } | null
              /**
               * Evaluation context recorded at alert entry; event-only records use null
               */
              alert_entry_snapshot: {
                /**
                 * Confirmed raw pool hashrate sum, in H/s.
                 */
                hashrate?: number | null
                /**
                 * Actual hashrate baseline frozen at the first breach, in H/s.
                 */
                baseline_hashrate?: number | null
                /**
                 * Relative decrease: (fixed baseline - confirmed actual hashrate) / fixed baseline x 100.
                 */
                drop_percentage?: number | null
                /**
                 * Fixed baseline minus confirmed actual hashrate, in H/s.
                 */
                drop_hashrate?: number | null
                confirmation_periods?: string[] | null
                /**
                 * Raw pool hashrates at the two confirmation samples, both compared to the same fixed baseline, in H/s.
                 */
                confirmation_hashrates?: number[] | null
                [k: string]: unknown
              } | null
              /**
               * Validation problems of this record, e.g. object_snapshot_invalid. The affected field is null.
               */
              warnings: string[]
              /**
               * Hashrate event measurements: use latest values while active and minimum values after ending, relative to the frozen baseline. Not the initial alert snapshot.
               */
              result_snapshot?: {
                latest_hashrate: number | null
                latest_period: string | null
                minimum_hashrate: number | null
                minimum_period: string | null
                evaluated_at: string
                has_incomplete_data: boolean
              } | null
            }
          | {
              monitor_type: "low_hashrate"
              /**
               * Monitor rule parameters frozen when the event was created
               */
              effective_parameters: {
                [k: string]: unknown
              } | null
              /**
               * Event evaluation context
               */
              evaluation_snapshot: {
                /**
                 * Online hashrate ratio at the first breach, relative to configured capacity.
                 */
                first_breach_online_hashrate?: number | null
                /**
                 * Threshold as a ratio of configured hashrate; 0.1 equals 10%.
                 */
                low_hashrate_threshold?: number | null
                first_breach_period?: string | null
                entry_confirmation_samples?: number | null
                recovery_confirmation_samples?: number | null
                expected_pool_count?: number | null
                observed_pool_count?: number | null
                [k: string]: unknown
              } | null
              /**
               * Farm row frozen when the event was created
               */
              object_snapshot: {
                farm_name?: string | null
                /**
                 * Farm description shown as alias
                 */
                farm_alias?: string | null
                [k: string]: unknown
              } | null
              /**
               * Evaluation context recorded at alert entry; event-only records use null
               */
              alert_entry_snapshot: {
                event_started_at?: string | null
                /**
                 * Confirmed online hashrate ratio x 100, in percent of configured hashrate; may exceed 100.
                 */
                online_percentage?: number | null
                /**
                 * Threshold as a ratio of configured hashrate; 0.1 equals 10%.
                 */
                low_hashrate_threshold?: number | null
                confirmed_at?: string | null
                confirmation_periods?: string[] | null
                /**
                 * Online hashrate ratios at the two confirmation samples, relative to configured capacity.
                 */
                confirmation_online_hashrates?: number[] | null
                expected_pool_count?: number | null
                observed_pool_count?: number | null
                [k: string]: unknown
              } | null
              /**
               * Validation problems of this record, e.g. object_snapshot_invalid. The affected field is null.
               */
              warnings: string[]
            }
        )
      | null
  }[]
  pagination: {
    total: number
    page: number
    page_size: number
    total_pages: number
  }
  error: null
}
export interface ListRackGroupsInput {
  workspace_id: string
  farm_id: string
}
export interface ListRackGroupsOutput {
  success: true
  data: {
    /**
     * Rack group ID
     */
    id: string
    /**
     * Unique within the farm; null until someone names it
     */
    name: string | null
    /**
     * Template the rack group uses; null without one
     */
    template_id: string | null
    /**
     * Offset within the subnets of the first slot when the template assigns them in IP order
     */
    start_offset: number
    /**
     * Subnets of the rack group as network addresses, in address order
     */
    subnets: string[]
    /**
     * Miners in the subnets, stale included; equals searching miners with `ip_ranges` set to the subnets
     */
    miner_count: number
    /**
     * Real-time health of the miners of a rack group, counted as QueryFarmMinerMetrics counts a farm. Readings come from live miners: online and not in sleep mode.
     */
    summary: {
      /**
       * Data observation time
       */
      period: string
      /**
       * Independent healthy, abnormal, sleeping, and stale miner counts
       */
      classification: {
        healthy: number
        abnormal: number
        sleep: number
        stale: number
      }
      /**
       * Abnormal miner counts and co-occurring anomaly counts by anomaly type
       */
      anomaly_breakdown: {
        hashboard: {
          count: number
          also_has: {
            [k: string]: unknown
          }
        }
        temperature: {
          count: number
          also_has: {
            [k: string]: unknown
          }
        }
        fan: {
          count: number
          also_has: {
            [k: string]: unknown
          }
        }
        network: {
          count: number
          also_has: {
            [k: string]: unknown
          }
        }
        pool: {
          count: number
          also_has: {
            [k: string]: unknown
          }
        }
        power: {
          count: number
          also_has: {
            [k: string]: unknown
          }
        }
        control_board: {
          count: number
          also_has: {
            [k: string]: unknown
          }
        }
        firmware: {
          count: number
          also_has: {
            [k: string]: unknown
          }
        }
        low_hashrate: {
          count: number
          also_has: {
            [k: string]: unknown
          }
        }
        zero_hashrate: {
          count: number
          also_has: {
            [k: string]: unknown
          }
        }
        ineffective_reboot: {
          count: number
          also_has: {
            [k: string]: unknown
          }
        }
        unknown: {
          count: number
          also_has: {
            [k: string]: unknown
          }
        }
      }
      /**
       * Highest average board temperature of live miners; null without a reading
       */
      max_temperature: number | null
      /**
       * Mean average board temperature of live miners; null without a reading
       */
      avg_temperature: number | null
      /**
       * Highest average inlet temperature of live miners; null without a reading
       */
      max_inlet_temperature: number | null
      /**
       * Mean average inlet temperature of live miners; null without a reading
       */
      avg_inlet_temperature: number | null
      /**
       * Highest average outlet temperature of live miners; null without a reading
       */
      max_outlet_temperature: number | null
      /**
       * Mean average outlet temperature of live miners; null without a reading
       */
      avg_outlet_temperature: number | null
      /**
       * Total watts of live miners reporting both wattage and hashrate
       */
      wattage: number | null
      /**
       * Total hashrate in H/s of live miners reporting both wattage and hashrate
       */
      hashrate: number | null
      /**
       * wattage over hashrate in J/TH; null without hashrate
       */
      efficiency: number | null
    }
  }[]
  error: null
}
export interface UpdateRackGroupsInput {
  workspace_id: string
  farm_id: string
  rack_groups: {
    id: string
    /**
     * A blank name clears it
     */
    name?: string | null
    template_id?: string | null
    start_offset?: number
    /**
     * Replaces the subnets. Rack groups whose subnets all fall within them merge into this one; a partial overlap with another rack group is rejected.
     */
    subnets?: string[]
  }[]
}
export interface UpdateRackGroupsOutput {
  success: true
  data: {
    /**
     * Rack group ID
     */
    id: string
    /**
     * Unique within the farm; null until someone names it
     */
    name: string | null
    /**
     * Template the rack group uses; null without one
     */
    template_id: string | null
    /**
     * Offset within the subnets of the first slot when the template assigns them in IP order
     */
    start_offset: number
    /**
     * Subnets of the rack group as network addresses, in address order
     */
    subnets: string[]
    /**
     * Miners in the subnets, stale included; equals searching miners with `ip_ranges` set to the subnets
     */
    miner_count: number
    /**
     * Real-time health of the miners of a rack group, counted as QueryFarmMinerMetrics counts a farm. Readings come from live miners: online and not in sleep mode.
     */
    summary: {
      /**
       * Data observation time
       */
      period: string
      /**
       * Independent healthy, abnormal, sleeping, and stale miner counts
       */
      classification: {
        healthy: number
        abnormal: number
        sleep: number
        stale: number
      }
      /**
       * Abnormal miner counts and co-occurring anomaly counts by anomaly type
       */
      anomaly_breakdown: {
        hashboard: {
          count: number
          also_has: {
            [k: string]: unknown
          }
        }
        temperature: {
          count: number
          also_has: {
            [k: string]: unknown
          }
        }
        fan: {
          count: number
          also_has: {
            [k: string]: unknown
          }
        }
        network: {
          count: number
          also_has: {
            [k: string]: unknown
          }
        }
        pool: {
          count: number
          also_has: {
            [k: string]: unknown
          }
        }
        power: {
          count: number
          also_has: {
            [k: string]: unknown
          }
        }
        control_board: {
          count: number
          also_has: {
            [k: string]: unknown
          }
        }
        firmware: {
          count: number
          also_has: {
            [k: string]: unknown
          }
        }
        low_hashrate: {
          count: number
          also_has: {
            [k: string]: unknown
          }
        }
        zero_hashrate: {
          count: number
          also_has: {
            [k: string]: unknown
          }
        }
        ineffective_reboot: {
          count: number
          also_has: {
            [k: string]: unknown
          }
        }
        unknown: {
          count: number
          also_has: {
            [k: string]: unknown
          }
        }
      }
      /**
       * Highest average board temperature of live miners; null without a reading
       */
      max_temperature: number | null
      /**
       * Mean average board temperature of live miners; null without a reading
       */
      avg_temperature: number | null
      /**
       * Highest average inlet temperature of live miners; null without a reading
       */
      max_inlet_temperature: number | null
      /**
       * Mean average inlet temperature of live miners; null without a reading
       */
      avg_inlet_temperature: number | null
      /**
       * Highest average outlet temperature of live miners; null without a reading
       */
      max_outlet_temperature: number | null
      /**
       * Mean average outlet temperature of live miners; null without a reading
       */
      avg_outlet_temperature: number | null
      /**
       * Total watts of live miners reporting both wattage and hashrate
       */
      wattage: number | null
      /**
       * Total hashrate in H/s of live miners reporting both wattage and hashrate
       */
      hashrate: number | null
      /**
       * wattage over hashrate in J/TH; null without hashrate
       */
      efficiency: number | null
    }
  }[]
  error: null
}
export interface ListRackGroupTemplatesInput {
  workspace_id: string
  farm_id: string
}
export interface ListRackGroupTemplatesOutput {
  success: true
  data: {
    name: string
    racks: number
    rows: number
    columns: number
    /**
     * `sequential` gives each IP a fixed slot and keeps gaps; `dynamic` fills slots in IP order
     */
    mode: "sequential" | "dynamic"
    id: string
    /**
     * Stable identifier of a system template, e.g. antspace-hw5
     */
    key: string | null
    /**
     * System templates are shared by every farm and read-only
     */
    is_system: boolean
  }[]
  error: null
}
export interface CreateRackGroupTemplateInput {
  workspace_id: string
  farm_id: string
  name: string
  racks: number
  rows: number
  columns: number
  /**
   * `sequential` gives each IP a fixed slot and keeps gaps; `dynamic` fills slots in IP order
   */
  mode: "sequential" | "dynamic"
}
export interface CreateRackGroupTemplateOutput {
  success: true
  data: {
    name: string
    racks: number
    rows: number
    columns: number
    /**
     * `sequential` gives each IP a fixed slot and keeps gaps; `dynamic` fills slots in IP order
     */
    mode: "sequential" | "dynamic"
    id: string
    /**
     * Stable identifier of a system template, e.g. antspace-hw5
     */
    key: string | null
    /**
     * System templates are shared by every farm and read-only
     */
    is_system: boolean
  }
  error: null
}
export interface UpdateRackGroupTemplateInput {
  workspace_id: string
  farm_id: string
  template_id: string
  name?: string
  racks?: number
  rows?: number
  columns?: number
  /**
   * `sequential` gives each IP a fixed slot and keeps gaps; `dynamic` fills slots in IP order
   */
  mode?: "sequential" | "dynamic"
}
export interface UpdateRackGroupTemplateOutput {
  success: true
  data: {
    name: string
    racks: number
    rows: number
    columns: number
    /**
     * `sequential` gives each IP a fixed slot and keeps gaps; `dynamic` fills slots in IP order
     */
    mode: "sequential" | "dynamic"
    id: string
    /**
     * Stable identifier of a system template, e.g. antspace-hw5
     */
    key: string | null
    /**
     * System templates are shared by every farm and read-only
     */
    is_system: boolean
  }
  error: null
}
export interface DeleteRackGroupTemplateInput {
  workspace_id: string
  farm_id: string
  template_id: string
}
export interface DeleteRackGroupTemplateOutput {
  success: true
  data: null
  error: null
}
export interface GetFarmLayoutInput {
  workspace_id: string
  farm_id: string
}
export interface GetFarmLayoutOutput {
  success: true
  data: {
    /**
     * Rows from front to back; null until someone arranges the farm
     */
    rows:
      | {
          /**
           * Rack group ids at each position from the floor up; empty for an empty position
           */
          positions: string[][]
          /**
           * Aisle after this row, if any
           */
          aisle_after: ("cold" | "hot") | null
        }[]
      | null
    updated_at: string | null
  }
  error: null
}
export interface UpdateFarmLayoutInput {
  workspace_id: string
  farm_id: string
  rows: {
    /**
     * Rack group ids at each position from the floor up; empty for an empty position
     */
    positions: string[][]
    /**
     * Aisle after this row, if any
     */
    aisle_after: ("cold" | "hot") | null
  }[]
  /**
   * updated_at as last read, null when no layout was saved; the save is rejected if the layout changed since
   */
  expected_updated_at: string | null
}
export interface UpdateFarmLayoutOutput {
  success: true
  data: {
    /**
     * Rows from front to back; null until someone arranges the farm
     */
    rows:
      | {
          /**
           * Rack group ids at each position from the floor up; empty for an empty position
           */
          positions: string[][]
          /**
           * Aisle after this row, if any
           */
          aisle_after: ("cold" | "hot") | null
        }[]
      | null
    updated_at: string | null
  }
  error: null
}
export interface ListFarmRebootEventsInput {
  workspace_id: string
  farm_id: string
  page?: number
  page_size?: number
  /**
   * Inclusive start time. Defaults to 7 days before the request time.
   */
  from_time?: string
  /**
   * Inclusive end time. Defaults to the request time.
   */
  to_time?: string
  /**
   * Miner ID filter
   */
  miner_id?: string
}
export interface ListFarmRebootEventsOutput {
  success: true
  data: {
    /**
     * Reboot Event ID
     */
    id: string
    /**
     * Miner ID
     */
    miner_id: string
    /**
     * Farm ID
     */
    farm_id: string
    /**
     * Miner IP address at query time
     */
    ip: string
    /**
     * Miner hardware model
     */
    model: string | null
    /**
     * Miner manufacturer
     */
    make: string
    /**
     * Miner serial number
     */
    serial_number: string | null
    /**
     * Reboot detection time
     */
    period: string
    /**
     * Snapshot before the reboot
     */
    before: {
      /**
       * Snapshot hashrate in H/s
       */
      hashrate: number | null
      /**
       * Average hashrate in H/s; before uses T-30 to T-5 minutes and after uses T+15 to T+60 minutes. Null when the window has no performance history or when the same miner has another reboot event within 15 minutes.
       */
      avg_hashrate: number | null
      /**
       * Snapshot power consumption in watts
       */
      wattage: number | null
      /**
       * Snapshot average board temperature in Celsius
       */
      temp: number | null
      /**
       * Snapshot uptime in seconds
       */
      uptime: number | null
      /**
       * Snapshot anomaly bitmask. Bits: 0=fan, 1=power, 2=temperature, 3=hashboard, 4=network, 5=firmware, 6=unknown, 8=control_board, 9=pool, 10=low_hashrate, 11=zero_hashrate, 30=ineffective_reboot.
       */
      anomaly_flags: number | null
      /**
       * Snapshot mining mode
       */
      mining_mode: string | null
    }
    /**
     * Snapshot after the reboot
     */
    after: {
      /**
       * Snapshot hashrate in H/s
       */
      hashrate: number | null
      /**
       * Average hashrate in H/s; before uses T-30 to T-5 minutes and after uses T+15 to T+60 minutes. Null when the window has no performance history or when the same miner has another reboot event within 15 minutes.
       */
      avg_hashrate: number | null
      /**
       * Snapshot power consumption in watts
       */
      wattage: number | null
      /**
       * Snapshot average board temperature in Celsius
       */
      temp: number | null
      /**
       * Snapshot uptime in seconds
       */
      uptime: number | null
      /**
       * Snapshot anomaly bitmask. Bits: 0=fan, 1=power, 2=temperature, 3=hashboard, 4=network, 5=firmware, 6=unknown, 8=control_board, 9=pool, 10=low_hashrate, 11=zero_hashrate, 30=ineffective_reboot.
       */
      anomaly_flags: number | null
      /**
       * Snapshot mining mode
       */
      mining_mode: string | null
    }
  }[]
  pagination: {
    total: number
    page: number
    page_size: number
    total_pages: number
  }
  error: null
}
export interface ListMinerRebootEventsInput {
  workspace_id: string
  farm_id: string
  /**
   * Miner ID
   */
  miner_id: string
  page?: number
  page_size?: number
  /**
   * Inclusive start time. Defaults to 7 days before the request time.
   */
  from_time?: string
  /**
   * Inclusive end time. Defaults to the request time.
   */
  to_time?: string
}
export interface ListMinerRebootEventsOutput {
  success: true
  data: {
    /**
     * Reboot Event ID
     */
    id: string
    /**
     * Miner ID
     */
    miner_id: string
    /**
     * Farm ID
     */
    farm_id: string
    /**
     * Miner IP address at query time
     */
    ip: string
    /**
     * Miner hardware model
     */
    model: string | null
    /**
     * Miner manufacturer
     */
    make: string
    /**
     * Miner serial number
     */
    serial_number: string | null
    /**
     * Reboot detection time
     */
    period: string
    /**
     * Snapshot before the reboot
     */
    before: {
      /**
       * Snapshot hashrate in H/s
       */
      hashrate: number | null
      /**
       * Average hashrate in H/s; before uses T-30 to T-5 minutes and after uses T+15 to T+60 minutes. Null when the window has no performance history or when the same miner has another reboot event within 15 minutes.
       */
      avg_hashrate: number | null
      /**
       * Snapshot power consumption in watts
       */
      wattage: number | null
      /**
       * Snapshot average board temperature in Celsius
       */
      temp: number | null
      /**
       * Snapshot uptime in seconds
       */
      uptime: number | null
      /**
       * Snapshot anomaly bitmask. Bits: 0=fan, 1=power, 2=temperature, 3=hashboard, 4=network, 5=firmware, 6=unknown, 8=control_board, 9=pool, 10=low_hashrate, 11=zero_hashrate, 30=ineffective_reboot.
       */
      anomaly_flags: number | null
      /**
       * Snapshot mining mode
       */
      mining_mode: string | null
    }
    /**
     * Snapshot after the reboot
     */
    after: {
      /**
       * Snapshot hashrate in H/s
       */
      hashrate: number | null
      /**
       * Average hashrate in H/s; before uses T-30 to T-5 minutes and after uses T+15 to T+60 minutes. Null when the window has no performance history or when the same miner has another reboot event within 15 minutes.
       */
      avg_hashrate: number | null
      /**
       * Snapshot power consumption in watts
       */
      wattage: number | null
      /**
       * Snapshot average board temperature in Celsius
       */
      temp: number | null
      /**
       * Snapshot uptime in seconds
       */
      uptime: number | null
      /**
       * Snapshot anomaly bitmask. Bits: 0=fan, 1=power, 2=temperature, 3=hashboard, 4=network, 5=firmware, 6=unknown, 8=control_board, 9=pool, 10=low_hashrate, 11=zero_hashrate, 30=ineffective_reboot.
       */
      anomaly_flags: number | null
      /**
       * Snapshot mining mode
       */
      mining_mode: string | null
    }
  }[]
  pagination: {
    total: number
    page: number
    page_size: number
    total_pages: number
  }
  error: null
}
export interface ListTaskBatchesInput {
  workspace_id: string
  farm_id: string
  page?: number
  page_size?: number
  /**
   * Task name filter
   */
  task_name?:
    | "agent.scan.create"
    | "agent.ip_diagnosis.create"
    | "agent.self.update"
    | "agent.pause"
    | "agent.resume"
    | "agent.ip_report.start"
    | "agent.ip_report.stop"
    | "agent.miner.refresh"
    | "miner.system.reboot"
    | "miner.log.get"
    | "miner.light.update"
    | "miner.power_mode.update"
    | "miner.pool.update"
    | "miner.pool.lock"
    | "miner.firmware.update"
    | "miner.network.update"
    | "miner.tags.update"
    | "miner.record.delete"
    | "miner.rack_location.update"
}
/**
 * Represents an entity that performs actions in the system (user, API key, or system)
 */
export type Actor = {
  /**
   * The type of actor
   */
  type: "user" | "apikey" | "system"
  /**
   * The unique identifier of the actor
   */
  id: string
  /**
   * The display name of the actor
   */
  name: string | null
  /**
   * The avatar URL of the actor
   */
  avatar: string | null
  /**
   * Additional metadata about the actor
   */
  metadata?: {
    [k: string]: unknown
  }
} | null
export interface ListTaskBatchesOutput {
  success: true
  data: TaskBatchSummary[]
  pagination: {
    total: number
    page: number
    page_size: number
    total_pages: number
  }
  error: null
}
export interface TaskBatchSummary {
  /**
   * Task Batch ID
   */
  id: string
  /**
   * Task or event type dispatched to miners or agents. Execution types: `miner.system.reboot`, `miner.log.get`, `miner.light.update`, `miner.power_mode.update`, `miner.pool.update`, `miner.pool.lock`, `miner.firmware.update`, `agent.scan.create`, `agent.ip_diagnosis.create`, `agent.self.update`, `agent.pause`, `agent.resume`, `agent.ip_report.start`, `agent.ip_report.stop`, `agent.miner.refresh`. Event types: `miner.tags.update`, `miner.record.delete`, `miner.rack_location.update`. Other values may appear for task types added after this list.
   */
  task_name: string
  /**
   * Aggregate status of a task batch. `pending` = at least one task is still running; `succeed` = all tasks succeeded; `failed` = all tasks failed, timed out, or were cancelled; `partial_succeed` = finished with a mix of success and failure.
   */
  status: "pending" | "succeed" | "failed" | "partial_succeed"
  /**
   * Total tasks in the batch
   */
  task_count: number
  /**
   * Tasks that succeeded
   */
  succeed_count: number
  /**
   * Tasks that failed, timed out, or were cancelled
   */
  unsuccessful_count: number
  /**
   * Batch parameters
   */
  task_params: {
    [k: string]: unknown
  } | null
  /**
   * Batch metadata
   */
  metadata: {
    [k: string]: unknown
  } | null
  created_by: Actor
  /**
   * Batch creation time
   */
  created_at: string
}
export interface SearchTaskBatchesInput {
  workspace_id: string
  farm_id: string
  /**
   * Aggregate batch status filter
   */
  status?: {
    /**
     * Aggregate status of a task batch. `pending` = at least one task is still running; `succeed` = all tasks succeeded; `failed` = all tasks failed, timed out, or were cancelled; `partial_succeed` = finished with a mix of success and failure.
     */
    eq?: "pending" | "succeed" | "failed" | "partial_succeed"
    in?: ("pending" | "succeed" | "failed" | "partial_succeed")[]
  }
  /**
   * Task name filter
   */
  task_name?: {
    /**
     * Task or event type dispatched to miners or agents. Execution types: `miner.system.reboot`, `miner.log.get`, `miner.light.update`, `miner.power_mode.update`, `miner.pool.update`, `miner.pool.lock`, `miner.firmware.update`, `agent.scan.create`, `agent.ip_diagnosis.create`, `agent.self.update`, `agent.pause`, `agent.resume`, `agent.ip_report.start`, `agent.ip_report.stop`, `agent.miner.refresh`. Event types: `miner.tags.update`, `miner.record.delete`, `miner.rack_location.update`.
     */
    eq?:
      | "agent.scan.create"
      | "agent.ip_diagnosis.create"
      | "agent.self.update"
      | "agent.pause"
      | "agent.resume"
      | "agent.ip_report.start"
      | "agent.ip_report.stop"
      | "agent.miner.refresh"
      | "miner.system.reboot"
      | "miner.log.get"
      | "miner.light.update"
      | "miner.power_mode.update"
      | "miner.pool.update"
      | "miner.pool.lock"
      | "miner.firmware.update"
      | "miner.network.update"
      | "miner.tags.update"
      | "miner.record.delete"
      | "miner.rack_location.update"
    in?: (
      | "agent.scan.create"
      | "agent.ip_diagnosis.create"
      | "agent.self.update"
      | "agent.pause"
      | "agent.resume"
      | "agent.ip_report.start"
      | "agent.ip_report.stop"
      | "agent.miner.refresh"
      | "miner.system.reboot"
      | "miner.log.get"
      | "miner.light.update"
      | "miner.power_mode.update"
      | "miner.pool.update"
      | "miner.pool.lock"
      | "miner.firmware.update"
      | "miner.network.update"
      | "miner.tags.update"
      | "miner.record.delete"
      | "miner.rack_location.update"
    )[]
  }
  /**
   * Creator type filter
   */
  actor_type?: {
    /**
     * Actor type used to filter task batches by creator. `user` = batches created by human users through the Nonce app; `automation` = batches created by the Automation workflow system; `api` = batches created with workspace API keys or by Nonce system services.
     */
    eq: "user" | "automation" | "api"
  }
  /**
   * Exclusive creation time bounds
   */
  created_at?: {
    gt?: string
    lt?: string
  }
  page?: number
  page_size?: number
}
export interface SearchTaskBatchesOutput {
  success: true
  data: TaskBatchSummary[]
  pagination: {
    total: number
    page: number
    page_size: number
    total_pages: number
  }
  error: null
}
export interface GetTaskBatchInput {
  workspace_id: string
  farm_id: string
  /**
   * Task Batch ID
   */
  task_batch_id: string
}
export interface GetTaskBatchOutput {
  success: true
  data: TaskBatch
  error: null
}
export interface TaskBatch {
  /**
   * Task Batch ID
   */
  id: string
  /**
   * Task or event type dispatched to miners or agents. Execution types: `miner.system.reboot`, `miner.log.get`, `miner.light.update`, `miner.power_mode.update`, `miner.pool.update`, `miner.pool.lock`, `miner.firmware.update`, `agent.scan.create`, `agent.ip_diagnosis.create`, `agent.self.update`, `agent.pause`, `agent.resume`, `agent.ip_report.start`, `agent.ip_report.stop`, `agent.miner.refresh`. Event types: `miner.tags.update`, `miner.record.delete`, `miner.rack_location.update`. Other values may appear for task types added after this list.
   */
  task_name: string
  /**
   * Aggregate status of a task batch. `pending` = at least one task is still running; `succeed` = all tasks succeeded; `failed` = all tasks failed, timed out, or were cancelled; `partial_succeed` = finished with a mix of success and failure.
   */
  status: "pending" | "succeed" | "failed" | "partial_succeed"
  /**
   * Total tasks in the batch
   */
  task_count: number
  /**
   * Tasks that succeeded
   */
  succeed_count: number
  /**
   * Tasks that failed, timed out, or were cancelled
   */
  unsuccessful_count: number
  /**
   * Batch parameters
   */
  task_params: {
    [k: string]: unknown
  } | null
  /**
   * Batch metadata
   */
  metadata: {
    [k: string]: unknown
  } | null
  created_by: Actor
  /**
   * Batch creation time
   */
  created_at: string
  /**
   * Tasks waiting for an agent
   */
  created_count: number
  /**
   * Tasks waiting in an agent queue
   */
  queuing_count: number
  /**
   * Tasks currently executing
   */
  pending_count: number
  /**
   * Tasks that failed
   */
  failed_count: number
  /**
   * Tasks that timed out
   */
  timed_out_count: number
  /**
   * Tasks that were cancelled
   */
  cancelled_count: number
}
export interface ListTaskBatchTasksInput {
  workspace_id: string
  farm_id: string
  /**
   * Task Batch ID
   */
  task_batch_id: string
  page?: number
  page_size?: number
  /**
   * Task status filter
   */
  status?: "created" | "queuing" | "pending" | "succeed" | "failed" | "timed_out" | "cancelled"
}
export interface ListTaskBatchTasksOutput {
  success: true
  data: Task[]
  pagination: {
    total: number
    page: number
    page_size: number
    total_pages: number
  }
  error: null
}
export interface Task {
  /**
   * Task ID
   */
  id: string
  /**
   * Target Miner ID, or null for an Agent task
   */
  miner_id: string | null
  /**
   * Task execution status. `created` = enqueued but not yet picked up by an agent; `queuing` = accepted by the agent and waiting in its local queue; `pending` = actively executing on the miner; `succeed` = finished successfully; `failed` = finished with an error; `timed_out` = exceeded its execution deadline; `cancelled` = aborted before completion.
   */
  status: "created" | "queuing" | "pending" | "succeed" | "failed" | "timed_out" | "cancelled"
  /**
   * Task parameters
   */
  params: {
    [k: string]: unknown
  } | null
  /**
   * Task creation time
   */
  created_at: string
  /**
   * Time the task entered the Agent queue
   */
  queuing_at: string | null
  /**
   * Time execution started
   */
  pending_at: string | null
  /**
   * Time execution succeeded
   */
  succeed_at: string | null
  /**
   * Time execution failed
   */
  failed_at: string | null
  /**
   * Time execution timed out
   */
  timed_out_at: string | null
  /**
   * Time execution was cancelled
   */
  cancelled_at: string | null
  /**
   * Task result
   */
  result: {
    [k: string]: unknown
  } | null
  /**
   * Task error
   */
  error: {
    message: string
  } | null
  /**
   * Signed task log download URL
   */
  log_download_url: string | null
  /**
   * Task log size in bytes
   */
  log_file_size: number | null
}
export interface ListTaskBatchRecoveriesInput {
  workspace_id: string
  farm_id: string
  /**
   * Task Batch ID
   */
  task_batch_id: string
  page?: number
  page_size?: number
}
export interface ListTaskBatchRecoveriesOutput {
  success: true
  data: {
    /**
     * Task ID
     */
    task_id: string
    /**
     * Miner ID
     */
    miner_id: string
    /**
     * Task completion time
     */
    done_at: string
    /**
     * Snapshot before the reboot
     */
    before: {
      /**
       * Average hashrate in H/s
       */
      avg_hashrate: number | null
    }
    /**
     * Snapshot after the reboot
     */
    after: {
      /**
       * Average hashrate in H/s
       */
      avg_hashrate: number | null
    }
    /**
     * Recovery for this task. Null when the task has no linked reboot event, a hashrate snapshot is missing, or no hashprice exists for the completion day.
     */
    recovery: {
      /**
       * Recovered hashrate in H/s, max(after average - before average, 0). Averages use T-30 to T-5 minutes before and T+15 to T+60 minutes after the reboot.
       */
      hashrate: number
      /**
       * Estimated 24-hour revenue in USD from the recovered hashrate at the hashprice of the task completion day. This is a projection, not realized income.
       */
      revenue_24h_usd: number
      /**
       * Hashprice in USD per PH/s per day on the completion day
       */
      hashprice_usd: number
    } | null
  }[]
  pagination: {
    total: number
    page: number
    page_size: number
    total_pages: number
  }
  error: null
}
export interface CreateRebootTaskBatchInput {
  workspace_id: string
  farm_id: string
  /**
   * Miner IDs to target
   */
  miner_ids: string[]
  /**
   * Reboot parameters.
   */
  params?: {
    /**
     * Force reboot
     */
    force?: boolean
  }
}
export interface CreateRebootTaskBatchOutput {
  success: true
  data: CreateTaskBatchResult
  error: null
}
/**
 * Result of a task batch creation.
 */
export interface CreateTaskBatchResult {
  /**
   * Created task batches
   */
  batches: {
    /**
     * Task Batch ID
     */
    id: string
    /**
     * Task or event type dispatched to miners or agents. Execution types: `miner.system.reboot`, `miner.log.get`, `miner.light.update`, `miner.power_mode.update`, `miner.pool.update`, `miner.pool.lock`, `miner.firmware.update`, `agent.scan.create`, `agent.ip_diagnosis.create`, `agent.self.update`, `agent.pause`, `agent.resume`, `agent.ip_report.start`, `agent.ip_report.stop`, `agent.miner.refresh`. Event types: `miner.tags.update`, `miner.record.delete`, `miner.rack_location.update`.
     */
    task_name:
      | "agent.scan.create"
      | "agent.ip_diagnosis.create"
      | "agent.self.update"
      | "agent.pause"
      | "agent.resume"
      | "agent.ip_report.start"
      | "agent.ip_report.stop"
      | "agent.miner.refresh"
      | "miner.system.reboot"
      | "miner.log.get"
      | "miner.light.update"
      | "miner.power_mode.update"
      | "miner.pool.update"
      | "miner.pool.lock"
      | "miner.firmware.update"
      | "miner.network.update"
      | "miner.tags.update"
      | "miner.record.delete"
      | "miner.rack_location.update"
    /**
     * Tasks created in this batch
     */
    task_count: number
    /**
     * Batch parameters
     */
    task_params: {
      [k: string]: unknown
    } | null
    /**
     * Batch metadata
     */
    metadata: {
      [k: string]: unknown
    } | null
    created_by: Actor
    /**
     * Batch creation time
     */
    created_at: string
  }[]
  summary: {
    /**
     * Miners with tasks created
     */
    created_count: number
    /**
     * Miners skipped
     */
    skipped_count: number
    /**
     * Miners that failed to process
     */
    failed_count: number
  }
  /**
   * Skipped miners grouped by reason
   */
  skipped?: {
    /**
     * Reason a miner was skipped during task batch creation. `no_change` = miner is already in the requested state; `unsupported_mode` = miner hardware does not support the requested mode; `miner_not_found` = miner id was not found in the workspace or farm; `unstable_miner` = miner row is flagged unstable and cannot accept actions.
     */
    reason: "no_change" | "unsupported_mode" | "miner_not_found" | "unstable_miner"
    /**
     * Human-readable skip explanation
     */
    message: string
    /**
     * Affected miner IDs
     */
    miner_ids: string[]
  }[]
}
export interface CreateFirmwareUpdateTaskBatchInput {
  workspace_id: string
  farm_id: string
  /**
   * Miner IDs to target
   */
  miner_ids: string[]
  /**
   * Firmware update parameters.
   */
  params: {
    /**
     * Firmware binary download URL
     */
    firmware_url: string
    /**
     * MD5 checksum of the firmware binary
     */
    md5?: string
    /**
     * Firmware version label
     */
    firmware_version?: string
  }
}
export interface CreateFirmwareUpdateTaskBatchOutput {
  success: true
  data: CreateTaskBatchResult
  error: null
}
export interface CreatePoolLockTaskBatchInput {
  workspace_id: string
  farm_id: string
  /**
   * Miner IDs to target
   */
  miner_ids: string[]
  /**
   * Pool lock parameters.
   */
  params: {
    /**
     * Pool authentication package URL
     */
    auth_url: string
    /**
     * Pool lock action
     */
    action: "lock" | "unlock"
  }
}
export interface CreatePoolLockTaskBatchOutput {
  success: true
  data: CreateTaskBatchResult
  error: null
}
export interface CreateMiningModeUpdateTaskBatchInput {
  workspace_id: string
  farm_id: string
  /**
   * Miner IDs to target
   */
  miner_ids: string[]
  /**
   * Mining mode parameters.
   */
  params: {
    /**
     * Target mining performance mode
     */
    mining_mode:
      | (
          | "low"
          | "normal"
          | "high"
          | "sleep"
          | "J/T 19.0, Hashrate ~125TH/s"
          | "J/T 20.0, Hashrate ~135TH/s"
          | "J/T 21.0, Hashrate ~145TH/s"
          | "J/T 21.5, Hashrate ~155TH/s"
          | "J/T 22.0, Hashrate ~165TH/s"
          | "J/T 22.5, Hashrate ~170TH/s"
          | "J/T 23.0, Hashrate ~175TH/s"
          | "5600W"
          | "5800W"
          | "6000W"
          | "6200W"
          | "6400W"
          | "6600W"
        )
      | string
  }
}
export interface CreateMiningModeUpdateTaskBatchOutput {
  success: true
  data: CreateTaskBatchResult
  error: null
}
export interface CreateLightUpdateTaskBatchInput {
  workspace_id: string
  farm_id: string
  /**
   * Miner IDs to target
   */
  miner_ids: string[]
  /**
   * Light update parameters.
   */
  params: {
    /**
     * Indicator LED mode
     */
    mode: "on" | "off"
  }
}
export interface CreateLightUpdateTaskBatchOutput {
  success: true
  data: CreateTaskBatchResult
  error: null
}
export interface CreateLogGetTaskBatchInput {
  workspace_id: string
  farm_id: string
  /**
   * Miner IDs to target
   */
  miner_ids: string[]
}
export interface CreateLogGetTaskBatchOutput {
  success: true
  data: CreateTaskBatchResult
  error: null
}
export interface CreateTagsUpdateTaskBatchInput {
  workspace_id: string
  farm_id: string
  /**
   * Miner IDs to target
   */
  miner_ids: string[]
  /**
   * Tag update parameters.
   */
  params: {
    /**
     * Tags to add
     */
    add?: string[]
    /**
     * Tags to remove
     */
    remove?: string[]
  }
}
export interface CreateTagsUpdateTaskBatchOutput {
  success: true
  data: CreateTaskBatchResult
  error: null
}
export interface CreateNetworkUpdateTaskBatchInput {
  workspace_id: string
  farm_id: string
  /**
   * Per-miner address configuration.
   */
  updates: {
    /**
     * Miner ID
     */
    miner_id: string
    /**
     * How the miner should get its address. `static` needs ip, netmask, gateway and dns; `dhcp` takes no address fields.
     */
    mode: "static" | "dhcp"
    /**
     * Address to set, static only. Must be an IPv4 host address on the same subnet as the gateway, not the network or broadcast address of that subnet.
     */
    ip?: string
    /**
     * Subnet mask to set, static only. A run of ones followed by a run of zeros, between /8 and /30.
     */
    netmask?: string
    /**
     * Gateway to set, static only. Held to the same host rules as ip, and must differ from it.
     */
    gateway?: string
    /**
     * DNS server to set, static only. One IPv4 address.
     */
    dns?: string
  }[]
}
export interface CreateNetworkUpdateTaskBatchOutput {
  success: true
  /**
   * Result of a task batch creation.
   */
  data: {
    /**
     * Created task batches
     */
    batches: {
      /**
       * Task Batch ID
       */
      id: string
      /**
       * Task or event type dispatched to miners or agents. Execution types: `miner.system.reboot`, `miner.log.get`, `miner.light.update`, `miner.power_mode.update`, `miner.pool.update`, `miner.pool.lock`, `miner.firmware.update`, `agent.scan.create`, `agent.ip_diagnosis.create`, `agent.self.update`, `agent.pause`, `agent.resume`, `agent.ip_report.start`, `agent.ip_report.stop`, `agent.miner.refresh`. Event types: `miner.tags.update`, `miner.record.delete`, `miner.rack_location.update`.
       */
      task_name:
        | "agent.scan.create"
        | "agent.ip_diagnosis.create"
        | "agent.self.update"
        | "agent.pause"
        | "agent.resume"
        | "agent.ip_report.start"
        | "agent.ip_report.stop"
        | "agent.miner.refresh"
        | "miner.system.reboot"
        | "miner.log.get"
        | "miner.light.update"
        | "miner.power_mode.update"
        | "miner.pool.update"
        | "miner.pool.lock"
        | "miner.firmware.update"
        | "miner.network.update"
        | "miner.tags.update"
        | "miner.record.delete"
        | "miner.rack_location.update"
      /**
       * Tasks created in this batch
       */
      task_count: number
      /**
       * Batch parameters
       */
      task_params: {
        [k: string]: unknown
      } | null
      /**
       * Batch metadata
       */
      metadata: {
        [k: string]: unknown
      } | null
      /**
       * Represents an entity that performs actions in the system (user, API key, or system)
       */
      created_by: {
        /**
         * The type of actor
         */
        type: "user" | "apikey" | "system"
        /**
         * The unique identifier of the actor
         */
        id: string
        /**
         * The display name of the actor
         */
        name: string | null
        /**
         * The avatar URL of the actor
         */
        avatar: string | null
        /**
         * Additional metadata about the actor
         */
        metadata?: {
          [k: string]: unknown
        }
      } | null
      /**
       * Batch creation time
       */
      created_at: string
    }[]
    summary: {
      /**
       * Miners with tasks created
       */
      created_count: number
      /**
       * Miners skipped
       */
      skipped_count: number
      /**
       * Miners that failed to process
       */
      failed_count: number
    }
    /**
     * Skipped miners grouped by reason
     */
    skipped?: {
      /**
       * Reason a miner was skipped during task batch creation. `no_change` = miner is already in the requested state; `unsupported_mode` = miner hardware does not support the requested mode; `miner_not_found` = miner id was not found in the workspace or farm; `unstable_miner` = miner row is flagged unstable and cannot accept actions.
       */
      reason: "no_change" | "unsupported_mode" | "miner_not_found" | "unstable_miner"
      /**
       * Human-readable skip explanation
       */
      message: string
      /**
       * Affected miner IDs
       */
      miner_ids: string[]
    }[]
  }
  error: null
}
export interface CreateRecordDeleteTaskBatchInput {
  workspace_id: string
  farm_id: string
  /**
   * Miner IDs to target
   */
  miner_ids: string[]
  /**
   * Record delete parameters.
   */
  params?: {
    /**
     * Deletion comment
     */
    comment?: string
  }
}
export interface CreateRecordDeleteTaskBatchOutput {
  success: true
  data: CreateTaskBatchResult
  error: null
}
export interface CreateAgentScanTaskBatchInput {
  workspace_id: string
  farm_id: string
  /**
   * Agent scan parameters.
   */
  params: {
    /**
     * IP ranges to scan. If omitted, agent scans all configured ranges.
     */
    ip_ranges?: {
      /**
       * IP range record ID
       */
      id: string
      /**
       * IP range in CIDR notation
       */
      range: string
      /**
       * Legacy field, kept for compatibility
       */
      auto_scan?: boolean
    }[]
  }
}
export interface CreateAgentScanTaskBatchOutput {
  success: true
  data: CreateTaskBatchResult
  error: null
}
export interface CreateAgentIpDiagnosisTaskBatchInput {
  workspace_id: string
  farm_id: string
  /**
   * IP diagnosis parameters.
   */
  params: {
    /**
     * Diagnosis target scope. custom_only uses only custom targets; known_with_custom merges agent known IPs and custom targets; known_only uses only agent known IPs.
     */
    target_scope?: "custom_only" | "known_with_custom" | "known_only"
    /**
     * Custom diagnosis targets
     */
    custom_targets?: {
      /**
       * Optional custom target identifier
       */
      id?: string
      /**
       * Optional custom target label
       */
      label?: string
      /**
       * IPv4 address, CIDR, or hyphen range to diagnose
       */
      value: string
    }[]
    /**
     * Only perform ICMP ping checks
     */
    ping_only?: boolean
  }
}
export interface CreateAgentIpDiagnosisTaskBatchOutput {
  success: true
  data: CreateTaskBatchResult
  error: null
}
export interface CreateAgentSelfUpdateTaskBatchInput {
  workspace_id: string
  farm_id: string
  /**
   * Agent self-update parameters.
   */
  params: {
    /**
     * Agent binary download URL. Defaults to a signed build.
     */
    binary_url?: string
    /**
     * Legacy MD5 checksum
     */
    md5?: string
    /**
     * Ed25519 detached signature of the agent binary
     */
    signature?: string
    /**
     * Target agent version
     */
    target_version?: string
  }
}
export interface CreateAgentSelfUpdateTaskBatchOutput {
  success: true
  data: CreateTaskBatchResult
  error: null
}
export interface CreateAgentPauseTaskBatchInput {
  workspace_id: string
  farm_id: string
}
export interface CreateAgentPauseTaskBatchOutput {
  success: true
  data: CreateTaskBatchResult
  error: null
}
export interface CreateAgentResumeTaskBatchInput {
  workspace_id: string
  farm_id: string
}
export interface CreateAgentResumeTaskBatchOutput {
  success: true
  data: CreateTaskBatchResult
  error: null
}
export interface ListWebhookEndpointsInput {
  workspace_id: string
  page?: number
  page_size?: number
}
export interface ListWebhookEndpointsOutput {
  success: true
  data: {
    id: string
    workspace_id: string
    /**
     * Workspace member who owns the endpoint
     */
    owner_id: string
    name: string
    /**
     * Host of the URL; the full URL is never returned
     */
    url_host: string
    event_types: (
      | "agent_offline.alert_entered"
      | "agent_offline.recovered"
      | "hashrate_drop.alert_entered"
      | "hashrate_drop.recovered"
      | "hashrate_drop.ended"
    )[]
    /**
     * Farms to receive alerts for: {"type": "all"} for every farm you can access, including later ones, or {"type": "selected", "farm_ids": [...]}
     */
    farms:
      | {
          type: "all"
        }
      | {
          type: "selected"
          farm_ids: string[]
        }
    /**
     * failing: recent deliveries failed after all retries; disabled: delivery is stopped
     */
    status: "enabled" | "failing" | "disabled"
    /**
     * persistent_failures: deliveries kept failing after all retries for several days
     */
    disabled_reason: ("persistent_failures" | "manual") | null
    /**
     * Deliveries that failed after all retries in a row
     */
    consecutive_failures: number
    /**
     * When the current run of failures began; any successful delivery clears it
     */
    first_failure_at: string | null
    last_success_at: string | null
    last_failure_at: string | null
    /**
     * For example http_500, timeout, address_blocked
     */
    last_failure_reason: string | null
    created_at: string
    updated_at: string
  }[]
  pagination: {
    total: number
    page: number
    page_size: number
    total_pages: number
  }
  error: null
}
export interface CreateWebhookEndpointInput {
  workspace_id: string
  /**
   * Name shown to the owner
   */
  name: string
  /**
   * HTTPS URL that receives signed POST requests; must resolve to public addresses
   */
  url: string
  /**
   * Events delivered to the endpoint, for example ["hashrate_drop.alert_entered"] for alerts only. recovered or ended requires alert_entered of the same monitor type.
   */
  event_types: (
    | "agent_offline.alert_entered"
    | "agent_offline.recovered"
    | "hashrate_drop.alert_entered"
    | "hashrate_drop.recovered"
    | "hashrate_drop.ended"
  )[]
  /**
   * Farms to receive alerts for: {"type": "all"} for every farm you can access, including later ones, or {"type": "selected", "farm_ids": [...]}
   */
  farms:
    | {
        type: "all"
      }
    | {
        type: "selected"
        farm_ids: string[]
      }
}
export interface CreateWebhookEndpointOutput {
  success: true
  data: {
    id: string
    workspace_id: string
    /**
     * Workspace member who owns the endpoint
     */
    owner_id: string
    name: string
    /**
     * Host of the URL; the full URL is never returned
     */
    url_host: string
    event_types: (
      | "agent_offline.alert_entered"
      | "agent_offline.recovered"
      | "hashrate_drop.alert_entered"
      | "hashrate_drop.recovered"
      | "hashrate_drop.ended"
    )[]
    /**
     * Farms to receive alerts for: {"type": "all"} for every farm you can access, including later ones, or {"type": "selected", "farm_ids": [...]}
     */
    farms:
      | {
          type: "all"
        }
      | {
          type: "selected"
          farm_ids: string[]
        }
    /**
     * failing: recent deliveries failed after all retries; disabled: delivery is stopped
     */
    status: "enabled" | "failing" | "disabled"
    /**
     * persistent_failures: deliveries kept failing after all retries for several days
     */
    disabled_reason: ("persistent_failures" | "manual") | null
    /**
     * Deliveries that failed after all retries in a row
     */
    consecutive_failures: number
    /**
     * When the current run of failures began; any successful delivery clears it
     */
    first_failure_at: string | null
    last_success_at: string | null
    last_failure_at: string | null
    /**
     * For example http_500, timeout, address_blocked
     */
    last_failure_reason: string | null
    created_at: string
    updated_at: string
    /**
     * Standard Webhooks signing secret (whsec_...). Returned only here; store it now.
     */
    secret: string
  }
  error: null
}
export interface GetWebhookEndpointInput {
  workspace_id: string
  endpoint_id: string
}
export interface GetWebhookEndpointOutput {
  success: true
  data: {
    id: string
    workspace_id: string
    /**
     * Workspace member who owns the endpoint
     */
    owner_id: string
    name: string
    /**
     * Host of the URL; the full URL is never returned
     */
    url_host: string
    event_types: (
      | "agent_offline.alert_entered"
      | "agent_offline.recovered"
      | "hashrate_drop.alert_entered"
      | "hashrate_drop.recovered"
      | "hashrate_drop.ended"
    )[]
    /**
     * Farms to receive alerts for: {"type": "all"} for every farm you can access, including later ones, or {"type": "selected", "farm_ids": [...]}
     */
    farms:
      | {
          type: "all"
        }
      | {
          type: "selected"
          farm_ids: string[]
        }
    /**
     * failing: recent deliveries failed after all retries; disabled: delivery is stopped
     */
    status: "enabled" | "failing" | "disabled"
    /**
     * persistent_failures: deliveries kept failing after all retries for several days
     */
    disabled_reason: ("persistent_failures" | "manual") | null
    /**
     * Deliveries that failed after all retries in a row
     */
    consecutive_failures: number
    /**
     * When the current run of failures began; any successful delivery clears it
     */
    first_failure_at: string | null
    last_success_at: string | null
    last_failure_at: string | null
    /**
     * For example http_500, timeout, address_blocked
     */
    last_failure_reason: string | null
    created_at: string
    updated_at: string
  }
  error: null
}
export interface UpdateWebhookEndpointInput {
  workspace_id: string
  endpoint_id: string
  /**
   * Name shown to the owner
   */
  name?: string
  /**
   * HTTPS URL that receives signed POST requests; must resolve to public addresses
   */
  url?: string
  /**
   * Events delivered to the endpoint, for example ["hashrate_drop.alert_entered"] for alerts only. recovered or ended requires alert_entered of the same monitor type.
   */
  event_types?: (
    | "agent_offline.alert_entered"
    | "agent_offline.recovered"
    | "hashrate_drop.alert_entered"
    | "hashrate_drop.recovered"
    | "hashrate_drop.ended"
  )[]
  /**
   * Farms to receive alerts for: {"type": "all"} for every farm you can access, including later ones, or {"type": "selected", "farm_ids": [...]}
   */
  farms?:
    | {
        type: "all"
      }
    | {
        type: "selected"
        farm_ids: string[]
      }
  /**
   * false stops delivery; true resumes delivery, including after automatic disabling
   */
  enabled?: boolean
}
export interface UpdateWebhookEndpointOutput {
  success: true
  data: {
    id: string
    workspace_id: string
    /**
     * Workspace member who owns the endpoint
     */
    owner_id: string
    name: string
    /**
     * Host of the URL; the full URL is never returned
     */
    url_host: string
    event_types: (
      | "agent_offline.alert_entered"
      | "agent_offline.recovered"
      | "hashrate_drop.alert_entered"
      | "hashrate_drop.recovered"
      | "hashrate_drop.ended"
    )[]
    /**
     * Farms to receive alerts for: {"type": "all"} for every farm you can access, including later ones, or {"type": "selected", "farm_ids": [...]}
     */
    farms:
      | {
          type: "all"
        }
      | {
          type: "selected"
          farm_ids: string[]
        }
    /**
     * failing: recent deliveries failed after all retries; disabled: delivery is stopped
     */
    status: "enabled" | "failing" | "disabled"
    /**
     * persistent_failures: deliveries kept failing after all retries for several days
     */
    disabled_reason: ("persistent_failures" | "manual") | null
    /**
     * Deliveries that failed after all retries in a row
     */
    consecutive_failures: number
    /**
     * When the current run of failures began; any successful delivery clears it
     */
    first_failure_at: string | null
    last_success_at: string | null
    last_failure_at: string | null
    /**
     * For example http_500, timeout, address_blocked
     */
    last_failure_reason: string | null
    created_at: string
    updated_at: string
  }
  error: null
}
export interface DeleteWebhookEndpointInput {
  workspace_id: string
  endpoint_id: string
}
export interface DeleteWebhookEndpointOutput {
  success: true
  data: {
    id: string
    workspace_id: string
    /**
     * Workspace member who owns the endpoint
     */
    owner_id: string
    name: string
    /**
     * Host of the URL; the full URL is never returned
     */
    url_host: string
    event_types: (
      | "agent_offline.alert_entered"
      | "agent_offline.recovered"
      | "hashrate_drop.alert_entered"
      | "hashrate_drop.recovered"
      | "hashrate_drop.ended"
    )[]
    /**
     * Farms to receive alerts for: {"type": "all"} for every farm you can access, including later ones, or {"type": "selected", "farm_ids": [...]}
     */
    farms:
      | {
          type: "all"
        }
      | {
          type: "selected"
          farm_ids: string[]
        }
    /**
     * failing: recent deliveries failed after all retries; disabled: delivery is stopped
     */
    status: "enabled" | "failing" | "disabled"
    /**
     * persistent_failures: deliveries kept failing after all retries for several days
     */
    disabled_reason: ("persistent_failures" | "manual") | null
    /**
     * Deliveries that failed after all retries in a row
     */
    consecutive_failures: number
    /**
     * When the current run of failures began; any successful delivery clears it
     */
    first_failure_at: string | null
    last_success_at: string | null
    last_failure_at: string | null
    /**
     * For example http_500, timeout, address_blocked
     */
    last_failure_reason: string | null
    created_at: string
    updated_at: string
  }
  error: null
}
export interface NonceCallOptions {
  signal?: AbortSignal
  timeoutMs?: number
}

export type NonceReadonlyCallOptions = NonceCallOptions

export interface NonceDestructiveCallOptions extends NonceCallOptions {
  confirmDestructive: true
  confirmation: string
}

export interface NonceClientOptions {
  allowDestructive?: boolean
  profile?: string
}

export interface NonceClient {
  close(): Promise<void>
  listWorkspaces(input?: ListWorkspacesInput, options?: NonceReadonlyCallOptions): Promise<ListWorkspacesOutput>
  getBitcoinMetrics(input?: GetBitcoinMetricsInput, options?: NonceReadonlyCallOptions): Promise<GetBitcoinMetricsOutput>
  queryBitcoinMetrics(input: QueryBitcoinMetricsInput, options?: NonceReadonlyCallOptions): Promise<QueryBitcoinMetricsOutput>
  listFarms(input: ListFarmsInput, options?: NonceReadonlyCallOptions): Promise<ListFarmsOutput>
  getFarm(input: GetFarmInput, options?: NonceReadonlyCallOptions): Promise<GetFarmOutput>
  listAgents(input: ListAgentsInput, options?: NonceReadonlyCallOptions): Promise<ListAgentsOutput>
  getAgent(input: GetAgentInput, options?: NonceReadonlyCallOptions): Promise<GetAgentOutput>
  listAutomations(input: ListAutomationsInput, options?: NonceReadonlyCallOptions): Promise<ListAutomationsOutput>
  queryAutomationMetrics(input: QueryAutomationMetricsInput, options?: NonceReadonlyCallOptions): Promise<QueryAutomationMetricsOutput>
  listAutomationTasks(input: ListAutomationTasksInput, options?: NonceReadonlyCallOptions): Promise<ListAutomationTasksOutput>
  listMiners(input: ListMinersInput, options?: NonceReadonlyCallOptions): Promise<ListMinersOutput>
  searchMiners(input: SearchMinersInput, options?: NonceReadonlyCallOptions): Promise<SearchMinersOutput>
  getMiner(input: GetMinerInput, options?: NonceReadonlyCallOptions): Promise<GetMinerOutput>
  listRacks(input: ListRacksInput, options?: NonceReadonlyCallOptions): Promise<ListRacksOutput>
  listMinerRebootTasks(input: ListMinerRebootTasksInput, options?: NonceReadonlyCallOptions): Promise<ListMinerRebootTasksOutput>
  listMinerTasks(input: ListMinerTasksInput, options?: NonceReadonlyCallOptions): Promise<ListMinerTasksOutput>
  queryMinerMetrics(input: QueryMinerMetricsInput, options?: NonceReadonlyCallOptions): Promise<QueryMinerMetricsOutput>
  queryFarmMetrics(input: QueryFarmMetricsInput, options?: NonceReadonlyCallOptions): Promise<QueryFarmMetricsOutput>
  queryFarmHashrateComparisonMetrics(input: QueryFarmHashrateComparisonMetricsInput, options?: NonceReadonlyCallOptions): Promise<QueryFarmHashrateComparisonMetricsOutput>
  queryFarmMinerMetrics(input: QueryFarmMinerMetricsInput, options?: NonceReadonlyCallOptions): Promise<QueryFarmMinerMetricsOutput>
  queryFarmAccountMetrics(input: QueryFarmAccountMetricsInput, options?: NonceReadonlyCallOptions): Promise<QueryFarmAccountMetricsOutput>
  queryFarmMonitorEventMetrics(input: QueryFarmMonitorEventMetricsInput, options?: NonceReadonlyCallOptions): Promise<QueryFarmMonitorEventMetricsOutput>
  searchFarmMonitorEvents(input: SearchFarmMonitorEventsInput, options?: NonceReadonlyCallOptions): Promise<SearchFarmMonitorEventsOutput>
  listRackGroups(input: ListRackGroupsInput, options?: NonceReadonlyCallOptions): Promise<ListRackGroupsOutput>
  updateRackGroups(input: UpdateRackGroupsInput, options: NonceDestructiveCallOptions): Promise<UpdateRackGroupsOutput>
  listRackGroupTemplates(input: ListRackGroupTemplatesInput, options?: NonceReadonlyCallOptions): Promise<ListRackGroupTemplatesOutput>
  createRackGroupTemplate(input: CreateRackGroupTemplateInput, options: NonceDestructiveCallOptions): Promise<CreateRackGroupTemplateOutput>
  updateRackGroupTemplate(input: UpdateRackGroupTemplateInput, options: NonceDestructiveCallOptions): Promise<UpdateRackGroupTemplateOutput>
  deleteRackGroupTemplate(input: DeleteRackGroupTemplateInput, options: NonceDestructiveCallOptions): Promise<DeleteRackGroupTemplateOutput>
  getFarmLayout(input: GetFarmLayoutInput, options?: NonceReadonlyCallOptions): Promise<GetFarmLayoutOutput>
  updateFarmLayout(input: UpdateFarmLayoutInput, options: NonceDestructiveCallOptions): Promise<UpdateFarmLayoutOutput>
  listFarmRebootEvents(input: ListFarmRebootEventsInput, options?: NonceReadonlyCallOptions): Promise<ListFarmRebootEventsOutput>
  listMinerRebootEvents(input: ListMinerRebootEventsInput, options?: NonceReadonlyCallOptions): Promise<ListMinerRebootEventsOutput>
  listTaskBatches(input: ListTaskBatchesInput, options?: NonceReadonlyCallOptions): Promise<ListTaskBatchesOutput>
  searchTaskBatches(input: SearchTaskBatchesInput, options?: NonceReadonlyCallOptions): Promise<SearchTaskBatchesOutput>
  getTaskBatch(input: GetTaskBatchInput, options?: NonceReadonlyCallOptions): Promise<GetTaskBatchOutput>
  listTaskBatchTasks(input: ListTaskBatchTasksInput, options?: NonceReadonlyCallOptions): Promise<ListTaskBatchTasksOutput>
  listTaskBatchRecoveries(input: ListTaskBatchRecoveriesInput, options?: NonceReadonlyCallOptions): Promise<ListTaskBatchRecoveriesOutput>
  createRebootTaskBatch(input: CreateRebootTaskBatchInput, options: NonceDestructiveCallOptions): Promise<CreateRebootTaskBatchOutput>
  createFirmwareUpdateTaskBatch(input: CreateFirmwareUpdateTaskBatchInput, options: NonceDestructiveCallOptions): Promise<CreateFirmwareUpdateTaskBatchOutput>
  createPoolLockTaskBatch(input: CreatePoolLockTaskBatchInput, options: NonceDestructiveCallOptions): Promise<CreatePoolLockTaskBatchOutput>
  createMiningModeUpdateTaskBatch(input: CreateMiningModeUpdateTaskBatchInput, options: NonceDestructiveCallOptions): Promise<CreateMiningModeUpdateTaskBatchOutput>
  createLightUpdateTaskBatch(input: CreateLightUpdateTaskBatchInput, options: NonceDestructiveCallOptions): Promise<CreateLightUpdateTaskBatchOutput>
  createLogGetTaskBatch(input: CreateLogGetTaskBatchInput, options: NonceDestructiveCallOptions): Promise<CreateLogGetTaskBatchOutput>
  createTagsUpdateTaskBatch(input: CreateTagsUpdateTaskBatchInput, options: NonceDestructiveCallOptions): Promise<CreateTagsUpdateTaskBatchOutput>
  createNetworkUpdateTaskBatch(input: CreateNetworkUpdateTaskBatchInput, options: NonceDestructiveCallOptions): Promise<CreateNetworkUpdateTaskBatchOutput>
  createRecordDeleteTaskBatch(input: CreateRecordDeleteTaskBatchInput, options: NonceDestructiveCallOptions): Promise<CreateRecordDeleteTaskBatchOutput>
  createAgentScanTaskBatch(input: CreateAgentScanTaskBatchInput, options: NonceDestructiveCallOptions): Promise<CreateAgentScanTaskBatchOutput>
  createAgentIpDiagnosisTaskBatch(input: CreateAgentIpDiagnosisTaskBatchInput, options: NonceDestructiveCallOptions): Promise<CreateAgentIpDiagnosisTaskBatchOutput>
  createAgentSelfUpdateTaskBatch(input: CreateAgentSelfUpdateTaskBatchInput, options: NonceDestructiveCallOptions): Promise<CreateAgentSelfUpdateTaskBatchOutput>
  createAgentPauseTaskBatch(input: CreateAgentPauseTaskBatchInput, options: NonceDestructiveCallOptions): Promise<CreateAgentPauseTaskBatchOutput>
  createAgentResumeTaskBatch(input: CreateAgentResumeTaskBatchInput, options: NonceDestructiveCallOptions): Promise<CreateAgentResumeTaskBatchOutput>
  listWebhookEndpoints(input: ListWebhookEndpointsInput, options?: NonceReadonlyCallOptions): Promise<ListWebhookEndpointsOutput>
  createWebhookEndpoint(input: CreateWebhookEndpointInput, options: NonceDestructiveCallOptions): Promise<CreateWebhookEndpointOutput>
  getWebhookEndpoint(input: GetWebhookEndpointInput, options?: NonceReadonlyCallOptions): Promise<GetWebhookEndpointOutput>
  updateWebhookEndpoint(input: UpdateWebhookEndpointInput, options: NonceDestructiveCallOptions): Promise<UpdateWebhookEndpointOutput>
  deleteWebhookEndpoint(input: DeleteWebhookEndpointInput, options: NonceDestructiveCallOptions): Promise<DeleteWebhookEndpointOutput>
}

export declare function createNonceClient(options?: NonceClientOptions): Promise<NonceClient>

export interface NonceMethodSignatures {
  listWorkspaces: {
    destructive: false
    input: ListWorkspacesInput
    output: ListWorkspacesOutput
  }
  getBitcoinMetrics: {
    destructive: false
    input: GetBitcoinMetricsInput
    output: GetBitcoinMetricsOutput
  }
  queryBitcoinMetrics: {
    destructive: false
    input: QueryBitcoinMetricsInput
    output: QueryBitcoinMetricsOutput
  }
  listFarms: {
    destructive: false
    input: ListFarmsInput
    output: ListFarmsOutput
  }
  getFarm: {
    destructive: false
    input: GetFarmInput
    output: GetFarmOutput
  }
  listAgents: {
    destructive: false
    input: ListAgentsInput
    output: ListAgentsOutput
  }
  getAgent: {
    destructive: false
    input: GetAgentInput
    output: GetAgentOutput
  }
  listAutomations: {
    destructive: false
    input: ListAutomationsInput
    output: ListAutomationsOutput
  }
  queryAutomationMetrics: {
    destructive: false
    input: QueryAutomationMetricsInput
    output: QueryAutomationMetricsOutput
  }
  listAutomationTasks: {
    destructive: false
    input: ListAutomationTasksInput
    output: ListAutomationTasksOutput
  }
  listMiners: {
    destructive: false
    input: ListMinersInput
    output: ListMinersOutput
  }
  searchMiners: {
    destructive: false
    input: SearchMinersInput
    output: SearchMinersOutput
  }
  getMiner: {
    destructive: false
    input: GetMinerInput
    output: GetMinerOutput
  }
  listRacks: {
    destructive: false
    input: ListRacksInput
    output: ListRacksOutput
  }
  listMinerRebootTasks: {
    destructive: false
    input: ListMinerRebootTasksInput
    output: ListMinerRebootTasksOutput
  }
  listMinerTasks: {
    destructive: false
    input: ListMinerTasksInput
    output: ListMinerTasksOutput
  }
  queryMinerMetrics: {
    destructive: false
    input: QueryMinerMetricsInput
    output: QueryMinerMetricsOutput
  }
  queryFarmMetrics: {
    destructive: false
    input: QueryFarmMetricsInput
    output: QueryFarmMetricsOutput
  }
  queryFarmHashrateComparisonMetrics: {
    destructive: false
    input: QueryFarmHashrateComparisonMetricsInput
    output: QueryFarmHashrateComparisonMetricsOutput
  }
  queryFarmMinerMetrics: {
    destructive: false
    input: QueryFarmMinerMetricsInput
    output: QueryFarmMinerMetricsOutput
  }
  queryFarmAccountMetrics: {
    destructive: false
    input: QueryFarmAccountMetricsInput
    output: QueryFarmAccountMetricsOutput
  }
  queryFarmMonitorEventMetrics: {
    destructive: false
    input: QueryFarmMonitorEventMetricsInput
    output: QueryFarmMonitorEventMetricsOutput
  }
  searchFarmMonitorEvents: {
    destructive: false
    input: SearchFarmMonitorEventsInput
    output: SearchFarmMonitorEventsOutput
  }
  listRackGroups: {
    destructive: false
    input: ListRackGroupsInput
    output: ListRackGroupsOutput
  }
  updateRackGroups: {
    destructive: true
    input: UpdateRackGroupsInput
    output: UpdateRackGroupsOutput
  }
  listRackGroupTemplates: {
    destructive: false
    input: ListRackGroupTemplatesInput
    output: ListRackGroupTemplatesOutput
  }
  createRackGroupTemplate: {
    destructive: true
    input: CreateRackGroupTemplateInput
    output: CreateRackGroupTemplateOutput
  }
  updateRackGroupTemplate: {
    destructive: true
    input: UpdateRackGroupTemplateInput
    output: UpdateRackGroupTemplateOutput
  }
  deleteRackGroupTemplate: {
    destructive: true
    input: DeleteRackGroupTemplateInput
    output: DeleteRackGroupTemplateOutput
  }
  getFarmLayout: {
    destructive: false
    input: GetFarmLayoutInput
    output: GetFarmLayoutOutput
  }
  updateFarmLayout: {
    destructive: true
    input: UpdateFarmLayoutInput
    output: UpdateFarmLayoutOutput
  }
  listFarmRebootEvents: {
    destructive: false
    input: ListFarmRebootEventsInput
    output: ListFarmRebootEventsOutput
  }
  listMinerRebootEvents: {
    destructive: false
    input: ListMinerRebootEventsInput
    output: ListMinerRebootEventsOutput
  }
  listTaskBatches: {
    destructive: false
    input: ListTaskBatchesInput
    output: ListTaskBatchesOutput
  }
  searchTaskBatches: {
    destructive: false
    input: SearchTaskBatchesInput
    output: SearchTaskBatchesOutput
  }
  getTaskBatch: {
    destructive: false
    input: GetTaskBatchInput
    output: GetTaskBatchOutput
  }
  listTaskBatchTasks: {
    destructive: false
    input: ListTaskBatchTasksInput
    output: ListTaskBatchTasksOutput
  }
  listTaskBatchRecoveries: {
    destructive: false
    input: ListTaskBatchRecoveriesInput
    output: ListTaskBatchRecoveriesOutput
  }
  createRebootTaskBatch: {
    destructive: true
    input: CreateRebootTaskBatchInput
    output: CreateRebootTaskBatchOutput
  }
  createFirmwareUpdateTaskBatch: {
    destructive: true
    input: CreateFirmwareUpdateTaskBatchInput
    output: CreateFirmwareUpdateTaskBatchOutput
  }
  createPoolLockTaskBatch: {
    destructive: true
    input: CreatePoolLockTaskBatchInput
    output: CreatePoolLockTaskBatchOutput
  }
  createMiningModeUpdateTaskBatch: {
    destructive: true
    input: CreateMiningModeUpdateTaskBatchInput
    output: CreateMiningModeUpdateTaskBatchOutput
  }
  createLightUpdateTaskBatch: {
    destructive: true
    input: CreateLightUpdateTaskBatchInput
    output: CreateLightUpdateTaskBatchOutput
  }
  createLogGetTaskBatch: {
    destructive: true
    input: CreateLogGetTaskBatchInput
    output: CreateLogGetTaskBatchOutput
  }
  createTagsUpdateTaskBatch: {
    destructive: true
    input: CreateTagsUpdateTaskBatchInput
    output: CreateTagsUpdateTaskBatchOutput
  }
  createNetworkUpdateTaskBatch: {
    destructive: true
    input: CreateNetworkUpdateTaskBatchInput
    output: CreateNetworkUpdateTaskBatchOutput
  }
  createRecordDeleteTaskBatch: {
    destructive: true
    input: CreateRecordDeleteTaskBatchInput
    output: CreateRecordDeleteTaskBatchOutput
  }
  createAgentScanTaskBatch: {
    destructive: true
    input: CreateAgentScanTaskBatchInput
    output: CreateAgentScanTaskBatchOutput
  }
  createAgentIpDiagnosisTaskBatch: {
    destructive: true
    input: CreateAgentIpDiagnosisTaskBatchInput
    output: CreateAgentIpDiagnosisTaskBatchOutput
  }
  createAgentSelfUpdateTaskBatch: {
    destructive: true
    input: CreateAgentSelfUpdateTaskBatchInput
    output: CreateAgentSelfUpdateTaskBatchOutput
  }
  createAgentPauseTaskBatch: {
    destructive: true
    input: CreateAgentPauseTaskBatchInput
    output: CreateAgentPauseTaskBatchOutput
  }
  createAgentResumeTaskBatch: {
    destructive: true
    input: CreateAgentResumeTaskBatchInput
    output: CreateAgentResumeTaskBatchOutput
  }
  listWebhookEndpoints: {
    destructive: false
    input: ListWebhookEndpointsInput
    output: ListWebhookEndpointsOutput
  }
  createWebhookEndpoint: {
    destructive: true
    input: CreateWebhookEndpointInput
    output: CreateWebhookEndpointOutput
  }
  getWebhookEndpoint: {
    destructive: false
    input: GetWebhookEndpointInput
    output: GetWebhookEndpointOutput
  }
  updateWebhookEndpoint: {
    destructive: true
    input: UpdateWebhookEndpointInput
    output: UpdateWebhookEndpointOutput
  }
  deleteWebhookEndpoint: {
    destructive: true
    input: DeleteWebhookEndpointInput
    output: DeleteWebhookEndpointOutput
  }
}
