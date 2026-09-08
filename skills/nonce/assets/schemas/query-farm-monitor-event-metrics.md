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
```

## Output

```ts
export interface QueryFarmMonitorEventMetricsOutput {
  success: true
  data: {
    /**
     * Request time used as the reference for window defaults and histogram buckets.
     */
    data_at: string
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
    by_monitor_type: {
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
       * Matching events by age of started_at relative to data_at: [0,1h), [1h,24h), [24h,7d), [7d,infinity). Future timestamps have age zero. The buckets sum to count and are independent of the query window.
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
```
