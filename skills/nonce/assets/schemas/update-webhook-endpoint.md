# UpdateWebhookEndpoint

updateWebhookEndpoint — destructive

Required: `workspace_id`, `endpoint_id`

## Purpose

Update Webhook Endpoint

Change the name, URL, event types, or farms of your webhook endpoint, or set enabled to stop or resume delivery. Fields left out keep their values. Newly added monitor types deliver alerts confirmed after the change.

## Code

```js
const result = await nonce.updateWebhookEndpoint(input, {
  confirmDestructive: true,
  confirmation: "<confirmed target and effect>",
})
```

## CLI

```bash
"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/nonce.mjs" call updateWebhookEndpoint --input-file ".nonce/requests/update-webhook-endpoint.json" --allow-destructive --confirmation "<confirmed target and effect>"
```

## Input

```ts
export interface UpdateWebhookEndpointInput {
  workspace_id: string
  endpoint_id: string
  /**
   * Name shown to the owner
   */
  name?: string
  /**
   * HTTPS URL that receives signed POST requests; must resolve to public addresses
   */
  url?: string
  /**
   * Events delivered to the endpoint, for example ["hashrate_drop.alert_entered"] for alerts only. recovered or ended requires alert_entered of the same monitor type.
   */
  event_types?: (
    | "agent_offline.alert_entered"
    | "agent_offline.recovered"
    | "hashrate_drop.alert_entered"
    | "hashrate_drop.recovered"
    | "hashrate_drop.ended"
  )[]
  /**
   * Farms to receive alerts for: {"type": "all"} for every farm you can access, including later ones, or {"type": "selected", "farm_ids": [...]}
   */
  farms?:
    | {
        type: "all"
      }
    | {
        type: "selected"
        farm_ids: string[]
      }
  /**
   * false stops delivery; true resumes delivery, including after automatic disabling
   */
  enabled?: boolean
}
```

## Output

```ts
export interface UpdateWebhookEndpointOutput {
  success: true
  data: {
    id: string
    workspace_id: string
    /**
     * Workspace member who owns the endpoint
     */
    owner_id: string
    name: string
    /**
     * Host of the URL; the full URL is never returned
     */
    url_host: string
    event_types: (
      | "agent_offline.alert_entered"
      | "agent_offline.recovered"
      | "hashrate_drop.alert_entered"
      | "hashrate_drop.recovered"
      | "hashrate_drop.ended"
    )[]
    /**
     * Farms to receive alerts for: {"type": "all"} for every farm you can access, including later ones, or {"type": "selected", "farm_ids": [...]}
     */
    farms:
      | {
          type: "all"
        }
      | {
          type: "selected"
          farm_ids: string[]
        }
    /**
     * failing: recent deliveries failed after all retries; disabled: delivery is stopped
     */
    status: "enabled" | "failing" | "disabled"
    /**
     * persistent_failures: deliveries kept failing after all retries for several days
     */
    disabled_reason: ("persistent_failures" | "manual") | null
    /**
     * Deliveries that failed after all retries in a row
     */
    consecutive_failures: number
    /**
     * When the current run of failures began; any successful delivery clears it
     */
    first_failure_at: string | null
    last_success_at: string | null
    last_failure_at: string | null
    /**
     * For example http_500, timeout, address_blocked
     */
    last_failure_reason: string | null
    created_at: string
    updated_at: string
  }
  error: null
}
```
