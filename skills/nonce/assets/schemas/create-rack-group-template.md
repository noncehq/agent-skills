# CreateRackGroupTemplate

createRackGroupTemplate — destructive

Required: `workspace_id`, `farm_id`, `name`, `racks`, `rows`, `columns`, `mode`

## Purpose

Create Rack Group Template

Create a template for the farm, for rack group models that no system template describes. Names are unique within the farm. Apply the template to rack groups with UpdateRackGroups.

## Code

```js
const result = await nonce.createRackGroupTemplate(input, {
  confirmDestructive: true,
  confirmation: "<confirmed target and effect>",
})
```

## CLI

```bash
"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/nonce.mjs" call createRackGroupTemplate --input-file ".nonce/requests/create-rack-group-template.json" --allow-destructive --confirmation "<confirmed target and effect>"
```

## Input

```ts
export interface CreateRackGroupTemplateInput {
  workspace_id: string
  farm_id: string
  name: string
  racks: number
  rows: number
  columns: number
  /**
   * `sequential` gives each IP a fixed slot and keeps gaps; `dynamic` fills slots in IP order
   */
  mode: "sequential" | "dynamic"
}
```

## Output

```ts
export interface CreateRackGroupTemplateOutput {
  success: true
  data: {
    name: string
    racks: number
    rows: number
    columns: number
    /**
     * `sequential` gives each IP a fixed slot and keeps gaps; `dynamic` fills slots in IP order
     */
    mode: "sequential" | "dynamic"
    id: string
    /**
     * Stable identifier of a system template, e.g. antspace-hw5
     */
    key: string | null
    /**
     * System templates are shared by every farm and read-only
     */
    is_system: boolean
  }
  error: null
}
```
