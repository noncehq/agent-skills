# QueryFarmHashrateComparisonMetrics

queryFarmHashrateComparisonMetrics — read-only

Required: `workspace_id`, `farm_id`, `from_time`, `to_time`

## Purpose

Query Farm Hashrate Comparison Metrics

Query a precomputed pool hashrate comparison for a 7-day or 28-day UTC-aligned window and its previous window.

## Code

```js
const result = await nonce.queryFarmHashrateComparisonMetrics(input)
```

## CLI

```bash
"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/nonce.mjs" call queryFarmHashrateComparisonMetrics --input-file ".nonce/requests/query-farm-hashrate-comparison-metrics.json"
```

## Input

```ts
export interface QueryFarmHashrateComparisonMetricsInput {
  workspace_id: string
  farm_id: string
  /**
   * Inclusive start of the current comparison window in ISO 8601 format
   */
  from_time: string
  /**
   * Exclusive end of the current comparison window in ISO 8601 format
   */
  to_time: string
}
```

## Output

```ts
export interface QueryFarmHashrateComparisonMetricsOutput {
  success: true
  data: {
    /**
     * Farm ID
     */
    farm_id: string
    /**
     * Daily aggregate period used for the comparison
     */
    period: string
    current: {
      /**
       * Inclusive start of the comparison window
       */
      from_time: string
      /**
       * Exclusive end of the comparison window
       */
      to_time: string
      /**
       * Data reported by mining pool APIs
       */
      pool: {
        /**
         * Average pool hashrate in H/s
         */
        hashrate: number | null
      }
    }
    previous: {
      /**
       * Inclusive start of the comparison window
       */
      from_time: string
      /**
       * Exclusive end of the comparison window
       */
      to_time: string
      /**
       * Data reported by mining pool APIs
       */
      pool: {
        /**
         * Average pool hashrate in H/s
         */
        hashrate: number | null
      }
    }
    change: {
      pool: {
        /**
         * Absolute change in average pool hashrate in H/s
         */
        hashrate: number | null
      }
    }
    change_ratio: {
      pool: {
        /**
         * Relative change in average pool hashrate; null when either window is missing or the previous value is not positive
         */
        hashrate: number | null
      }
    }
  }
  error: null
}
```
