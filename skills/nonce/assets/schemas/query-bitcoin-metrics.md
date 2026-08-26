# QueryBitcoinMetrics

queryBitcoinMetrics — read-only

Required: `from`, `to`

## Purpose

Query Bitcoin Metrics

Query historical Bitcoin mining market metrics as a time series.

## Code

```js
const result = await nonce.queryBitcoinMetrics(input)
```

## CLI

```bash
"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/nonce.mjs" call queryBitcoinMetrics --input-file ".nonce/requests/query-bitcoin-metrics.json"
```

## Input

```ts
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
```

## Output

```ts
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
```
