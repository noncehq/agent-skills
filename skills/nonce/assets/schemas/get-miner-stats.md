# getMinerStats

GetMinerStats — read-only

Required: `workspace_id`, `farm_id`

## Purpose

Get Miner Stats

Returns aggregate miner classification counts for a farm: total, by_type (healthy / abnormal / sleep / stale), abnormal subtypes with co-occurrence (by_abnormal_type[type].count + also_has), and mining-mode / model distributions.
by_type counts are independent and NOT additive: a sleeping miner that also has a fault is counted in both abnormal and sleep. Online (non-stale) = total - stale.
Use this to answer "how many miners are abnormal / of each anomaly type / sleeping" without paging the full list.
To list the miners behind any count, call Search Miners (POST) with the predicate below. Each predicate reproduces the matching count exactly:
- healthy: status: { nin: ["stale"] }, has_anomaly: false, mining_mode: { nin: ["sleep"] }
- abnormal: status: { nin: ["stale"] }, has_anomaly: true
- sleep: status: { nin: ["stale"] }, mining_mode: { in: ["sleep"] }
- stale: status: { in: ["stale"] }
- abnormal subtype <type> (each key of by_abnormal_type: fan, power, temperature, hashboard, network, firmware, unknown, control_board, pool, low_hashrate): status: { nin: ["stale"] }, anomaly_filters: [<type>]

## Code

```js
const result = await nonce.getMinerStats(input)
```

## CLI

```bash
"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/nonce.mjs" call getMinerStats --input-file ".nonce/requests/get-miner-stats.json"
```

## Input

```ts
export interface GetMinerStatsInput {
  workspace_id: string
  farm_id: string
}
```

## Output

```ts
export interface GetMinerStatsOutput {
  /**
   * Indicates if the request was successful
   */
  success: boolean
  data: {
    theo: number | null
    total: number
    by_type: {
      healthy: number
      abnormal: number
      sleep: number
      stale: number
    }
    by_abnormal_type: {
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
    mining_mode: {
      mode: string
      count: number
    }[]
    miner_model: {
      model: string | null
      count: number
      theoretical_hashrate: number | null
    }[]
  }
  /**
   * Error object (null on success)
   */
  error: null
}
```
