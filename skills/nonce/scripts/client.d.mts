/* eslint-disable */
// Generated file. Do not edit by hand.
// Source of truth: checked Nonce method definitions; supplemental schemas only fill missing metadata.

// Type reference for project code that imports scripts/client.mjs.

export type ListWorkspacesInput = {} & object
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
  /**
   * @minItems 1
   */
  relations: ["member" | "grantee", ...("member" | "grantee")[]]
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
export type GetBitcoinMetricsInput = {} & object
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
export type QueryBitcoinMetricsInput = {} & object
export interface QueryBitcoinMetricsOutput {
  success: true
  data: BitcoinMetricsTimeSeries
  error: null
}
export interface BitcoinMetricsTimeSeries {
  /**
   * Inclusive start of the query range
   */
  from_time: string
  /**
   * Exclusive end of the query range
   */
  to_time: string
  granularity: "day"
  snapshots: BitcoinMetricSnapshot[]
}
export interface BitcoinMetricSnapshot {
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
  data: Farm
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
/**
 * Public Agent host identity
 */
export type AgentHost = {
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
export interface GetAgentOutput {
  success: true
  data: Agent
  error: null
}
export interface Agent {
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
  host: AgentHost
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
export interface SearchMinersInput {
  workspace_id: string
  farm_id: string
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
  data: Miner
  error: null
}
export interface Miner {
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
     * DNS servers in use, semicolon separated when there are several
     */
    dns: string | null
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
export interface ListMinerRebootTasksOutput {
  success: true
  data: MinerTask[]
  pagination: {
    total: number
    page: number
    page_size: number
    total_pages: number
  }
  error: null
}
/**
 * A task execution record for a single miner. Use task_name to filter by operation type. Available task names: miner.system.reboot (reboot the miner), miner.log.get (download miner logs), miner.light.update (toggle miner indicator light), miner.power_mode.update (change mining power mode), miner.pool.update (update mining pool configuration), miner.pool.lock (lock or unlock pool settings), miner.firmware.update (update miner firmware).
 */
export interface MinerTask {
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
  created_by: Actor
  /**
   * Task creation time
   */
  created_at: string
  /**
   * Last update time
   */
  updated_at: string
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
  data: MinerTask[]
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
        [k: string]: number
      }
    }
    temperature: {
      count: number
      also_has: {
        [k: string]: number
      }
    }
    fan: {
      count: number
      also_has: {
        [k: string]: number
      }
    }
    network: {
      count: number
      also_has: {
        [k: string]: number
      }
    }
    pool: {
      count: number
      also_has: {
        [k: string]: number
      }
    }
    power: {
      count: number
      also_has: {
        [k: string]: number
      }
    }
    control_board: {
      count: number
      also_has: {
        [k: string]: number
      }
    }
    firmware: {
      count: number
      also_has: {
        [k: string]: number
      }
    }
    low_hashrate: {
      count: number
      also_has: {
        [k: string]: number
      }
    }
    unknown: {
      count: number
      also_has: {
        [k: string]: number
      }
    }
  }
  /**
   * Online miner distribution by mining mode and preset, each with its firmware breakdown
   */
  mining_modes: FarmMiningModeCount[]
  /**
   * Online miner distribution by model and resolved specification
   */
  miner_models: FarmMinerModelCount[]
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
export interface FarmMinerModelCount {
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
}
export interface QueryFarmMonitorEventMetricsInput {
  workspace_id: string
  farm_id: string
}
/**
 * Monitor type; also the grouping key of event metrics
 */
export type MonitorType =
  | "agent_offline"
  | "agent_miner_data_stale"
  | "miner_offline"
  | "hashrate_drop"
  | "low_hashrate"
/**
 * Kind of object a monitor event describes
 */
export type MonitorObjectType = "farm" | "agent" | "miner"
export interface QueryFarmMonitorEventMetricsOutput {
  success: true
  data: FarmMonitorEventMetrics
  error: null
}
export interface FarmMonitorEventMetrics {
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
  monitor_types: MonitorEventTypeMetrics[]
}
export interface MonitorEventTypeMetrics {
  monitor_type: MonitorType
  object_type: MonitorObjectType
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
  started_at_histogram: MonitorEventStartedAtHistogram
}
/**
 * Matching events by age of started_at relative to period: [0,1h), [1h,24h), [24h,7d), [7d,infinity). Future timestamps have age zero. The buckets sum to count and are independent of the query window.
 */
export interface MonitorEventStartedAtHistogram {
  lt_1h: number
  lt_24h: number
  lt_7d: number
  ge_7d: number
}
export interface SearchFarmMonitorEventsInput {
  workspace_id: string
  farm_id: string
}
export type MonitorEventSnapshot =
  | AgentOfflineEventSnapshot
  | AgentMinerDataStaleEventSnapshot
  | MinerOfflineEventSnapshot
  | HashrateDropEventSnapshot
  | LowHashrateEventSnapshot
/**
 * Event evaluation context
 */
export type AgentOfflineEvaluationSnapshot = {
  last_online_at?: string | null
  [k: string]: unknown
} | null
/**
 * Agent row frozen when the event was created
 */
export type AgentObjectSnapshot = {
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
export type AgentOfflineAlertEntrySnapshot = {
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
 * Event evaluation context
 */
export type AgentMinerDataStaleEvaluationSnapshot = {
  last_updated_at?: string | null
  [k: string]: unknown
} | null
/**
 * Agent row frozen when the event was created
 */
export type AgentObjectSnapshot1 = {
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
export type AgentMinerDataStaleAlertEntrySnapshot = {
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
 * Event evaluation context
 */
export type MinerOfflineEvaluationSnapshot = {
  last_updated_at?: string | null
  stale_at?: string | null
  [k: string]: unknown
} | null
/**
 * Miner row frozen when the event was created
 */
export type MinerObjectSnapshot = {
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
  position?: number | null
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
export type MinerOfflineAlertEntrySnapshot = {
  event_started_at?: string | null
  agent_last_online_at?: string | null
  agent_last_updated_at?: string | null
  [k: string]: unknown
} | null
/**
 * Event evaluation context
 */
export type HashrateDropEvaluationSnapshot = {
  /**
   * Baseline online hashrate ratio at event start: rolling pool hashrate divided by the farm's configured hashrate, averaged over the baseline samples. Ratio scale; may exceed 1 during pool overlap.
   */
  baseline_online_hashrate?: number | null
  /**
   * Entry threshold as a ratio difference; 0.1 equals 10 percentage points.
   */
  entry_drop_percentage_points?: number | null
  /**
   * Online hashrate ratio at the first breach, in the same ratio scale as baseline_online_hashrate.
   */
  first_breach_online_hashrate?: number | null
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
export type FarmObjectSnapshot = {
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
export type HashrateDropAlertEntrySnapshot = {
  event_started_at?: string | null
  /**
   * Drop in percentage points: abs(confirmation baseline ratio - confirmed online ratio) x 100. Example: 1.04624 and 0.77314 give 27.31.
   */
  drop_percentage?: number | null
  /**
   * Drop in H/s: the ratio drop multiplied by the farm's configured hashrate.
   */
  drop_hashrate?: number | null
  /**
   * Baseline online hashrate ratio at event start: rolling pool hashrate divided by the farm's configured hashrate, averaged over the baseline samples. Ratio scale; may exceed 1 during pool overlap.
   */
  baseline_online_hashrate?: number | null
  /**
   * Entry threshold as a ratio difference; 0.1 equals 10 percentage points.
   */
  entry_drop_percentage_points?: number | null
  confirmed_at?: string | null
  confirmation_periods?: string[] | null
  /**
   * Online hashrate ratios at the two confirmation samples, in the same ratio scale as baseline_online_hashrate.
   */
  confirmation_online_hashrates?: number[] | null
  /**
   * Baseline ratios at the two confirmation samples; the second one is the confirmation baseline used for drop_percentage.
   */
  confirmation_baseline_online_hashrates?: number[] | null
  expected_pool_count?: number | null
  observed_pool_count?: number | null
  [k: string]: unknown
} | null
/**
 * Event evaluation context
 */
export type LowHashrateEvaluationSnapshot = {
  /**
   * Threshold as a ratio of configured hashrate; 0.1 equals 10%.
   */
  low_hashrate_threshold?: number | null
  /**
   * Online hashrate ratio at the first breach, in the same ratio scale as baseline_online_hashrate.
   */
  first_breach_online_hashrate?: number | null
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
export type FarmObjectSnapshot1 = {
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
export type LowHashrateAlertEntrySnapshot = {
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
   * Online hashrate ratios at the two confirmation samples, in the same ratio scale as baseline_online_hashrate.
   */
  confirmation_online_hashrates?: number[] | null
  expected_pool_count?: number | null
  observed_pool_count?: number | null
  [k: string]: unknown
} | null
export interface SearchFarmMonitorEventsOutput {
  success: true
  data: MonitorEvent[]
  pagination: {
    total: number
    page: number
    page_size: number
    total_pages: number
  }
  error: null
}
export interface MonitorEvent {
  event_id: string
  monitor_type: MonitorType
  object_type: MonitorObjectType
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
   * Reason the event ended: recovered, miner_deleted, agent_deleted or farm_archived. Current farm health is read from current metrics.
   */
  end_reason: string | null
  /**
   * Time of recorded alert entry; event-only records use null
   */
  entered_at: string | null
  /**
   * Current live row of the object; null for farm events and for deleted or moved objects
   */
  current: (MonitorMinerCurrentState | MonitorAgentCurrentState) | null
  /**
   * Populated only when detail=snapshot
   */
  snapshot: MonitorEventSnapshot | null
}
/**
 * Compact row from the live miner table at response time
 */
export interface MonitorMinerCurrentState {
  object_type: "miner"
  agent_id: string
  /**
   * System-managed reporting status: online or stale
   */
  status: string
  model: string | null
  rack: string | null
  position: number | null
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
/**
 * Compact row from the live agent table at response time
 */
export interface MonitorAgentCurrentState {
  object_type: "agent"
  status: string | null
  version: string | null
  last_online_at: string | null
  last_updated_at: string | null
}
export interface AgentOfflineEventSnapshot {
  monitor_type: "agent_offline"
  /**
   * Monitor rule parameters frozen when the event was created
   */
  effective_parameters: {
    [k: string]: unknown
  } | null
  evaluation_snapshot: AgentOfflineEvaluationSnapshot
  object_snapshot: AgentObjectSnapshot
  alert_entry_snapshot: AgentOfflineAlertEntrySnapshot
  /**
   * Validation problems of this record, e.g. object_snapshot_invalid. The affected field is null.
   */
  warnings: string[]
}
export interface AgentMinerDataStaleEventSnapshot {
  monitor_type: "agent_miner_data_stale"
  /**
   * Monitor rule parameters frozen when the event was created
   */
  effective_parameters: {
    [k: string]: unknown
  } | null
  evaluation_snapshot: AgentMinerDataStaleEvaluationSnapshot
  object_snapshot: AgentObjectSnapshot1
  alert_entry_snapshot: AgentMinerDataStaleAlertEntrySnapshot
  /**
   * Validation problems of this record, e.g. object_snapshot_invalid. The affected field is null.
   */
  warnings: string[]
}
export interface MinerOfflineEventSnapshot {
  monitor_type: "miner_offline"
  /**
   * Monitor rule parameters frozen when the event was created
   */
  effective_parameters: {
    [k: string]: unknown
  } | null
  evaluation_snapshot: MinerOfflineEvaluationSnapshot
  object_snapshot: MinerObjectSnapshot
  alert_entry_snapshot: MinerOfflineAlertEntrySnapshot
  /**
   * Validation problems of this record, e.g. object_snapshot_invalid. The affected field is null.
   */
  warnings: string[]
}
export interface HashrateDropEventSnapshot {
  monitor_type: "hashrate_drop"
  /**
   * Monitor rule parameters frozen when the event was created
   */
  effective_parameters: {
    [k: string]: unknown
  } | null
  evaluation_snapshot: HashrateDropEvaluationSnapshot
  object_snapshot: FarmObjectSnapshot
  alert_entry_snapshot: HashrateDropAlertEntrySnapshot
  /**
   * Validation problems of this record, e.g. object_snapshot_invalid. The affected field is null.
   */
  warnings: string[]
}
export interface LowHashrateEventSnapshot {
  monitor_type: "low_hashrate"
  /**
   * Monitor rule parameters frozen when the event was created
   */
  effective_parameters: {
    [k: string]: unknown
  } | null
  evaluation_snapshot: LowHashrateEvaluationSnapshot
  object_snapshot: FarmObjectSnapshot1
  alert_entry_snapshot: LowHashrateAlertEntrySnapshot
  /**
   * Validation problems of this record, e.g. object_snapshot_invalid. The affected field is null.
   */
  warnings: string[]
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
  data: RebootEvent[]
  pagination: {
    total: number
    page: number
    page_size: number
    total_pages: number
  }
  error: null
}
export interface RebootEvent {
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
  before: RebootEventSnapshot
  after: RebootEventSnapshot1
}
/**
 * Snapshot before the reboot
 */
export interface RebootEventSnapshot {
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
export interface RebootEventSnapshot1 {
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
  data: RebootEvent[]
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
  created_by: Actor
  /**
   * Batch creation time
   */
  created_at: string
}
export interface SearchTaskBatchesInput {
  workspace_id: string
  farm_id: string
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
export interface CreateRebootTaskBatchInput {
  workspace_id: string
  farm_id: string
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
}
export interface CreateFirmwareUpdateTaskBatchOutput {
  success: true
  data: CreateTaskBatchResult
  error: null
}
export interface CreatePoolLockTaskBatchInput {
  workspace_id: string
  farm_id: string
}
export interface CreatePoolLockTaskBatchOutput {
  success: true
  data: CreateTaskBatchResult
  error: null
}
export interface CreateMiningModeUpdateTaskBatchInput {
  workspace_id: string
  farm_id: string
}
export interface CreateMiningModeUpdateTaskBatchOutput {
  success: true
  data: CreateTaskBatchResult
  error: null
}
export interface CreateLightUpdateTaskBatchInput {
  workspace_id: string
  farm_id: string
}
export interface CreateLightUpdateTaskBatchOutput {
  success: true
  data: CreateTaskBatchResult
  error: null
}
export interface CreateLogGetTaskBatchInput {
  workspace_id: string
  farm_id: string
}
export interface CreateLogGetTaskBatchOutput {
  success: true
  data: CreateTaskBatchResult
  error: null
}
export interface CreateTagsUpdateTaskBatchInput {
  workspace_id: string
  farm_id: string
}
export interface CreateTagsUpdateTaskBatchOutput {
  success: true
  data: CreateTaskBatchResult
  error: null
}
export interface CreateRackUpdateTaskBatchInput {
  workspace_id: string
  farm_id: string
}
export interface CreateRackUpdateTaskBatchOutput {
  success: true
  data: CreateTaskBatchResult
  error: null
}
export interface CreateRecordDeleteTaskBatchInput {
  workspace_id: string
  farm_id: string
}
export interface CreateRecordDeleteTaskBatchOutput {
  success: true
  data: CreateTaskBatchResult
  error: null
}
export interface CreateAgentScanTaskBatchInput {
  workspace_id: string
  farm_id: string
}
export interface CreateAgentScanTaskBatchOutput {
  success: true
  data: CreateTaskBatchResult
  error: null
}
export interface CreateAgentIpDiagnosisTaskBatchInput {
  workspace_id: string
  farm_id: string
}
export interface CreateAgentIpDiagnosisTaskBatchOutput {
  success: true
  data: CreateTaskBatchResult
  error: null
}
export interface CreateAgentSelfUpdateTaskBatchInput {
  workspace_id: string
  farm_id: string
}
export interface CreateAgentSelfUpdateTaskBatchOutput {
  success: true
  data: CreateTaskBatchResult
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
  queryBitcoinMetrics(input?: QueryBitcoinMetricsInput, options?: NonceReadonlyCallOptions): Promise<QueryBitcoinMetricsOutput>
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
  queryFarmMonitorEventMetrics(input: QueryFarmMonitorEventMetricsInput, options?: NonceReadonlyCallOptions): Promise<QueryFarmMonitorEventMetricsOutput>
  searchFarmMonitorEvents(input: SearchFarmMonitorEventsInput, options?: NonceReadonlyCallOptions): Promise<SearchFarmMonitorEventsOutput>
  listFarmRebootEvents(input: ListFarmRebootEventsInput, options?: NonceReadonlyCallOptions): Promise<ListFarmRebootEventsOutput>
  listMinerRebootEvents(input: ListMinerRebootEventsInput, options?: NonceReadonlyCallOptions): Promise<ListMinerRebootEventsOutput>
  listTaskBatches(input: ListTaskBatchesInput, options?: NonceReadonlyCallOptions): Promise<ListTaskBatchesOutput>
  searchTaskBatches(input: SearchTaskBatchesInput, options?: NonceReadonlyCallOptions): Promise<SearchTaskBatchesOutput>
  getTaskBatch(input: GetTaskBatchInput, options?: NonceReadonlyCallOptions): Promise<GetTaskBatchOutput>
  listTaskBatchTasks(input: ListTaskBatchTasksInput, options?: NonceReadonlyCallOptions): Promise<ListTaskBatchTasksOutput>
  createRebootTaskBatch(input: CreateRebootTaskBatchInput, options: NonceDestructiveCallOptions): Promise<CreateRebootTaskBatchOutput>
  createFirmwareUpdateTaskBatch(input: CreateFirmwareUpdateTaskBatchInput, options: NonceDestructiveCallOptions): Promise<CreateFirmwareUpdateTaskBatchOutput>
  createPoolLockTaskBatch(input: CreatePoolLockTaskBatchInput, options: NonceDestructiveCallOptions): Promise<CreatePoolLockTaskBatchOutput>
  createMiningModeUpdateTaskBatch(input: CreateMiningModeUpdateTaskBatchInput, options: NonceDestructiveCallOptions): Promise<CreateMiningModeUpdateTaskBatchOutput>
  createLightUpdateTaskBatch(input: CreateLightUpdateTaskBatchInput, options: NonceDestructiveCallOptions): Promise<CreateLightUpdateTaskBatchOutput>
  createLogGetTaskBatch(input: CreateLogGetTaskBatchInput, options: NonceDestructiveCallOptions): Promise<CreateLogGetTaskBatchOutput>
  createTagsUpdateTaskBatch(input: CreateTagsUpdateTaskBatchInput, options: NonceDestructiveCallOptions): Promise<CreateTagsUpdateTaskBatchOutput>
  createRackUpdateTaskBatch(input: CreateRackUpdateTaskBatchInput, options: NonceDestructiveCallOptions): Promise<CreateRackUpdateTaskBatchOutput>
  createRecordDeleteTaskBatch(input: CreateRecordDeleteTaskBatchInput, options: NonceDestructiveCallOptions): Promise<CreateRecordDeleteTaskBatchOutput>
  createAgentScanTaskBatch(input: CreateAgentScanTaskBatchInput, options: NonceDestructiveCallOptions): Promise<CreateAgentScanTaskBatchOutput>
  createAgentIpDiagnosisTaskBatch(input: CreateAgentIpDiagnosisTaskBatchInput, options: NonceDestructiveCallOptions): Promise<CreateAgentIpDiagnosisTaskBatchOutput>
  createAgentSelfUpdateTaskBatch(input: CreateAgentSelfUpdateTaskBatchInput, options: NonceDestructiveCallOptions): Promise<CreateAgentSelfUpdateTaskBatchOutput>
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
  createRackUpdateTaskBatch: {
    destructive: true
    input: CreateRackUpdateTaskBatchInput
    output: CreateRackUpdateTaskBatchOutput
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
