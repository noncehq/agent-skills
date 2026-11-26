# UpdateFarmLayout

updateFarmLayout — destructive

Required: `workspace_id`, `farm_id`, `rows`, `expected_updated_at`

## Purpose

Update Farm Layout

Replace the whole layout of a farm. Refer to rack groups by id from ListRackGroups; a rack group takes at most one position, and a position stacks at most two. Pass the `updated_at` read with GetFarmLayout as `expected_updated_at`, or null when no layout was saved; the save is rejected if the layout changed since.

## Code

```js
const result = await nonce.updateFarmLayout(input, {
  confirmDestructive: true,
  confirmation: "<confirmed target and effect>",
})
```

## CLI

```bash
"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/nonce.mjs" call updateFarmLayout --input-file ".nonce/requests/update-farm-layout.json" --allow-destructive --confirmation "<confirmed target and effect>"
```

## Input

```ts
export interface UpdateFarmLayoutInput {
  workspace_id: string
  farm_id: string
  rows: {
    /**
     * Rack group ids at each position from the floor up; empty for an empty position
     */
    positions: string[][]
    /**
     * Aisle after this row, if any
     */
    aisle_after: ("cold" | "hot") | null
  }[]
  /**
   * updated_at as last read, null when no layout was saved; the save is rejected if the layout changed since
   */
  expected_updated_at: string | null
}
```

## Output

```ts
export interface UpdateFarmLayoutOutput {
  success: true
  data: {
    /**
     * Rows from front to back; null until someone arranges the farm
     */
    rows:
      | {
          /**
           * Rack group ids at each position from the floor up; empty for an empty position
           */
          positions: string[][]
          /**
           * Aisle after this row, if any
           */
          aisle_after: ("cold" | "hot") | null
        }[]
      | null
    updated_at: string | null
  }
  error: null
}
```
