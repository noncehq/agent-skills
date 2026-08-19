# listAgents

ListAgents — read-only

Required: `workspace_id`, `farm_id`

## Purpose

List Agents

List agents in the farm.

## Code

```js
const result = await nonce.listAgents(input)
```

## CLI

```bash
"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/nonce.mjs" call listAgents --input-file ".nonce/requests/list-agents.json"
```

## Input

```ts
export interface ListAgentsInput {
  workspace_id: string
  farm_id: string
  page?: number
  page_size?: number
}
```

## Output

```ts
export interface ListAgentsOutput {
  success: true
  data: AgentSummary[]
  pagination: {
    total: number
    page: number
    page_size: number
    total_pages: number
  }
  error: null
}
export interface AgentSummary {
  /**
   * Agent ID
   */
  id: string
  /**
   * Owning workspace ID
   */
  workspace_id: string
  /**
   * Owning farm ID
   */
  farm_id: string
  /**
   * Current Agent status
   */
  status: string | null
  /**
   * Installed Agent version
   */
  version: string | null
  /**
   * Agent uptime in seconds
   */
  uptime: number | null
  /**
   * Last online time
   */
  last_online_at: string | null
  /**
   * Last heartbeat time
   */
  last_updated_at: string | null
}
```
