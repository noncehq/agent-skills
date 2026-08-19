# queryBitcoinMetrics

QueryBitcoinMetrics — read-only

## Purpose

Query Bitcoin Metrics

Query historical Bitcoin mining market metrics as a time series. Each snapshot contains bitcoin price, hashprice (USD and BTC), network hashrate, and difficulty.

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
export type QueryBitcoinMetricsInput = {} & object
```

## Output

```ts
export interface QueryBitcoinMetricsOutput {
  success: true
  data: BitcoinMetricsTimeSeries
  error: null
}
export interface BitcoinMetricsTimeSeries {
  /**
   * Inclusive start of the query range
   */
  from: string
  /**
   * Exclusive end of the query range
   */
  to: string
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
   * Network hashrate in EH/s
   */
  network_hashrate: number
  /**
   * Network difficulty
   */
  network_difficulty: number
}
```
