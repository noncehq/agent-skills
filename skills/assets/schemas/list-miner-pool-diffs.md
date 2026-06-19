# listMinerPoolDiffs

ListMinerPoolDiffs — read-only

Required: `workspace_id`, `farm_id`, `from_time`, `to_time`

## Signature

```ts
listMinerPoolDiffs(input: ListMinerPoolDiffsInput, options?: ReadonlyCallOptions): Promise<ListMinerPoolDiffsOutput>
```

## Input

```ts
interface ListMinerPoolDiffsInput {
  workspace_id: string;
  farm_id: string;
  /**
   * Start time for the history data in ISO 8601 format with timezone offset.
   */
  from_time: string;
  /**
   * End time for the history data in ISO 8601 format with timezone offset.
   */
  to_time: string;
  /**
   * Time resolution of the returned snapshots.
   * - `hour` (default): max range 7 days (168 data points).
   * - `day`: max range 90 days (90 data points).
   * - `week`: max range 365 days (52 data points).
   */
  granularity?: "hour" | "day" | "week";
}
```

## Output

```ts
interface ListMinerPoolDiffsOutput {
  /**
   * Indicates if the request was successful
   */
  success: boolean;
  /**
   * Array of items
   */
  data: {
    /**
     * Miner identifier
     */
    miner_id: string;
    /**
     * Complete miner history record before the change
     */
    before_record: Record<string, unknown> | null;
    /**
     * Complete miner history record after the change
     */
    after_record: Record<string, unknown> | null;
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
        before: string | null;
        /**
         * Value after the change
         */
        after: string | null;
        /**
         * Whether the field has changed
         */
        changed: boolean;
      };
      /**
       * Worker ID changes
       */
      worker_id: {
        /**
         * Value before the change
         */
        before: string | null;
        /**
         * Value after the change
         */
        after: string | null;
        /**
         * Whether the field has changed
         */
        changed: boolean;
      };
    };
  }[];
  /**
   * Error object (null on success)
   */
  error: null;
}
```
