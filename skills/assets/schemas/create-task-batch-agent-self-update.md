# createTaskBatchAgentSelfUpdate

CreateTaskBatch_AgentSelfUpdate — destructive

Required: `workspace_id`, `farm_id`, `task_name`

## Signature

```ts
createTaskBatchAgentSelfUpdate(input: CreateTaskBatchAgentSelfUpdateInput, options: DestructiveCallOptions): Promise<CreateTaskBatchAgentSelfUpdateOutput>
```

## Input

```ts
interface CreateTaskBatchAgentSelfUpdateInput {
  workspace_id: string
  farm_id: string
  /**
   * Trigger agent to self-upgrade to a newer binary. Agent restarts after install; brief control-plane downtime, no miner impact.
   */
  task_name: "agent.self.update"
  /**
   * Agent self-update parameters (optional). All fields default to agent-configured values when omitted.
   */
  params?: {
    /**
     * Agent binary download URL (optional). Agent uses its configured default when omitted.
     */
    binary_url?: string
    /**
     * Legacy MD5 checksum of the agent binary (optional). Kept as a supplementary integrity check and not used as the security authority.
     */
    md5?: string
    /**
     * Ed25519 detached signature of the agent binary. Required whenever binary_url is provided so the agent can authorize the remote self-update.
     */
    signature?: string
    /**
     * Target agent version (optional). Used by agent to validate upgrade payload.
     */
    target_version?: string
  }
}
```

## Output

```ts
interface CreateTaskBatchAgentSelfUpdateOutput {
  /**
   * Indicates if the request was successful
   */
  success: boolean
  /**
   * Array of items
   */
  data: ({
    /**
     * Miner task batch ID
     */
    batch_id: string
    /**
     * Miner task name
     */
    task_name: "agent.scan.create" | "agent.ip_diagnosis.create" | "agent.self.update" | "miner.system.reboot" | "miner.log.get" | "miner.light.update" | "miner.power_mode.update" | "miner.pool.update" | "miner.pool.lock" | "miner.firmware.update" | "miner.asset.update" | "miner.asset.delete" | "miner.rack_location.update"
    /**
     * Number of tasks in the batch
     */
    task_count: number
    /**
     * Task parameters (JSON). Structure varies by task_name.
     */
    task_params: Record<string, unknown> | null
    /**
     * Represents an entity that performs actions in the system (user, API key, or system)
     */
    created_by: Record<string, unknown> | null
    /**
     * This is a timestamp in ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ.
     */
    created_at: string
  })[]
  /**
   * Error object (null on success)
   */
  error: null
  meta: {
    summary: {
      created_count: number
      skipped_count: number
    }
    skipped?: ({
      /**
       * Reason a miner was skipped during task batch creation. `no_change` = miner is already in the requested state; `unsupported_mode` = miner hardware does not support the requested mode; `miner_not_found` = miner id was not found in the workspace or farm; `unstable_miner` = miner row is flagged unstable and cannot accept actions.
       */
      reason: "no_change" | "unsupported_mode" | "miner_not_found" | "unstable_miner"
      message: string
      miner_ids: string[]
    })[]
  }
}
```
