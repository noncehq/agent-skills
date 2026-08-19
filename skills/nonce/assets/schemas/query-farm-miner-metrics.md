# queryFarmMinerMetrics

QueryFarmMinerMetrics — read-only

Required: `workspace_id`, `farm_id`

## Purpose

Query Farm Miner Metrics

Return a real-time aggregate miner classification snapshot and mining-mode and model distributions for a farm.

`classification` counts are independent. A sleeping miner with a fault appears in both `abnormal` and `sleep`. Online miners equal `total - classification.stale`.

Use SearchMiners to retrieve miners behind a count:
- `healthy`: `status = { nin: ["stale"] }`, `anomaly_flags = { nin: [<all types>] }`, `mining_mode = { nin: ["sleep"] }`
- `abnormal`: `status = { nin: ["stale"] }`, `anomaly_flags = { in: ["fan", "power", "temperature", "hashboard", "network", "firmware", "unknown", "control_board", "pool", "low_hashrate"] }`
- `sleep`: `status = { nin: ["stale"] }`, `mining_mode = { in: ["sleep"] }`
- `stale`: `status = { in: ["stale"] }`
- anomaly subtype: `status = { nin: ["stale"] }`, `anomaly_flags = { in: ["fan"] }` (replace with the target type)

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
  data: FarmMinerMetrics
  error: null
}
/**
 * Real-time aggregate miner classification and distribution snapshot for a farm.
 */
export interface FarmMinerMetrics {
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
        [k: string]: number
      }
    }
    temperature: {
      count: number
      also_has: {
        [k: string]: number
      }
    }
    fan: {
      count: number
      also_has: {
        [k: string]: number
      }
    }
    network: {
      count: number
      also_has: {
        [k: string]: number
      }
    }
    pool: {
      count: number
      also_has: {
        [k: string]: number
      }
    }
    power: {
      count: number
      also_has: {
        [k: string]: number
      }
    }
    control_board: {
      count: number
      also_has: {
        [k: string]: number
      }
    }
    firmware: {
      count: number
      also_has: {
        [k: string]: number
      }
    }
    low_hashrate: {
      count: number
      also_has: {
        [k: string]: number
      }
    }
    unknown: {
      count: number
      also_has: {
        [k: string]: number
      }
    }
  }
  /**
   * Online miner distribution by mining mode and preset
   */
  mining_mode: FarmMiningModeCount[]
  /**
   * Online miner distribution by model and resolved specification
   */
  miner_model: FarmMinerModelCount[]
}
export interface FarmMiningModeCount {
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
}
export interface FarmMinerModelCount {
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
}
```
