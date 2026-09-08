# QueryFarmMinerMetrics

queryFarmMinerMetrics — read-only

Required: `workspace_id`, `farm_id`

## Purpose

Query Farm Miner Metrics

Return real-time aggregate miner classification counts and mining-mode and model distributions for a farm. Classification counts are independent — a sleeping miner with a fault appears in both abnormal and sleep. Online miners equal total minus stale.

## Code

```js
const result = await nonce.queryFarmMinerMetrics(input)
```

## CLI

```bash
"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/nonce.mjs" call queryFarmMinerMetrics --input-file ".nonce/requests/query-farm-miner-metrics.json"
```

## Input

```ts
export interface QueryFarmMinerMetricsInput {
  workspace_id: string
  farm_id: string
}
```

## Output

```ts
export interface QueryFarmMinerMetricsOutput {
  success: true
  /**
   * Real-time aggregate miner classification and distribution snapshot for a farm.
   */
  data: {
    /**
     * Configured farm miner capacity, or null when it is not configured
     */
    theo: number | null
    /**
     * Total number of non-deleted miners, including stale miners
     */
    total: number
    /**
     * Independent healthy, abnormal, sleeping, and stale miner counts
     */
    classification: {
      healthy: number
      abnormal: number
      sleep: number
      stale: number
    }
    /**
     * Abnormal miner counts and co-occurring anomaly counts by anomaly type
     */
    anomaly_breakdown: {
      hashboard: {
        count: number
        also_has: {
          [k: string]: unknown
        }
      }
      temperature: {
        count: number
        also_has: {
          [k: string]: unknown
        }
      }
      fan: {
        count: number
        also_has: {
          [k: string]: unknown
        }
      }
      network: {
        count: number
        also_has: {
          [k: string]: unknown
        }
      }
      pool: {
        count: number
        also_has: {
          [k: string]: unknown
        }
      }
      power: {
        count: number
        also_has: {
          [k: string]: unknown
        }
      }
      control_board: {
        count: number
        also_has: {
          [k: string]: unknown
        }
      }
      firmware: {
        count: number
        also_has: {
          [k: string]: unknown
        }
      }
      low_hashrate: {
        count: number
        also_has: {
          [k: string]: unknown
        }
      }
      unknown: {
        count: number
        also_has: {
          [k: string]: unknown
        }
      }
    }
    /**
     * Online miner distribution by mining mode and preset, each with its firmware breakdown
     */
    mining_mode: {
      /**
       * Mining mode name
       */
      mode: string
      /**
       * Third-party firmware preset name when the mining mode is preset
       */
      mining_mode_preset: string | null
      /**
       * Number of online miners in this mode
       */
      count: number
      /**
       * Firmware breakdown of this mode, most common first. Counts sum to `count`.
       */
      firmwares: {
        /**
         * Firmware name, or null when the miners report none
         */
        firmware: string | null
        /**
         * Number of online miners in this mode running this firmware
         */
        count: number
      }[]
    }[]
    /**
     * Online miner distribution by model and resolved specification
     */
    miner_model: {
      /**
       * Miner model name
       */
      model: string | null
      theoretical_hashrate: number | null
      submodel: string | null
      /**
       * Number of online miners of this model
       */
      count: number
      /**
       * Average expected hashrate in H/s
       */
      average_expected_hashrate: number | null
    }[]
  }
  error: null
}
```
