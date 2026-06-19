# getTaskBatchTasks

GetTaskBatchTasks — read-only

Required: `workspace_id`, `farm_id`, `batch_id`

## Signature

```ts
getTaskBatchTasks(input: GetTaskBatchTasksInput, options?: ReadonlyCallOptions): Promise<GetTaskBatchTasksOutput>
```

## Input

```ts
interface GetTaskBatchTasksInput {
  workspace_id: string;
  farm_id: string;
  batch_id: string;
  /**
   * Page number (default: 1)
   */
  page?: number;
  /**
   * Number of items per page (default: 10, max: 10000)
   */
  pageSize?: number;
  /**
   * Filter tasks by status
   */
  status?: string;
}
```

## Output

```ts
interface GetTaskBatchTasksOutput {
  /**
   * Indicates if the request was successful
   */
  success: boolean;
  /**
   * Array of items
   */
  data: {
    /**
     * Miner task ID
     */
    id: string;
    /**
     * Miner task batch ID
     */
    batch_id: string;
    /**
     * Miner task name
     */
    task_name:
      | "agent.scan.create"
      | "agent.ip_diagnosis.create"
      | "agent.self.update"
      | "miner.system.reboot"
      | "miner.log.get"
      | "miner.light.update"
      | "miner.power_mode.update"
      | "miner.pool.update"
      | "miner.pool.lock"
      | "miner.firmware.update"
      | "miner.asset.update"
      | "miner.asset.delete"
      | "miner.rack_location.update";
    /**
     * Miner Id
     */
    miner_id?: string | null;
    /**
     * Task execution status. `created` = enqueued but not yet picked up by an agent; `queuing` = accepted by the agent and waiting in its local queue; `pending` = actively executing on the miner; `succeed` = finished successfully; `failed` = finished with an error; `timed_out` = exceeded its execution deadline; `cancelled` = aborted before completion.
     */
    status: "created" | "queuing" | "pending" | "succeed" | "failed" | "timed_out" | "cancelled";
    /**
     * Task parameters (JSON)
     */
    params?: Record<string, unknown> | null;
    /**
     * This is a timestamp in ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ.
     */
    created_at: string;
    /**
     * This is a timestamp in ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ.
     */
    queuing_at?: string;
    /**
     * This is a timestamp in ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ.
     */
    pending_at?: string;
    /**
     * This is a timestamp in ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ.
     */
    succeed_at?: string;
    /**
     * This is a timestamp in ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ.
     */
    failed_at?: string;
    /**
     * This is a timestamp in ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ.
     */
    timed_out_at?: string;
    /**
     * This is a timestamp in ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ.
     */
    cancelled_at?: string;
    /**
     * Task execution result (JSON)
     */
    result?: Record<string, unknown>;
    error?: {
      /**
       * Error message
       */
      message: string;
    };
    /**
     * Miner log file download URL (signed URL from Supabase Storage, valid for 2 weeks)
     */
    log_download_url?: string | null;
    /**
     * Miner log file size in bytes
     */
    log_file_size?: number | null;
  }[];
  /**
   * Pagination metadata
   */
  pagination: {
    /**
     * Total number of items
     */
    total: number;
    /**
     * Maximum number of items per page
     */
    limit: number;
    /**
     * Number of items to skip
     */
    offset: number;
    /**
     * Whether there are more items after this page
     */
    hasNext: boolean;
    /**
     * Whether there are items before this page
     */
    hasPrevious: boolean;
  };
  /**
   * Error object (null on success)
   */
  error: null;
}
```
