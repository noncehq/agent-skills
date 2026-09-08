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
  data: FarmMinerMetrics
  error: null
}
/**
 * Real-time aggregate miner classification and distribution snapshot for a farm.
 */
export interface FarmMinerMetrics {
  /**
   * Data observation time
   */
  period: string
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
   * Online miner distribution by mining mode and preset, each with its firmware breakdown
   */
  mining_modes: FarmMiningModeCount[]
  /**
   * Online miner distribution by model and resolved specification
   */
  miner_models: FarmMinerModelCount[]
}
export interface FarmMiningModeCount {
  /**
   * Mining mode name
   */
  mining_mode: string
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
  firmwares: FarmMiningModeFirmwareCount[]
}
export interface FarmMiningModeFirmwareCount {
  /**
   * Firmware name, or null when the miners report none
   */
  firmware: string | null
  /**
   * Number of online miners in this mode running this firmware
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
