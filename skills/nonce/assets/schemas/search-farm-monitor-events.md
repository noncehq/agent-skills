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
```

## Output

```ts
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
```
