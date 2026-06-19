# listMinerRebootEvents

ListMinerRebootEvents — read-only

Required: `workspace_id`, `farm_id`

## Signature

```ts
listMinerRebootEvents(input: ListMinerRebootEventsInput, options?: ReadonlyCallOptions): Promise<ListMinerRebootEventsOutput>
```

## Input

```ts
interface ListMinerRebootEventsInput {
  workspace_id: string
  farm_id: string
  /**
   * Page number (default: 1)
   */
  page?: number
  /**
   * Number of items per page (default: 10, max: 10000)
   */
  pageSize?: number
  /**
   * Filter by miner ID
   */
  miner_id?: string
  /**
   * Filter by reboot source: automation, api, user, or external
   */
  source?: "automation" | "api" | "user" | "external"
  /**
   * Start time filter. Defaults to 7 days ago if not provided.
   */
  from_time?: string
  /**
   * End time filter. Defaults to now if not provided.
   */
  to_time?: string
}
```

## Output

```ts
interface ListMinerRebootEventsOutput {
  /**
   * Indicates if the request was successful
   */
  success: boolean
  /**
   * Array of items
   */
  data: ({
    /**
     * Reboot event ID
     */
    id: string
    /**
     * Workspace ID
     */
    workspace_id: string
    /**
     * Farm ID
     */
    farm_id: string
    /**
     * Miner ID
     */
    miner_id: string
    /**
     * Detection period (ISO 8601)
     */
    period: string
    /**
     * Uptime before reboot (seconds)
     */
    pre_uptime: number | null
    /**
     * Uptime after reboot (seconds)
     */
    post_uptime: number | null
    /**
     * Hashrate before reboot (H/s)
     */
    pre_hashrate: number | null
    /**
     * Hashrate after reboot (H/s)
     */
    post_hashrate: number | null
    /**
     * Reboot source: automation, api, user, or external
     */
    source: string
    /**
     * Associated agent_task ID if platform-initiated
     */
    source_task_id: string | null
    /**
     * Record creation time (ISO 8601)
     */
    created_at: string | null
  })[]
  /**
   * Pagination metadata
   */
  pagination: {
    /**
     * Total number of items
     */
    total: number
    /**
     * Maximum number of items per page
     */
    limit: number
    /**
     * Number of items to skip
     */
    offset: number
    /**
     * Whether there are more items after this page
     */
    hasNext: boolean
    /**
     * Whether there are items before this page
     */
    hasPrevious: boolean
  }
  /**
   * Error object (null on success)
   */
  error: null
}
```
