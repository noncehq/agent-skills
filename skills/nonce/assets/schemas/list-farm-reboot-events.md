# ListFarmRebootEvents

listFarmRebootEvents — read-only

Required: `workspace_id`, `farm_id`

## Purpose

List Farm Reboot Events

List detected Farm Reboot Events in the requested farm. Before averages use T-30 to T-5 minutes and after averages use T+15 to T+60 minutes. The default time range is the last 7 days and the maximum is 30 days.

## Code

```js
const result = await nonce.listFarmRebootEvents(input)
```

## CLI

```bash
"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/nonce.mjs" call listFarmRebootEvents --input-file ".nonce/requests/list-farm-reboot-events.json"
```

## Input

```ts
export interface ListFarmRebootEventsInput {
  workspace_id: string
  farm_id: string
  page?: number
  page_size?: number
  /**
   * Inclusive start time. Defaults to 7 days before the request time.
   */
  from_time?: string
  /**
   * Inclusive end time. Defaults to the request time.
   */
  to_time?: string
  /**
   * Miner ID filter
   */
  miner_id?: string
}
```

## Output

```ts
export interface ListFarmRebootEventsOutput {
  success: true
  data: {
    /**
     * Reboot Event ID
     */
    id: string
    /**
     * Miner ID
     */
    miner_id: string
    /**
     * Farm ID
     */
    farm_id: string
    /**
     * Miner IP address at query time
     */
    ip: string
    /**
     * Miner hardware model
     */
    model: string | null
    /**
     * Miner manufacturer
     */
    make: string
    /**
     * Miner serial number
     */
    serial_number: string | null
    /**
     * Reboot detection time
     */
    period: string
    /**
     * Snapshot before the reboot
     */
    before: {
      /**
       * Snapshot hashrate in H/s
       */
      hashrate: number | null
      /**
       * Average hashrate in H/s; before uses T-30 to T-5 minutes and after uses T+15 to T+60 minutes. Null when the window has no performance history or when the same miner has another reboot event within 15 minutes.
       */
      avg_hashrate: number | null
      /**
       * Snapshot power consumption in watts
       */
      wattage: number | null
      /**
       * Snapshot average board temperature in Celsius
       */
      temp: number | null
      /**
       * Snapshot uptime in seconds
       */
      uptime: number | null
      /**
       * Snapshot anomaly bitmask. Bits: 0=fan, 1=power, 2=temperature, 3=hashboard, 4=network, 5=firmware, 6=unknown, 8=control_board, 9=pool.
       */
      anomaly_flags: number | null
      /**
       * Snapshot mining mode
       */
      mining_mode: string | null
    }
    /**
     * Snapshot after the reboot
     */
    after: {
      /**
       * Snapshot hashrate in H/s
       */
      hashrate: number | null
      /**
       * Average hashrate in H/s; before uses T-30 to T-5 minutes and after uses T+15 to T+60 minutes. Null when the window has no performance history or when the same miner has another reboot event within 15 minutes.
       */
      avg_hashrate: number | null
      /**
       * Snapshot power consumption in watts
       */
      wattage: number | null
      /**
       * Snapshot average board temperature in Celsius
       */
      temp: number | null
      /**
       * Snapshot uptime in seconds
       */
      uptime: number | null
      /**
       * Snapshot anomaly bitmask. Bits: 0=fan, 1=power, 2=temperature, 3=hashboard, 4=network, 5=firmware, 6=unknown, 8=control_board, 9=pool.
       */
      anomaly_flags: number | null
      /**
       * Snapshot mining mode
       */
      mining_mode: string | null
    }
  }[]
  pagination: {
    total: number
    page: number
    page_size: number
    total_pages: number
  }
  error: null
}
```
