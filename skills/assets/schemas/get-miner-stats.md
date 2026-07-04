# getMinerStats

GetMinerStats — read-only

Required: `workspace_id`, `farm_id`

## Signature

```ts
getMinerStats(input: GetMinerStatsInput, options?: ReadonlyCallOptions): Promise<GetMinerStatsOutput>
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
    }[]
  }
  /**
   * Error object (null on success)
   */
  error: null
}
```
