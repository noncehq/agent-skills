# GetWebhookEndpoint

getWebhookEndpoint — read-only

Required: `workspace_id`, `endpoint_id`

## Purpose

Get Webhook Endpoint

Get one of your webhook endpoints. status, consecutive_failures, and last_failure_reason explain missing deliveries.

## Code

```js
const result = await nonce.getWebhookEndpoint(input)
```

## CLI

```bash
"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/nonce.mjs" call getWebhookEndpoint --input-file ".nonce/requests/get-webhook-endpoint.json"
```

## Input

```ts
export interface GetWebhookEndpointInput {
  workspace_id: string
  endpoint_id: string
}
```

## Output

```ts
export interface GetWebhookEndpointOutput {
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
