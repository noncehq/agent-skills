# QueryFarmMonitorEventMetrics

queryFarmMonitorEventMetrics — read-only

Required: `workspace_id`, `farm_id`

## Purpose

Query Farm Monitor Event Metrics

Aggregate farm monitor events using the same selection filters as SearchFarmMonitorEvents. Use status=active with alert_entered=true for the current alert overview, then SearchFarmMonitorEvents with the same filters for members. Counts describe events and distinct objects within each monitor type. Use current farm metrics to assess present health.

## Code

```js
const result = await nonce.queryFarmMonitorEventMetrics(input)
```

## CLI

```bash
"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/nonce.mjs" call queryFarmMonitorEventMetrics --input-file ".nonce/requests/query-farm-monitor-event-metrics.json"
```

## Input

```ts
export interface QueryFarmMonitorEventMetricsInput {
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
```
