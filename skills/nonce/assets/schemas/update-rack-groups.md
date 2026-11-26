# UpdateRackGroups

updateRackGroups — destructive

Required: `workspace_id`, `farm_id`, `rack_groups`

## Purpose

Update Rack Groups

Name rack groups, set their template and start offset, or replace their subnets, in one transaction. Each change identifies a rack group by id; omitted fields keep their values. With a `sequential` template, slot 1 holds the miner at `start_offset` within the subnets, which is the last octet for a single /24. New subnets absorb every other rack group whose subnets all fall within them, deleting it with its name and template; a subnet that only partly overlaps another rack group is rejected. A /24 with miners left uncovered gets a new rack group on the next read.

## Code

```js
const result = await nonce.updateRackGroups(input, {
  confirmDestructive: true,
  confirmation: "<confirmed target and effect>",
})
```

## CLI

```bash
"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/nonce.mjs" call updateRackGroups --input-file ".nonce/requests/update-rack-groups.json" --allow-destructive --confirmation "<confirmed target and effect>"
```

## Input

```ts
export interface UpdateRackGroupsInput {
  workspace_id: string
  farm_id: string
  rack_groups: {
    id: string
    /**
     * A blank name clears it
     */
    name?: string | null
    template_id?: string | null
    start_offset?: number
    /**
     * Replaces the subnets. Rack groups whose subnets all fall within them merge into this one; a partial overlap with another rack group is rejected.
     */
    subnets?: string[]
  }[]
}
```

## Output

```ts
export interface UpdateRackGroupsOutput {
  success: true
  data: {
    /**
     * Rack group ID
     */
    id: string
    /**
     * Unique within the farm; null until someone names it
     */
    name: string | null
    /**
     * Template the rack group uses; null without one
     */
    template_id: string | null
    /**
     * Offset within the subnets of the first slot when the template assigns them in IP order
     */
    start_offset: number
    /**
     * Subnets of the rack group as network addresses, in address order
     */
    subnets: string[]
    /**
     * Miners in the subnets, stale included; equals searching miners with `ip_ranges` set to the subnets
     */
    miner_count: number
    /**
     * Real-time health of the miners of a rack group, counted as QueryFarmMinerMetrics counts a farm. Readings come from live miners: online and not in sleep mode.
     */
    summary: {
      /**
       * Data observation time
       */
      period: string
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
       * Highest average board temperature of live miners; null without a reading
       */
      max_temperature: number | null
      /**
       * Mean average board temperature of live miners; null without a reading
       */
      avg_temperature: number | null
      /**
       * Highest average inlet temperature of live miners; null without a reading
       */
      max_inlet_temperature: number | null
      /**
       * Mean average inlet temperature of live miners; null without a reading
       */
      avg_inlet_temperature: number | null
      /**
       * Highest average outlet temperature of live miners; null without a reading
       */
      max_outlet_temperature: number | null
      /**
       * Mean average outlet temperature of live miners; null without a reading
       */
      avg_outlet_temperature: number | null
      /**
       * Total watts of live miners reporting both wattage and hashrate
       */
      wattage: number | null
      /**
       * Total hashrate in H/s of live miners reporting both wattage and hashrate
       */
      hashrate: number | null
      /**
       * wattage over hashrate in J/TH; null without hashrate
       */
      efficiency: number | null
    }
  }[]
  error: null
}
```
