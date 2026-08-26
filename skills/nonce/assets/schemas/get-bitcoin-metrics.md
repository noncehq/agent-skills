# GetBitcoinMetrics

getBitcoinMetrics — read-only

## Purpose

Get Bitcoin Metrics

Return a current snapshot of Bitcoin mining market metrics including price, hashprice, network hashrate, and difficulty.

## Code

```js
const result = await nonce.getBitcoinMetrics(input)
```

## CLI

```bash
"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/nonce.mjs" call getBitcoinMetrics --input-file ".nonce/requests/get-bitcoin-metrics.json"
```

## Input

```ts
export interface GetBitcoinMetricsInput {}
```

## Output

```ts
export interface GetBitcoinMetricsOutput {
  success: true
  data: {
    /**
     * Current Bitcoin price in USD
     */
    bitcoin_price: number
    /**
     * Current hashprice in USD per PH/s per day
     */
    hashprice_usd: number
    /**
     * Current hashprice in BTC per PH/s per day
     */
    hashprice_btc: number
    /**
     * Current network hashrate in H/s
     */
    network_hashrate: number
    /**
     * Current network difficulty
     */
    network_difficulty: number
    /**
     * Snapshot timestamp
     */
    timestamp: string
  }
  error: null
}
```
