# QueryFarmAccountMetrics

queryFarmAccountMetrics — read-only

Required: `workspace_id`, `farm_id`

## Purpose

Query Farm Account Metrics

Return the online miners of a farm grouped by the pool and account receiving their hashrate, with miner count and total hashrate. A miner's account is the worker name before the first `.` on the pool connection with the latest share; `active` is not used because a miner can stay connected to several pools. Use Search Miners with `pool` and `account` to retrieve the miners behind an entry.

## Code

```js
const result = await nonce.queryFarmAccountMetrics(input)
```

## CLI

```bash
"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/nonce.mjs" call queryFarmAccountMetrics --input-file ".nonce/requests/query-farm-account-metrics.json"
```

## Input

```ts
export interface QueryFarmAccountMetricsInput {
  workspace_id: string
  farm_id: string
}
```

## Output

```ts
export interface QueryFarmAccountMetricsOutput {
  success: true
  /**
   * Real-time online miner distribution of a farm by account.
   */
  data: {
    /**
     * Data observation time
     */
    period: string
    /**
     * Online miner distribution by account, most miners first. A miner's account comes from the pool connection with the latest last_share_at, which receives its hashrate. Miners without any share have null pool and account.
     */
    accounts: {
      /**
       * Pool of the account: a known pool name (antpool, f2pool, spiderpool, viabtc) or the URL host
       */
      pool: string | null
      /**
       * Account on the pool: the worker name before the first `.`, or the whole worker name without `.`
       */
      account: string | null
      /**
       * Number of online miners
       */
      count: number
      /**
       * Total hashrate of these miners in H/s
       */
      hashrate: number
    }[]
  }
  error: null
}
```
