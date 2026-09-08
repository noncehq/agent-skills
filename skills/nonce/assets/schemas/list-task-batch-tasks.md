# ListTaskBatchTasks

listTaskBatchTasks — read-only

Required: `workspace_id`, `farm_id`, `task_batch_id`

## Purpose

List Task Batch Tasks

## Code

```js
const result = await nonce.listTaskBatchTasks(input)
```

## CLI

```bash
"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/nonce.mjs" call listTaskBatchTasks --input-file ".nonce/requests/list-task-batch-tasks.json"
```

## Input

```ts
export interface ListTaskBatchTasksInput {
  workspace_id: string
  farm_id: string
  /**
   * Task Batch ID
   */
  task_batch_id: string
  page?: number
  page_size?: number
  /**
   * Task status filter
   */
  status?: "created" | "queuing" | "pending" | "succeed" | "failed" | "timed_out" | "cancelled"
}
```

## Output

```ts
export interface ListTaskBatchTasksOutput {
  success: true
  data: {
    /**
     * Task ID
     */
    id: string
    /**
     * Target Miner ID, or null for an Agent task
     */
    miner_id: string | null
    /**
     * Task execution status. `created` = enqueued but not yet picked up by an agent; `queuing` = accepted by the agent and waiting in its local queue; `pending` = actively executing on the miner; `succeed` = finished successfully; `failed` = finished with an error; `timed_out` = exceeded its execution deadline; `cancelled` = aborted before completion.
     */
    status: "created" | "queuing" | "pending" | "succeed" | "failed" | "timed_out" | "cancelled"
    /**
     * Task parameters
     */
    params: {
      [k: string]: unknown
    } | null
    /**
     * Task creation time
     */
    created_at: string
    /**
     * Time the task entered the Agent queue
     */
    queuing_at: string | null
    /**
     * Time execution started
     */
    pending_at: string | null
    /**
     * Time execution succeeded
     */
    succeed_at: string | null
    /**
     * Time execution failed
     */
    failed_at: string | null
    /**
     * Time execution timed out
     */
    timed_out_at: string | null
    /**
     * Time execution was cancelled
     */
    cancelled_at: string | null
    /**
     * Task result
     */
    result: {
      [k: string]: unknown
    } | null
    /**
     * Task error
     */
    error: {
      message: string
    } | null
    /**
     * Signed task log download URL
     */
    log_download_url: string | null
    /**
     * Task log size in bytes
     */
    log_file_size: number | null
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
