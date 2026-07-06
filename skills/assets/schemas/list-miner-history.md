# listMinerHistory

ListMinerHistory — read-only

Required: `workspace_id`, `farm_id`, `miner_id`, `from_time`, `to_time`

## Signature

```ts
listMinerHistory(input: ListMinerHistoryInput, options?: ReadonlyCallOptions): Promise<ListMinerHistoryOutput>
```

## Input

```ts
export interface ListMinerHistoryInput {
  workspace_id: string
  farm_id: string
  miner_id: string
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
export interface ListMinerHistoryOutput {
  /**
   * Indicates if the request was successful
   */
  success: boolean
  /**
   * Array of items
   */
  data: {
    /**
     * Miner Id
     */
    miner_id: string
    /**
     * Start of the time range (ISO 8601)
     */
    from: string
    /**
     * End of the time range (ISO 8601)
     */
    to: string
    /**
     * Time resolution of the returned snapshots. Values: 10min | hour | day | week.
     */
    granularity: "10min" | "hour" | "day" | "week"
    /**
     * Time-series data points within the requested range.
     */
    snapshots: {
      /**
       * The period timestamp for this metric record
       */
      period: string
      /**
       * Hashrate value in H/s
       */
      hashrate: number | null
      /**
       * Power consumption in watts
       */
      wattage: number | null
      /**
       * Temperature in Celsius
       */
      temp: number | null
      /**
       * Uptime in seconds
       */
      uptime: number | null
      /**
       * Bitmask of active anomalies. Bits: 0=fan, 1=power, 2=temperature, 3=hashboard, 4=network, 5=firmware, 6=unknown, 8=control_board, 9=pool.
       */
      anomaly_flags: number | null
    }[]
  }
  /**
   * Error object (null on success)
   */
  error: null
}
```
