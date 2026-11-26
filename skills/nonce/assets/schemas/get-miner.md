# GetMiner

getMiner — read-only

Required: `workspace_id`, `farm_id`, `miner_id`

## Purpose

Get Miner

Get a miner by ID.

## Code

```js
const result = await nonce.getMiner(input)
```

## CLI

```bash
"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/nonce.mjs" call getMiner --input-file ".nonce/requests/get-miner.json"
```

## Input

```ts
export interface GetMinerInput {
  workspace_id: string
  farm_id: string
  miner_id: string
}
```

## Output

```ts
export interface GetMinerOutput {
  success: true
  data: {
    /**
     * Miner ID
     */
    id: string
    /**
     * Owning workspace ID
     */
    workspace_id: string
    /**
     * Owning farm ID
     */
    farm_id: string
    /**
     * Hardware serial number
     */
    serial_number: string | null
    /**
     * Manufacturer
     */
    make: string
    /**
     * Hardware model
     */
    model: string | null
    /**
     * Current IP address
     */
    ip: string
    /**
     * MAC address
     */
    mac: string | null
    /**
     * Worker name of the first pool connection, which is not necessarily the pool receiving hashrate
     */
    worker_name: string | null
    /**
     * Rack identifier
     */
    rack: string | null
    /**
     * Rack row, from 1 at the top
     */
    rack_row: number | null
    /**
     * Rack column, from 1 at the left
     */
    rack_column: number | null
    /**
     * Whether the miner is actively hashing
     */
    is_mining: boolean
    /**
     * System-managed miner reporting status
     */
    status: "online" | "stale"
    /**
     * Miner labels
     */
    tags: string[]
    /**
     * Current power or performance mode
     */
    mining_mode: string
    /**
     * Current third-party mode preset
     */
    mining_mode_preset: string | null
    /**
     * Current hashrate in H/s
     */
    hashrate: number | null
    /**
     * Device-reported expected hashrate in H/s, retained as observation data only; not the product baseline or a substitute for missing theoretical hashrate. Historical values may include legacy specification backfill.
     */
    expected_hashrate: number | null
    /**
     * Current power consumption in watts
     */
    power: number | null
    /**
     * Average board temperature in Celsius
     */
    temperature: number | null
    /**
     * Energy efficiency in J/TH
     */
    efficiency: number | null
    /**
     * Current anomaly bitmask
     */
    anomaly_flags: number
    /**
     * Uptime in seconds
     */
    uptime: number
    /**
     * Last heartbeat time
     */
    last_updated_at: string | null
    /**
     * Mining pool connections reported by the miner
     */
    pools: {
      /**
       * Mining pool Stratum URL
       */
      url: string | null
      /**
       * Worker identity sent to the pool (Stratum user field)
       */
      worker_name: string | null
      /**
       * Whether the miner has a connection to this pool. Several pools can be connected at once; the pool receiving hashrate is the one with the latest last_share_at.
       */
      active: boolean | null
      /**
       * Number of accepted shares
       */
      accepted_shares: number | null
      /**
       * Number of rejected shares
       */
      rejected_shares: number | null
      /**
       * Share rejection rate (percentage)
       */
      rejected_percent: number | null
      /**
       * Share stale rate (percentage)
       */
      stale_percent: number | null
      /**
       * Time of the last accepted share
       */
      last_share_at: string | null
      /**
       * Cumulative accepted share difficulty
       */
      accepted_difficulty: number | null
      /**
       * Cumulative rejected share difficulty
       */
      rejected_difficulty: number | null
      /**
       * Cumulative stale share difficulty
       */
      stale_difficulty: number | null
    }[]
    /**
     * Reporting Agent ID
     */
    agent_id: string
    /**
     * Miner hostname
     */
    hostname: string | null
    /**
     * Firmware name
     */
    firmware: string
    /**
     * Firmware version
     */
    firmware_version: string
    /**
     * Reported network configuration
     */
    network: {
      /**
       * How the address is assigned
       */
      mode: ("dhcp" | "static") | null
      /**
       * Address currently in use
       */
      ip: string | null
      /**
       * Subnet mask currently in use
       */
      netmask: string | null
      /**
       * Gateway in use. Null when the firmware does not report one, which is the case for Antminer derivatives on DHCP
       */
      gateway: string | null
      /**
       * DNS servers in use, as the miner reports them
       */
      dns: string | null
    } | null
    /**
     * Matched hardware submodel
     */
    submodel: string | null
    /**
     * Factory specification hashrate in H/s from the linked miner specification (miner_spec.theo_hashrate), including a linked model fallback specification. The sole product baseline; null when no specification hashrate is available. Never falls back to expected_hashrate.
     */
    theoretical_hashrate: number | null
    /**
     * Expected power consumption in watts
     */
    expected_power: number | null
    /**
     * Expected efficiency in J/TH
     */
    expected_efficiency: number | null
    /**
     * Configured power limit in watts
     */
    power_limit: number | null
    /**
     * Environment temperature in Celsius
     */
    environment_temperature: number | null
    /**
     * Average inlet temperature in Celsius
     */
    inlet_temperature: number | null
    /**
     * Average outlet temperature in Celsius
     */
    outlet_temperature: number | null
    /**
     * Reported chip count
     */
    total_chips: number | null
    /**
     * Expected chip count
     */
    expected_chips: number | null
    /**
     * Whether the last health check succeeded
     */
    last_check_succeed: boolean
    /**
     * Reason the miner identity is unstable
     */
    unstable_reason: string | null
    /**
     * Creation time
     */
    created_at: string | null
    /**
     * Last record update time
     */
    updated_at: string | null
  }
  error: null
}
```
