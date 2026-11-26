# GetFarmLayout

getFarmLayout — read-only

Required: `workspace_id`, `farm_id`

## Purpose

Get Farm Layout

Get the layout of a farm: rows from front to back, the rack groups stacked at each position from the floor up, and the aisle after each row. `rows` is null until someone arranges the farm. Rows may refer to rack groups deleted since; skip those. Pass `updated_at` as `expected_updated_at` when saving with UpdateFarmLayout.

## Code

```js
const result = await nonce.getFarmLayout(input)
```

## CLI

```bash
"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/nonce.mjs" call getFarmLayout --input-file ".nonce/requests/get-farm-layout.json"
```

## Input

```ts
export interface GetFarmLayoutInput {
  workspace_id: string
  farm_id: string
}
```

## Output

```ts
export interface GetFarmLayoutOutput {
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
