# listMinerRebootEvents

ListMinerRebootEvents — read-only

Required: `workspace_id`, `farm_id`

## Purpose

List Miner Reboot Events

Returns detected miner reboot events for a farm. Each event includes miner identity (ip, model, make, serial_number) and before/after snapshots (uptime, hashrate, wattage, temperature, anomaly_flags, mining_mode). Hashrate impact averages use T-30~T-5min before reboot and T+15~T+60min after reboot. Filter by miner_id and time range. Default range is last 7 days, max 30 days.

## Code

```js
const result = await nonce.listMinerRebootEvents(input)
```

## CLI

```bash
"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/nonce.mjs" call listMinerRebootEvents --input-file ".nonce/requests/list-miner-reboot-events.json"
```

## Input

```ts
export interface ListMinerRebootEventsInput {
  workspace_id: string
  farm_id: string
  /**
   * Page number (default: 1)
   */
  page?: number
  /**
   * Number of items per page (default: 10, max: 10000)
   */
  pageSize?: number
  /**
   * Filter by miner ID
   */
  miner_id?: string
  /**
   * Start time filter. Defaults to 7 days ago if not provided.
   */
  from_time?: string
  /**
   * End time filter. Defaults to now if not provided.
   */
  to_time?: string
}
```

## Output

```ts
export interface ListMinerRebootEventsOutput {
  /**
   * Indicates if the request was successful
   */
  success: boolean
  /**
   * Array of items
   */
  data: {
    /**
     * Reboot event ID
     */
    id: string
    /**
     * Workspace ID
     */
    workspace_id: string
    /**
     * Farm ID
     */
    farm_id: string
    /**
     * Miner ID
     */
    miner_id: string
    /**
     * Miner IP address at time of query
     */
    ip: string
    /**
     * Miner hardware model (e.g. S19 Pro)
     */
    model: string | null
    /**
     * Miner manufacturer (e.g. Bitmain)
     */
    make: string
    /**
     * Miner serial number
     */
    serial_number: string | null
    /**
     * Detection period (ISO 8601)
     */
    period: string
    /**
     * Uptime before reboot (seconds)
     */
    pre_uptime: number | null
    /**
     * Uptime after reboot (seconds)
     */
    post_uptime: number | null
    /**
     * Hashrate before reboot (H/s)
     */
    pre_hashrate: number | null
    /**
     * Hashrate after reboot (H/s)
     */
    post_hashrate: number | null
    /**
     * Pre-reboot snapshot collection time (ISO 8601)
     */
    pre_period: string | null
    /**
     * Post-reboot snapshot collection time (ISO 8601)
     */
    post_period: string | null
    /**
     * Power consumption before reboot (watts)
     */
    pre_wattage: number | null
    /**
     * Power consumption after reboot (watts)
     */
    post_wattage: number | null
    /**
     * Average board temperature before reboot (celsius)
     */
    pre_temp: number | null
    /**
     * Average board temperature after reboot (celsius)
     */
    post_temp: number | null
    /**
     * Anomaly bitmask before reboot. Bits: 0=fan, 1=power, 2=temperature, 3=hashboard, 4=network, 5=firmware, 6=unknown, 8=control_board, 9=pool.
     */
    pre_anomaly_flags: number | null
    /**
     * Anomaly bitmask after reboot. Bits: 0=fan, 1=power, 2=temperature, 3=hashboard, 4=network, 5=firmware, 6=unknown, 8=control_board, 9=pool.
     */
    post_anomaly_flags: number | null
    /**
     * Mining mode before reboot (e.g. normal, sleep, low)
     */
    pre_mining_mode: string | null
    /**
     * Mining mode after reboot (e.g. normal, sleep, low)
     */
    post_mining_mode: string | null
    /**
     * Record creation time (ISO 8601)
     */
    created_at: string | null
    /**
     * Average hashrate 30–5 minutes before reboot (H/s); null when the window has no history
     */
    before_avg_hashrate: number | null
    /**
     * Average hashrate 15–60 minutes after reboot (H/s); null when the window has no history
     */
    after_avg_hashrate: number | null
  }[]
  /**
   * Pagination metadata
   */
  pagination: {
    /**
     * Total number of items
     */
    total: number
    /**
     * Maximum number of items per page
     */
    limit: number
    /**
     * Number of items to skip
     */
    offset: number
    /**
     * Whether there are more items after this page
     */
    hasNext: boolean
    /**
     * Whether there are items before this page
     */
    hasPrevious: boolean
  }
  /**
   * Error object (null on success)
   */
  error: null
}
```
