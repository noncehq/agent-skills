# UpdateRackGroupTemplate

updateRackGroupTemplate — destructive

Required: `workspace_id`, `farm_id`, `template_id`

## Purpose

Update Rack Group Template

Change a template of the farm; omitted fields keep their values. Rack groups using the template follow the change. System templates are read-only; create a farm template instead.

## Code

```js
const result = await nonce.updateRackGroupTemplate(input, {
  confirmDestructive: true,
  confirmation: "<confirmed target and effect>",
})
```

## CLI

```bash
"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/nonce.mjs" call updateRackGroupTemplate --input-file ".nonce/requests/update-rack-group-template.json" --allow-destructive --confirmation "<confirmed target and effect>"
```

## Input

```ts
export interface UpdateRackGroupTemplateInput {
  workspace_id: string
  farm_id: string
  template_id: string
  name?: string
  racks?: number
  rows?: number
  columns?: number
  /**
   * `sequential` gives each IP a fixed slot and keeps gaps; `dynamic` fills slots in IP order
   */
  mode?: "sequential" | "dynamic"
}
```

## Output

```ts
export interface UpdateRackGroupTemplateOutput {
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
