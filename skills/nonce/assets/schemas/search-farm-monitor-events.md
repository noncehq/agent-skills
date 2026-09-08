# SearchFarmMonitorEvents

searchFarmMonitorEvents — read-only

Required: `workspace_id`, `farm_id`

## Purpose

Search Farm Monitor Events

Search farm monitor events by shared selection filters, ordered by started_at and id. The default window is 24 hours, with a maximum of 7 days. Use status=active with both bounds omitted for all matching active events; add alert_entered=true for confirmed alert members. Use agent_id for miners currently managed by an agent, object_type=["farm","agent"] for the incident timeline, event_ids for exact event lookup, and detail=snapshot (max 100 per page) for frozen snapshots.

## Code

```js
const result = await nonce.searchFarmMonitorEvents(input)
```

## CLI

```bash
"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/nonce.mjs" call searchFarmMonitorEvents --input-file ".nonce/requests/search-farm-monitor-events.json"
```

## Input

```ts
export interface SearchFarmMonitorEventsInput {
  workspace_id: string
  farm_id: string
}
```

## Output

```ts
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
```
