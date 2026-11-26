# CreateWebhookEndpoint

createWebhookEndpoint — destructive

Required: `workspace_id`, `name`, `url`, `event_types`, `farms`

## Purpose

Create Webhook Endpoint

Send the chosen event types of the chosen farms to an HTTPS URL, for example only hashrate_drop.alert_entered. Alerts confirmed after creation are delivered. The response contains the signing secret, which is never returned again. Each alert is sent as a JSON POST signed with Standard Webhooks headers (webhook-id, webhook-timestamp, webhook-signature: v1,base64 HMAC-SHA256 of "<webhook-id>.<webhook-timestamp>.<body>" keyed by the base64-decoded part of the whsec_ secret). webhook-id stays the same across retries; use it to drop duplicates. A 2xx response is success; 408, 429, 5xx, and timeouts (10 seconds) are retried for about two hours with exponential backoff and jitter; other responses are not retried. An endpoint whose deliveries keep failing after all retries for 3 days is disabled and its owner is emailed.

## Code

```js
const result = await nonce.createWebhookEndpoint(input, {
  confirmDestructive: true,
  confirmation: "<confirmed target and effect>",
})
```

## CLI

```bash
"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/nonce.mjs" call createWebhookEndpoint --input-file ".nonce/requests/create-webhook-endpoint.json" --allow-destructive --confirmation "<confirmed target and effect>"
```

## Input

```ts
export interface CreateWebhookEndpointInput {
  workspace_id: string
  /**
   * Name shown to the owner
   */
  name: string
  /**
   * HTTPS URL that receives signed POST requests; must resolve to public addresses
   */
  url: string
  /**
   * Events delivered to the endpoint, for example ["hashrate_drop.alert_entered"] for alerts only. recovered or ended requires alert_entered of the same monitor type.
   */
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
}
```

## Output

```ts
export interface CreateWebhookEndpointOutput {
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
    /**
     * Standard Webhooks signing secret (whsec_...). Returned only here; store it now.
     */
    secret: string
  }
  error: null
}
```
