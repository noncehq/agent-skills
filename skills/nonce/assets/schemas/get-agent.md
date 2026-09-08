# GetAgent

getAgent — read-only

Required: `workspace_id`, `farm_id`, `agent_id`

## Purpose

Get Agent

Get an agent by ID.

## Code

```js
const result = await nonce.getAgent(input)
```

## CLI

```bash
"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/nonce.mjs" call getAgent --input-file ".nonce/requests/get-agent.json"
```

## Input

```ts
export interface GetAgentInput {
  workspace_id: string
  farm_id: string
  agent_id: string
}
```

## Output

```ts
/**
 * Public Agent host identity
 */
export type AgentHost = {
  /**
   * Host name reported by the Agent
   */
  hostname: string | null
  /**
   * Operating system family
   */
  platform: string | null
  /**
   * Operating system release description
   */
  os: string | null
  /**
   * Agent host IP address
   */
  ip: string | null
} | null

export interface GetAgentOutput {
  success: true
  data: Agent
  error: null
}
export interface Agent {
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
  host: AgentHost
}
```
