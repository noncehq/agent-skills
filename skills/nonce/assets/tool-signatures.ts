/* eslint-disable */
// Generated file. Do not edit by hand.
// Source of truth: checked Nonce method definitions; supplemental schemas only fill missing metadata.

export interface ListWorkspacesInput {}
export interface ListWorkspacesOutput {
  success: true
  data: {
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
    relations: ("member" | "grantee")[]
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
  }[]
  error: null
}
export interface GetBitcoinMetricsInput {}
export interface GetBitcoinMetricsOutput {
  success: true
  data: {
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
     * Snapshot timestamp
     */
    timestamp: string
  }
  error: null
}
export interface QueryBitcoinMetricsInput {
  /**
   * Inclusive start of the query range in ISO 8601 format
   */
  from: string
  /**
   * Exclusive end of the query range in ISO 8601 format
   */
  to: string
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
    from: string
    /**
     * Exclusive end of the query range
     */
    to: string
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
  }[]
  pagination: {
    total: number
    page: number
    page_size: number
    total_pages: number
  }
  error: null
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
  }[]
  pagination: {
    total: number
    page: number
    page_size: number
    total_pages: number
  }
  error: null
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
      [k: string]: unknown
    } | null
  }
  error: null
}
export interface ListMinersInput {
  workspace_id: string
  farm_id: string
  page?: number
  page_size?: number
}
export interface ListMinersOutput {
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
      [k: string]: unknown
    } | null
    /**
     * Matched hardware submodel
     */
    submodel: string | null
    /**
     * Theoretical hashrate in H/s
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
     * Task or event type dispatched to miners or agents. Execution types: `miner.system.reboot`, `miner.log.get`, `miner.light.update`, `miner.power_mode.update`, `miner.pool.update`, `miner.pool.lock`, `miner.firmware.update`, `agent.scan.create`, `agent.ip_diagnosis.create`, `agent.self.update`. Event types: `miner.tags.update`, `miner.record.delete`, `miner.rack_location.update`.
     */
    task_name:
      | "agent.scan.create"
      | "agent.ip_diagnosis.create"
      | "agent.self.update"
      | "miner.system.reboot"
      | "miner.log.get"
      | "miner.light.update"
      | "miner.power_mode.update"
      | "miner.pool.update"
      | "miner.pool.lock"
      | "miner.firmware.update"
      | "miner.tags.update"
      | "miner.record.delete"
      | "miner.rack_location.update"
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
      [k: string]: unknown
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
    | "miner.system.reboot"
    | "miner.log.get"
    | "miner.light.update"
    | "miner.power_mode.update"
    | "miner.pool.update"
    | "miner.pool.lock"
    | "miner.firmware.update"
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
     * Task or event type dispatched to miners or agents. Execution types: `miner.system.reboot`, `miner.log.get`, `miner.light.update`, `miner.power_mode.update`, `miner.pool.update`, `miner.pool.lock`, `miner.firmware.update`, `agent.scan.create`, `agent.ip_diagnosis.create`, `agent.self.update`. Event types: `miner.tags.update`, `miner.record.delete`, `miner.rack_location.update`.
     */
    task_name:
      | "agent.scan.create"
      | "agent.ip_diagnosis.create"
      | "agent.self.update"
      | "miner.system.reboot"
      | "miner.log.get"
      | "miner.light.update"
      | "miner.power_mode.update"
      | "miner.pool.update"
      | "miner.pool.lock"
      | "miner.firmware.update"
      | "miner.tags.update"
      | "miner.record.delete"
      | "miner.rack_location.update"
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
      [k: string]: unknown
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
  from: string
  /**
   * Exclusive end of the query range in ISO 8601 format
   */
  to: string
  /**
   * Time resolution of the returned metric snapshots. Range limits: 1 day for 10min, 7 days for hour, 90 days for day, 365 days for week. All buckets in the range are always present; buckets without data contain null metric values.
   */
  granularity?: "10min" | "hour" | "day" | "week"
}
export interface QueryMinerMetricsOutput {
  success: true
  data: {
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
    snapshots: {
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
    }[]
  }
  error: null
}
export interface QueryFarmMetricsInput {
  workspace_id: string
  farm_id: string
  /**
   * Inclusive start of the query range in ISO 8601 format
   */
  from: string
  /**
   * Exclusive end of the query range in ISO 8601 format
   */
  to: string
  /**
   * Time resolution of the returned metric snapshots. Range limits: 1 day for 10min, 7 days for hour, 90 days for day, 365 days for week. All buckets in the range are always present; buckets without data contain null metric values.
   */
  granularity?: "10min" | "hour" | "day" | "week"
}
export interface QueryFarmMetricsOutput {
  success: true
  data: {
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
    snapshots: {
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
    }[]
  }
  error: null
}
export interface QueryFarmMinerMetricsInput {
  workspace_id: string
  farm_id: string
}
export interface QueryFarmMinerMetricsOutput {
  success: true
  /**
   * Real-time aggregate miner classification and distribution snapshot for a farm.
   */
  data: {
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
      unknown: {
        count: number
        also_has: {
          [k: string]: unknown
        }
      }
    }
    /**
     * Online miner distribution by mining mode and preset
     */
    mining_mode: {
      /**
       * Mining mode name
       */
      mode: string
      /**
       * Third-party firmware preset name when the mining mode is preset
       */
      mining_mode_preset: string | null
      /**
       * Number of online miners in this mode
       */
      count: number
    }[]
    /**
     * Online miner distribution by model and resolved specification
     */
    miner_model: {
      /**
       * Miner model name
       */
      model: string | null
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
    }[]
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
       * Snapshot anomaly bitmask. Bits: 0=fan, 1=power, 2=temperature, 3=hashboard, 4=network, 5=firmware, 6=unknown, 8=control_board, 9=pool.
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
       * Snapshot anomaly bitmask. Bits: 0=fan, 1=power, 2=temperature, 3=hashboard, 4=network, 5=firmware, 6=unknown, 8=control_board, 9=pool.
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
       * Snapshot anomaly bitmask. Bits: 0=fan, 1=power, 2=temperature, 3=hashboard, 4=network, 5=firmware, 6=unknown, 8=control_board, 9=pool.
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
       * Snapshot anomaly bitmask. Bits: 0=fan, 1=power, 2=temperature, 3=hashboard, 4=network, 5=firmware, 6=unknown, 8=control_board, 9=pool.
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
    | "miner.system.reboot"
    | "miner.log.get"
    | "miner.light.update"
    | "miner.power_mode.update"
    | "miner.pool.update"
    | "miner.pool.lock"
    | "miner.firmware.update"
    | "miner.tags.update"
    | "miner.record.delete"
    | "miner.rack_location.update"
}
export interface ListTaskBatchesOutput {
  success: true
  data: {
    /**
     * Task Batch ID
     */
    id: string
    /**
     * Task or event type dispatched to miners or agents. Execution types: `miner.system.reboot`, `miner.log.get`, `miner.light.update`, `miner.power_mode.update`, `miner.pool.update`, `miner.pool.lock`, `miner.firmware.update`, `agent.scan.create`, `agent.ip_diagnosis.create`, `agent.self.update`. Event types: `miner.tags.update`, `miner.record.delete`, `miner.rack_location.update`.
     */
    task_name:
      | "agent.scan.create"
      | "agent.ip_diagnosis.create"
      | "agent.self.update"
      | "miner.system.reboot"
      | "miner.log.get"
      | "miner.light.update"
      | "miner.power_mode.update"
      | "miner.pool.update"
      | "miner.pool.lock"
      | "miner.firmware.update"
      | "miner.tags.update"
      | "miner.record.delete"
      | "miner.rack_location.update"
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
    /**
     * Represents an entity that performs actions in the system (user, API key, or system)
     */
    created_by: {
      [k: string]: unknown
    } | null
    /**
     * Batch creation time
     */
    created_at: string
  }[]
  pagination: {
    total: number
    page: number
    page_size: number
    total_pages: number
  }
  error: null
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
     * Task or event type dispatched to miners or agents. Execution types: `miner.system.reboot`, `miner.log.get`, `miner.light.update`, `miner.power_mode.update`, `miner.pool.update`, `miner.pool.lock`, `miner.firmware.update`, `agent.scan.create`, `agent.ip_diagnosis.create`, `agent.self.update`. Event types: `miner.tags.update`, `miner.record.delete`, `miner.rack_location.update`.
     */
    eq?:
      | "agent.scan.create"
      | "agent.ip_diagnosis.create"
      | "agent.self.update"
      | "miner.system.reboot"
      | "miner.log.get"
      | "miner.light.update"
      | "miner.power_mode.update"
      | "miner.pool.update"
      | "miner.pool.lock"
      | "miner.firmware.update"
      | "miner.tags.update"
      | "miner.record.delete"
      | "miner.rack_location.update"
    in?: (
      | "agent.scan.create"
      | "agent.ip_diagnosis.create"
      | "agent.self.update"
      | "miner.system.reboot"
      | "miner.log.get"
      | "miner.light.update"
      | "miner.power_mode.update"
      | "miner.pool.update"
      | "miner.pool.lock"
      | "miner.firmware.update"
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
     * Actor type used to filter task batches by creator. `user` = batches created by human users through the Nonce app; `automation` = batches created by the Automation workflow system; `api` = batches created via private-api or connect-api tokens.
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
  data: {
    /**
     * Task Batch ID
     */
    id: string
    /**
     * Task or event type dispatched to miners or agents. Execution types: `miner.system.reboot`, `miner.log.get`, `miner.light.update`, `miner.power_mode.update`, `miner.pool.update`, `miner.pool.lock`, `miner.firmware.update`, `agent.scan.create`, `agent.ip_diagnosis.create`, `agent.self.update`. Event types: `miner.tags.update`, `miner.record.delete`, `miner.rack_location.update`.
     */
    task_name:
      | "agent.scan.create"
      | "agent.ip_diagnosis.create"
      | "agent.self.update"
      | "miner.system.reboot"
      | "miner.log.get"
      | "miner.light.update"
      | "miner.power_mode.update"
      | "miner.pool.update"
      | "miner.pool.lock"
      | "miner.firmware.update"
      | "miner.tags.update"
      | "miner.record.delete"
      | "miner.rack_location.update"
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
    /**
     * Represents an entity that performs actions in the system (user, API key, or system)
     */
    created_by: {
      [k: string]: unknown
    } | null
    /**
     * Batch creation time
     */
    created_at: string
  }[]
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
  data: {
    /**
     * Task Batch ID
     */
    id: string
    /**
     * Task or event type dispatched to miners or agents. Execution types: `miner.system.reboot`, `miner.log.get`, `miner.light.update`, `miner.power_mode.update`, `miner.pool.update`, `miner.pool.lock`, `miner.firmware.update`, `agent.scan.create`, `agent.ip_diagnosis.create`, `agent.self.update`. Event types: `miner.tags.update`, `miner.record.delete`, `miner.rack_location.update`.
     */
    task_name:
      | "agent.scan.create"
      | "agent.ip_diagnosis.create"
      | "agent.self.update"
      | "miner.system.reboot"
      | "miner.log.get"
      | "miner.light.update"
      | "miner.power_mode.update"
      | "miner.pool.update"
      | "miner.pool.lock"
      | "miner.firmware.update"
      | "miner.tags.update"
      | "miner.record.delete"
      | "miner.rack_location.update"
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
    /**
     * Represents an entity that performs actions in the system (user, API key, or system)
     */
    created_by: {
      [k: string]: unknown
    } | null
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
  error: null
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
  data: {
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
      [k: string]: unknown
    } | null
    /**
     * Signed task log download URL
     */
    log_download_url: string | null
    /**
     * Task log size in bytes
     */
    log_file_size: number | null
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
       * Task or event type dispatched to miners or agents. Execution types: `miner.system.reboot`, `miner.log.get`, `miner.light.update`, `miner.power_mode.update`, `miner.pool.update`, `miner.pool.lock`, `miner.firmware.update`, `agent.scan.create`, `agent.ip_diagnosis.create`, `agent.self.update`. Event types: `miner.tags.update`, `miner.record.delete`, `miner.rack_location.update`.
       */
      task_name:
        | "agent.scan.create"
        | "agent.ip_diagnosis.create"
        | "agent.self.update"
        | "miner.system.reboot"
        | "miner.log.get"
        | "miner.light.update"
        | "miner.power_mode.update"
        | "miner.pool.update"
        | "miner.pool.lock"
        | "miner.firmware.update"
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
        [k: string]: unknown
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
       * Task or event type dispatched to miners or agents. Execution types: `miner.system.reboot`, `miner.log.get`, `miner.light.update`, `miner.power_mode.update`, `miner.pool.update`, `miner.pool.lock`, `miner.firmware.update`, `agent.scan.create`, `agent.ip_diagnosis.create`, `agent.self.update`. Event types: `miner.tags.update`, `miner.record.delete`, `miner.rack_location.update`.
       */
      task_name:
        | "agent.scan.create"
        | "agent.ip_diagnosis.create"
        | "agent.self.update"
        | "miner.system.reboot"
        | "miner.log.get"
        | "miner.light.update"
        | "miner.power_mode.update"
        | "miner.pool.update"
        | "miner.pool.lock"
        | "miner.firmware.update"
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
        [k: string]: unknown
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
       * Task or event type dispatched to miners or agents. Execution types: `miner.system.reboot`, `miner.log.get`, `miner.light.update`, `miner.power_mode.update`, `miner.pool.update`, `miner.pool.lock`, `miner.firmware.update`, `agent.scan.create`, `agent.ip_diagnosis.create`, `agent.self.update`. Event types: `miner.tags.update`, `miner.record.delete`, `miner.rack_location.update`.
       */
      task_name:
        | "agent.scan.create"
        | "agent.ip_diagnosis.create"
        | "agent.self.update"
        | "miner.system.reboot"
        | "miner.log.get"
        | "miner.light.update"
        | "miner.power_mode.update"
        | "miner.pool.update"
        | "miner.pool.lock"
        | "miner.firmware.update"
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
        [k: string]: unknown
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
export interface CreatePowerModeUpdateTaskBatchInput {
  workspace_id: string
  farm_id: string
  /**
   * Miner IDs to target
   */
  miner_ids: string[]
  /**
   * Power mode parameters.
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
export interface CreatePowerModeUpdateTaskBatchOutput {
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
       * Task or event type dispatched to miners or agents. Execution types: `miner.system.reboot`, `miner.log.get`, `miner.light.update`, `miner.power_mode.update`, `miner.pool.update`, `miner.pool.lock`, `miner.firmware.update`, `agent.scan.create`, `agent.ip_diagnosis.create`, `agent.self.update`. Event types: `miner.tags.update`, `miner.record.delete`, `miner.rack_location.update`.
       */
      task_name:
        | "agent.scan.create"
        | "agent.ip_diagnosis.create"
        | "agent.self.update"
        | "miner.system.reboot"
        | "miner.log.get"
        | "miner.light.update"
        | "miner.power_mode.update"
        | "miner.pool.update"
        | "miner.pool.lock"
        | "miner.firmware.update"
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
        [k: string]: unknown
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
       * Task or event type dispatched to miners or agents. Execution types: `miner.system.reboot`, `miner.log.get`, `miner.light.update`, `miner.power_mode.update`, `miner.pool.update`, `miner.pool.lock`, `miner.firmware.update`, `agent.scan.create`, `agent.ip_diagnosis.create`, `agent.self.update`. Event types: `miner.tags.update`, `miner.record.delete`, `miner.rack_location.update`.
       */
      task_name:
        | "agent.scan.create"
        | "agent.ip_diagnosis.create"
        | "agent.self.update"
        | "miner.system.reboot"
        | "miner.log.get"
        | "miner.light.update"
        | "miner.power_mode.update"
        | "miner.pool.update"
        | "miner.pool.lock"
        | "miner.firmware.update"
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
        [k: string]: unknown
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
       * Task or event type dispatched to miners or agents. Execution types: `miner.system.reboot`, `miner.log.get`, `miner.light.update`, `miner.power_mode.update`, `miner.pool.update`, `miner.pool.lock`, `miner.firmware.update`, `agent.scan.create`, `agent.ip_diagnosis.create`, `agent.self.update`. Event types: `miner.tags.update`, `miner.record.delete`, `miner.rack_location.update`.
       */
      task_name:
        | "agent.scan.create"
        | "agent.ip_diagnosis.create"
        | "agent.self.update"
        | "miner.system.reboot"
        | "miner.log.get"
        | "miner.light.update"
        | "miner.power_mode.update"
        | "miner.pool.update"
        | "miner.pool.lock"
        | "miner.firmware.update"
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
        [k: string]: unknown
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
       * Task or event type dispatched to miners or agents. Execution types: `miner.system.reboot`, `miner.log.get`, `miner.light.update`, `miner.power_mode.update`, `miner.pool.update`, `miner.pool.lock`, `miner.firmware.update`, `agent.scan.create`, `agent.ip_diagnosis.create`, `agent.self.update`. Event types: `miner.tags.update`, `miner.record.delete`, `miner.rack_location.update`.
       */
      task_name:
        | "agent.scan.create"
        | "agent.ip_diagnosis.create"
        | "agent.self.update"
        | "miner.system.reboot"
        | "miner.log.get"
        | "miner.light.update"
        | "miner.power_mode.update"
        | "miner.pool.update"
        | "miner.pool.lock"
        | "miner.firmware.update"
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
        [k: string]: unknown
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
export interface CreateRackLocationUpdateTaskBatchInput {
  workspace_id: string
  farm_id: string
  /**
   * Per-miner rack location updates.
   */
  updates: {
    /**
     * Miner ID
     */
    miner_id: string
    /**
     * Rack identifier. Null to clear.
     */
    rack: string | null
    /**
     * Slot position. Null to clear.
     */
    position: number | null
  }[]
}
export interface CreateRackLocationUpdateTaskBatchOutput {
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
       * Task or event type dispatched to miners or agents. Execution types: `miner.system.reboot`, `miner.log.get`, `miner.light.update`, `miner.power_mode.update`, `miner.pool.update`, `miner.pool.lock`, `miner.firmware.update`, `agent.scan.create`, `agent.ip_diagnosis.create`, `agent.self.update`. Event types: `miner.tags.update`, `miner.record.delete`, `miner.rack_location.update`.
       */
      task_name:
        | "agent.scan.create"
        | "agent.ip_diagnosis.create"
        | "agent.self.update"
        | "miner.system.reboot"
        | "miner.log.get"
        | "miner.light.update"
        | "miner.power_mode.update"
        | "miner.pool.update"
        | "miner.pool.lock"
        | "miner.firmware.update"
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
        [k: string]: unknown
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
       * Task or event type dispatched to miners or agents. Execution types: `miner.system.reboot`, `miner.log.get`, `miner.light.update`, `miner.power_mode.update`, `miner.pool.update`, `miner.pool.lock`, `miner.firmware.update`, `agent.scan.create`, `agent.ip_diagnosis.create`, `agent.self.update`. Event types: `miner.tags.update`, `miner.record.delete`, `miner.rack_location.update`.
       */
      task_name:
        | "agent.scan.create"
        | "agent.ip_diagnosis.create"
        | "agent.self.update"
        | "miner.system.reboot"
        | "miner.log.get"
        | "miner.light.update"
        | "miner.power_mode.update"
        | "miner.pool.update"
        | "miner.pool.lock"
        | "miner.firmware.update"
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
        [k: string]: unknown
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
       * Continue scanning periodically
       */
      auto_scan?: boolean
    }[]
  }
}
export interface CreateAgentScanTaskBatchOutput {
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
       * Task or event type dispatched to miners or agents. Execution types: `miner.system.reboot`, `miner.log.get`, `miner.light.update`, `miner.power_mode.update`, `miner.pool.update`, `miner.pool.lock`, `miner.firmware.update`, `agent.scan.create`, `agent.ip_diagnosis.create`, `agent.self.update`. Event types: `miner.tags.update`, `miner.record.delete`, `miner.rack_location.update`.
       */
      task_name:
        | "agent.scan.create"
        | "agent.ip_diagnosis.create"
        | "agent.self.update"
        | "miner.system.reboot"
        | "miner.log.get"
        | "miner.light.update"
        | "miner.power_mode.update"
        | "miner.pool.update"
        | "miner.pool.lock"
        | "miner.firmware.update"
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
        [k: string]: unknown
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
       * Task or event type dispatched to miners or agents. Execution types: `miner.system.reboot`, `miner.log.get`, `miner.light.update`, `miner.power_mode.update`, `miner.pool.update`, `miner.pool.lock`, `miner.firmware.update`, `agent.scan.create`, `agent.ip_diagnosis.create`, `agent.self.update`. Event types: `miner.tags.update`, `miner.record.delete`, `miner.rack_location.update`.
       */
      task_name:
        | "agent.scan.create"
        | "agent.ip_diagnosis.create"
        | "agent.self.update"
        | "miner.system.reboot"
        | "miner.log.get"
        | "miner.light.update"
        | "miner.power_mode.update"
        | "miner.pool.update"
        | "miner.pool.lock"
        | "miner.firmware.update"
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
        [k: string]: unknown
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
export interface CreateAgentSelfUpdateTaskBatchInput {
  workspace_id: string
  farm_id: string
  /**
   * Agent self-update parameters.
   */
  params: {
    /**
     * Agent binary download URL
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
       * Task or event type dispatched to miners or agents. Execution types: `miner.system.reboot`, `miner.log.get`, `miner.light.update`, `miner.power_mode.update`, `miner.pool.update`, `miner.pool.lock`, `miner.firmware.update`, `agent.scan.create`, `agent.ip_diagnosis.create`, `agent.self.update`. Event types: `miner.tags.update`, `miner.record.delete`, `miner.rack_location.update`.
       */
      task_name:
        | "agent.scan.create"
        | "agent.ip_diagnosis.create"
        | "agent.self.update"
        | "miner.system.reboot"
        | "miner.log.get"
        | "miner.light.update"
        | "miner.power_mode.update"
        | "miner.pool.update"
        | "miner.pool.lock"
        | "miner.firmware.update"
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
        [k: string]: unknown
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
export const nonceToolDefinitions = [
  {
    "destructive": false,
    "methodName": "listWorkspaces",
    "name": "ListWorkspaces",
    "readOnly": true
  },
  {
    "destructive": false,
    "methodName": "getBitcoinMetrics",
    "name": "GetBitcoinMetrics",
    "readOnly": true
  },
  {
    "destructive": false,
    "methodName": "queryBitcoinMetrics",
    "name": "QueryBitcoinMetrics",
    "readOnly": true
  },
  {
    "destructive": false,
    "methodName": "listFarms",
    "name": "ListFarms",
    "readOnly": true
  },
  {
    "destructive": false,
    "methodName": "getFarm",
    "name": "GetFarm",
    "readOnly": true
  },
  {
    "destructive": false,
    "methodName": "listAgents",
    "name": "ListAgents",
    "readOnly": true
  },
  {
    "destructive": false,
    "methodName": "getAgent",
    "name": "GetAgent",
    "readOnly": true
  },
  {
    "destructive": false,
    "methodName": "listMiners",
    "name": "ListMiners",
    "readOnly": true
  },
  {
    "destructive": false,
    "methodName": "searchMiners",
    "name": "SearchMiners",
    "readOnly": true
  },
  {
    "destructive": false,
    "methodName": "getMiner",
    "name": "GetMiner",
    "readOnly": true
  },
  {
    "destructive": false,
    "methodName": "listMinerRebootTasks",
    "name": "ListMinerRebootTasks",
    "readOnly": true
  },
  {
    "destructive": false,
    "methodName": "listMinerTasks",
    "name": "ListMinerTasks",
    "readOnly": true
  },
  {
    "destructive": false,
    "methodName": "queryMinerMetrics",
    "name": "QueryMinerMetrics",
    "readOnly": true
  },
  {
    "destructive": false,
    "methodName": "queryFarmMetrics",
    "name": "QueryFarmMetrics",
    "readOnly": true
  },
  {
    "destructive": false,
    "methodName": "queryFarmMinerMetrics",
    "name": "QueryFarmMinerMetrics",
    "readOnly": true
  },
  {
    "destructive": false,
    "methodName": "listFarmRebootEvents",
    "name": "ListFarmRebootEvents",
    "readOnly": true
  },
  {
    "destructive": false,
    "methodName": "listMinerRebootEvents",
    "name": "ListMinerRebootEvents",
    "readOnly": true
  },
  {
    "destructive": false,
    "methodName": "listTaskBatches",
    "name": "ListTaskBatches",
    "readOnly": true
  },
  {
    "destructive": false,
    "methodName": "searchTaskBatches",
    "name": "SearchTaskBatches",
    "readOnly": true
  },
  {
    "destructive": false,
    "methodName": "getTaskBatch",
    "name": "GetTaskBatch",
    "readOnly": true
  },
  {
    "destructive": false,
    "methodName": "listTaskBatchTasks",
    "name": "ListTaskBatchTasks",
    "readOnly": true
  },
  {
    "destructive": true,
    "methodName": "createRebootTaskBatch",
    "name": "CreateRebootTaskBatch",
    "readOnly": false
  },
  {
    "destructive": true,
    "methodName": "createFirmwareUpdateTaskBatch",
    "name": "CreateFirmwareUpdateTaskBatch",
    "readOnly": false
  },
  {
    "destructive": true,
    "methodName": "createPoolLockTaskBatch",
    "name": "CreatePoolLockTaskBatch",
    "readOnly": false
  },
  {
    "destructive": true,
    "methodName": "createPowerModeUpdateTaskBatch",
    "name": "CreatePowerModeUpdateTaskBatch",
    "readOnly": false
  },
  {
    "destructive": true,
    "methodName": "createLightUpdateTaskBatch",
    "name": "CreateLightUpdateTaskBatch",
    "readOnly": false
  },
  {
    "destructive": true,
    "methodName": "createLogGetTaskBatch",
    "name": "CreateLogGetTaskBatch",
    "readOnly": false
  },
  {
    "destructive": true,
    "methodName": "createTagsUpdateTaskBatch",
    "name": "CreateTagsUpdateTaskBatch",
    "readOnly": false
  },
  {
    "destructive": true,
    "methodName": "createRackLocationUpdateTaskBatch",
    "name": "CreateRackLocationUpdateTaskBatch",
    "readOnly": false
  },
  {
    "destructive": true,
    "methodName": "createRecordDeleteTaskBatch",
    "name": "CreateRecordDeleteTaskBatch",
    "readOnly": false
  },
  {
    "destructive": true,
    "methodName": "createAgentScanTaskBatch",
    "name": "CreateAgentScanTaskBatch",
    "readOnly": false
  },
  {
    "destructive": true,
    "methodName": "createAgentIpDiagnosisTaskBatch",
    "name": "CreateAgentIpDiagnosisTaskBatch",
    "readOnly": false
  },
  {
    "destructive": true,
    "methodName": "createAgentSelfUpdateTaskBatch",
    "name": "CreateAgentSelfUpdateTaskBatch",
    "readOnly": false
  }
] as const

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
  listMiners(input: ListMinersInput, options?: NonceReadonlyCallOptions): Promise<ListMinersOutput>
  searchMiners(input: SearchMinersInput, options?: NonceReadonlyCallOptions): Promise<SearchMinersOutput>
  getMiner(input: GetMinerInput, options?: NonceReadonlyCallOptions): Promise<GetMinerOutput>
  listMinerRebootTasks(input: ListMinerRebootTasksInput, options?: NonceReadonlyCallOptions): Promise<ListMinerRebootTasksOutput>
  listMinerTasks(input: ListMinerTasksInput, options?: NonceReadonlyCallOptions): Promise<ListMinerTasksOutput>
  queryMinerMetrics(input: QueryMinerMetricsInput, options?: NonceReadonlyCallOptions): Promise<QueryMinerMetricsOutput>
  queryFarmMetrics(input: QueryFarmMetricsInput, options?: NonceReadonlyCallOptions): Promise<QueryFarmMetricsOutput>
  queryFarmMinerMetrics(input: QueryFarmMinerMetricsInput, options?: NonceReadonlyCallOptions): Promise<QueryFarmMinerMetricsOutput>
  listFarmRebootEvents(input: ListFarmRebootEventsInput, options?: NonceReadonlyCallOptions): Promise<ListFarmRebootEventsOutput>
  listMinerRebootEvents(input: ListMinerRebootEventsInput, options?: NonceReadonlyCallOptions): Promise<ListMinerRebootEventsOutput>
  listTaskBatches(input: ListTaskBatchesInput, options?: NonceReadonlyCallOptions): Promise<ListTaskBatchesOutput>
  searchTaskBatches(input: SearchTaskBatchesInput, options?: NonceReadonlyCallOptions): Promise<SearchTaskBatchesOutput>
  getTaskBatch(input: GetTaskBatchInput, options?: NonceReadonlyCallOptions): Promise<GetTaskBatchOutput>
  listTaskBatchTasks(input: ListTaskBatchTasksInput, options?: NonceReadonlyCallOptions): Promise<ListTaskBatchTasksOutput>
  createRebootTaskBatch(input: CreateRebootTaskBatchInput, options: NonceDestructiveCallOptions): Promise<CreateRebootTaskBatchOutput>
  createFirmwareUpdateTaskBatch(input: CreateFirmwareUpdateTaskBatchInput, options: NonceDestructiveCallOptions): Promise<CreateFirmwareUpdateTaskBatchOutput>
  createPoolLockTaskBatch(input: CreatePoolLockTaskBatchInput, options: NonceDestructiveCallOptions): Promise<CreatePoolLockTaskBatchOutput>
  createPowerModeUpdateTaskBatch(input: CreatePowerModeUpdateTaskBatchInput, options: NonceDestructiveCallOptions): Promise<CreatePowerModeUpdateTaskBatchOutput>
  createLightUpdateTaskBatch(input: CreateLightUpdateTaskBatchInput, options: NonceDestructiveCallOptions): Promise<CreateLightUpdateTaskBatchOutput>
  createLogGetTaskBatch(input: CreateLogGetTaskBatchInput, options: NonceDestructiveCallOptions): Promise<CreateLogGetTaskBatchOutput>
  createTagsUpdateTaskBatch(input: CreateTagsUpdateTaskBatchInput, options: NonceDestructiveCallOptions): Promise<CreateTagsUpdateTaskBatchOutput>
  createRackLocationUpdateTaskBatch(input: CreateRackLocationUpdateTaskBatchInput, options: NonceDestructiveCallOptions): Promise<CreateRackLocationUpdateTaskBatchOutput>
  createRecordDeleteTaskBatch(input: CreateRecordDeleteTaskBatchInput, options: NonceDestructiveCallOptions): Promise<CreateRecordDeleteTaskBatchOutput>
  createAgentScanTaskBatch(input: CreateAgentScanTaskBatchInput, options: NonceDestructiveCallOptions): Promise<CreateAgentScanTaskBatchOutput>
  createAgentIpDiagnosisTaskBatch(input: CreateAgentIpDiagnosisTaskBatchInput, options: NonceDestructiveCallOptions): Promise<CreateAgentIpDiagnosisTaskBatchOutput>
  createAgentSelfUpdateTaskBatch(input: CreateAgentSelfUpdateTaskBatchInput, options: NonceDestructiveCallOptions): Promise<CreateAgentSelfUpdateTaskBatchOutput>
}

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
  queryFarmMinerMetrics: {
    destructive: false
    input: QueryFarmMinerMetricsInput
    output: QueryFarmMinerMetricsOutput
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
  createPowerModeUpdateTaskBatch: {
    destructive: true
    input: CreatePowerModeUpdateTaskBatchInput
    output: CreatePowerModeUpdateTaskBatchOutput
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
  createRackLocationUpdateTaskBatch: {
    destructive: true
    input: CreateRackLocationUpdateTaskBatchInput
    output: CreateRackLocationUpdateTaskBatchOutput
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
}
