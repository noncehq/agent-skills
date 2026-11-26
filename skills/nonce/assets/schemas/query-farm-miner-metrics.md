# QueryFarmMinerMetrics

queryFarmMinerMetrics — read-only

Required: `workspace_id`, `farm_id`

## Purpose

Query Farm Miner Metrics

Return real-time aggregate miner classification counts and mining-mode and model distributions for a farm. Each model and submodel includes its firmware distribution; unreported firmware is null. Classification counts are independent — a sleeping miner with a fault appears in both abnormal and sleep. Online miners equal total minus stale.

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
    zero_hashrate: {
      count: number
      also_has: {
        [k: string]: unknown
      }
    }
    ineffective_reboot: {
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
  mining_modes: FarmMiningModeCount[]
  /**
   * Online miner distribution by model and resolved specification, with its firmware distribution
   */
  miner_models: FarmMinerModelMetrics[]
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
export interface FarmMinerModelMetrics {
  /**
   * Miner model name
   */
  model: string | null
  /**
   * Factory specification hashrate in H/s from the linked miner specification (miner_spec.theo_hashrate), including a linked model fallback specification. The sole product baseline; null when no specification hashrate is available. Never falls back to expected_hashrate.
   */
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
  /**
   * Firmware distribution within this model and submodel, most common first. Counts sum to count.
   */
  firmwares: FarmMinerModelFirmwareCount[]
}
export interface FarmMinerModelFirmwareCount {
  /**
   * Reported firmware name, or null when unknown
   */
  firmware: string | null
  /**
   * Number of online miners using this firmware
   */
  count: number
}
```
