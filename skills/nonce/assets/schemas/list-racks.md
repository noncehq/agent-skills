# ListRacks

listRacks — read-only

Required: `workspace_id`, `farm_id`

## Purpose

List Racks

Deprecated: racks are replaced by rack groups. Use `ListRackGroups` instead. This operation will be removed once it has no callers. List the racks of a farm with their size, allocation and miner counts, in natural name order. A rack exists without miners; search miners with `rack` to get its miners, or with `rack: null` for miners without a rack.

## Code

```js
const result = await nonce.listRacks(input)
```

## CLI

```bash
"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/nonce.mjs" call listRacks --input-file ".nonce/requests/list-racks.json"
```

## Input

```ts
export interface ListRacksInput {
  workspace_id: string
  farm_id: string
}
```

## Output

```ts
export interface ListRacksOutput {
  success: true
  data: {
    /**
     * Rack ID
     */
    id: string
    /**
     * Rack name
     */
    rack: string
    /**
     * Number of rows
     */
    rows: number
    /**
     * Number of columns
     */
    columns: number
    /**
     * How miners take slots: sequential places each miner by its IP from the lowest IP in the rack and keeps gaps, dynamic fills slots in IP order without gaps, manual keeps the slot saved on each miner
     */
    allocation: "sequential" | "dynamic" | "manual"
    /**
     * Lists candidate miners when the rack is edited; not used to place miners.
     */
    ip_range: string | null
    /**
     * Miners in the rack; equals searching miners with this rack
     */
    miner_count: number
  }[]
  error: null
}
```
