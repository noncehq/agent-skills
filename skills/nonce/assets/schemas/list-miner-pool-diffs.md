# listMinerPoolDiffs

ListMinerPoolDiffs — read-only

Required: `workspace_id`, `farm_id`, `from_time`, `to_time`

## Purpose

List Pool Diffs

**Deprecated** — use ListMinerHistory and compute diffs client-side.

Returns pool change events for all miners in a farm within the time range. This endpoint operates at farm-level scope; per-miner filtering is not supported. Use this to detect unauthorized pool changes or verify pool update tasks completed successfully. Each record shows the before/after pool URLs and worker names.

## Code

```js
const result = await nonce.listMinerPoolDiffs(input)
```

## CLI

```bash
"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/nonce.mjs" call listMinerPoolDiffs --input-file ".nonce/requests/list-miner-pool-diffs.json"
```

## Input

```ts
export interface ListMinerPoolDiffsInput {
  workspace_id: string
  farm_id: string
  /**
   * Start time for the history data in ISO 8601 format with timezone offset.
   */
  from_time: string
  /**
   * End time for the history data in ISO 8601 format with timezone offset.
   */
  to_time: string
  /**
   * Time resolution of the returned snapshots.
   * - `10min`: max range 1 day (144 data points). Requires miner_id (single-miner queries only).
   * - `hour` (default): max range 7 days (168 data points).
   * - `day`: max range 90 days (90 data points).
   * - `week`: max range 365 days (52 data points).
   */
  granularity?: "10min" | "hour" | "day" | "week"
}
```

## Output

```ts
/**
 * Complete miner history record before the change
 */
export type MinerHistoryRecord = {
  [k: string]: unknown
} | null
/**
 * Complete miner history record after the change
 */
export type MinerHistoryRecord1 = {
  [k: string]: unknown
} | null

export interface ListMinerPoolDiffsOutput {
  /**
   * Indicates if the request was successful
   */
  success: boolean
  /**
   * Array of items
   */
  data: MinerPoolDiff[]
  /**
   * Error object (null on success)
   */
  error: null
}
export interface MinerPoolDiff {
  /**
   * Miner identifier
   */
  miner_id: string
  before_record: MinerHistoryRecord
  after_record: MinerHistoryRecord1
  /**
   * Summary of changes between the two time points
   */
  changes: {
    /**
     * Pool URL changes
     */
    pool_url: {
      /**
       * Value before the change
       */
      before: string | null
      /**
       * Value after the change
       */
      after: string | null
      /**
       * Whether the field has changed
       */
      changed: boolean
    }
    /**
     * Worker ID changes
     */
    worker_id: {
      /**
       * Value before the change
       */
      before: string | null
      /**
       * Value after the change
       */
      after: string | null
      /**
       * Whether the field has changed
       */
      changed: boolean
    }
  }
}
```
