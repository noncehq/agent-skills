# ListAutomations

listAutomations — read-only

Required: `workspace_id`, `farm_id`

## Purpose

List Automations

List automations configured in the requested farm.

## Code

```js
const result = await nonce.listAutomations(input)
```

## CLI

```bash
"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/nonce.mjs" call listAutomations --input-file ".nonce/requests/list-automations.json"
```

## Input

```ts
export interface ListAutomationsInput {
  workspace_id: string
  farm_id: string
  page?: number
  page_size?: number
}
```

## Output

```ts
export interface ListAutomationsOutput {
  success: true
  data: {
    /**
     * Automation ID
     */
    id: string
    /**
     * Automation name
     */
    name: string
    /**
     * Task type the automation dispatches
     */
    task_name: string
    /**
     * Whether the automation is active
     */
    enabled: boolean
    /**
     * Creation time
     */
    created_at: string
    /**
     * Last update time
     */
    updated_at: string
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
