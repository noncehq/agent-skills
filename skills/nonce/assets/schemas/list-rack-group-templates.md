# ListRackGroupTemplates

listRackGroupTemplates — read-only

Required: `workspace_id`, `farm_id`

## Purpose

List Rack Group Templates

List the templates a farm can apply to its rack groups: read-only system templates shared by every farm, then the templates of the farm, each by name. A template sets the racks of a rack group, the rows and columns of each rack, and how miners take slots.

## Code

```js
const result = await nonce.listRackGroupTemplates(input)
```

## CLI

```bash
"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/nonce.mjs" call listRackGroupTemplates --input-file ".nonce/requests/list-rack-group-templates.json"
```

## Input

```ts
export interface ListRackGroupTemplatesInput {
  workspace_id: string
  farm_id: string
}
```

## Output

```ts
export interface ListRackGroupTemplatesOutput {
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
  }[]
  error: null
}
```
