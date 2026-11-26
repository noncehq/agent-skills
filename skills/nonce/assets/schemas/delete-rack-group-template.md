# DeleteRackGroupTemplate

deleteRackGroupTemplate — destructive

Required: `workspace_id`, `farm_id`, `template_id`

## Purpose

Delete Rack Group Template

Delete a template of the farm. Rack groups using it are left without a template. System templates are read-only.

## Code

```js
const result = await nonce.deleteRackGroupTemplate(input, {
  confirmDestructive: true,
  confirmation: "<confirmed target and effect>",
})
```

## CLI

```bash
"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/nonce.mjs" call deleteRackGroupTemplate --input-file ".nonce/requests/delete-rack-group-template.json" --allow-destructive --confirmation "<confirmed target and effect>"
```

## Input

```ts
export interface DeleteRackGroupTemplateInput {
  workspace_id: string
  farm_id: string
  template_id: string
}
```

## Output

```ts
export interface DeleteRackGroupTemplateOutput {
  success: true
  data: null
  error: null
}
```
