# listBtcNetworkHistory

ListBtcNetworkHistory — read-only

## Purpose

List BTC Network History

Returns historical BTC network reference data as a time-series wrapper. Each snapshot contains bitcoin price, hashprice (USD and BTC), network hashrate, and difficulty. Default range is the last 7 days.

## Signature

```ts
listBtcNetworkHistory(input?: ListBtcNetworkHistoryInput, options?: ReadonlyCallOptions): Promise<ListBtcNetworkHistoryOutput>
```

## Input

```ts
export interface ListBtcNetworkHistoryInput {
  /**
   * Start of time range (ISO 8601). Defaults to 7 days ago.
   */
  from_time?: string
  /**
   * End of time range (ISO 8601). Defaults to now.
   */
  to_time?: string
}
```

## Output

```ts
export interface ListBtcNetworkHistoryOutput {
  /**
   * Indicates if the request was successful
   */
  success: boolean
  data: {
    /**
     * Start of the queried time range (ISO 8601)
     */
    from: string
    /**
     * End of the queried time range (ISO 8601)
     */
    to: string
    /**
     * Time-series data points
     */
    snapshots: {
      /**
       * Period timestamp for this data point
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
       * Network hashrate in EH/s
       */
      network_hashrate: number
      /**
       * Network difficulty
       */
      network_difficulty: number
    }[]
  }
  /**
   * Error object (null on success)
   */
  error: null
}
```
