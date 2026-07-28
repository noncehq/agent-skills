# createTaskBatchAgentIpDiagnosisCreate

CreateTaskBatch_AgentIp_diagnosisCreate — destructive

Required: `workspace_id`, `farm_id`, `task_name`, `params`

## Purpose

Trigger agent IP diagnosis and upload a CSV report. Uses local diagnostic context first unless refresh is requested.

## Signature

```ts
createTaskBatchAgentIpDiagnosisCreate(input: CreateTaskBatchAgentIpDiagnosisCreateInput, options: DestructiveCallOptions): Promise<CreateTaskBatchAgentIpDiagnosisCreateOutput>
```

## Input

```ts
export interface CreateTaskBatchAgentIpDiagnosisCreateInput {
  workspace_id: string
  farm_id: string
  /**
   * Trigger agent IP diagnosis and upload a CSV report. Uses local diagnostic context first unless refresh is requested.
   */
  task_name: "agent.ip_diagnosis.create"
  /**
   * IP diagnosis parameters.
   */
  params: {
    /**
     * Diagnosis target scope. custom_only uses only custom targets; known_with_custom merges agent known IPs and custom targets; known_only uses only agent known IPs.
     */
    target_scope?: "custom_only" | "known_with_custom" | "known_only"
    /**
     * Custom diagnosis targets
     */
    custom_targets?: {
      /**
       * Optional custom target identifier
       */
      id?: string
      /**
       * Optional custom target label
       */
      label?: string
      /**
       * IPv4 address, CIDR, or hyphen range to diagnose
       */
      value: string
    }[]
    /**
     * Only perform ICMP ping checks when the agent probes targets without local context
     */
    ping_only?: boolean
  }
}
```

## Output

```ts
/**
 * Represents an entity that performs actions in the system (user, API key, or system)
 */
export type Actor = {
  [k: string]: unknown
} | null

export interface CreateTaskBatchAgentIpDiagnosisCreateOutput {
  /**
   * Indicates if the request was successful
   */
  success: boolean
  /**
   * Array of items
   */
  data: MinerTaskBatch[]
  /**
   * Error object (null on success)
   */
  error: null
  meta?: CreateTaskBatchMeta
}
export interface MinerTaskBatch {
  /**
   * Miner task batch ID
   */
  batch_id: string
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
    | "miner.tags.update"
    | "miner.record.delete"
    | "miner.rack_location.update"
  /**
   * Number of tasks in the batch
   */
  task_count: number
  /**
   * Task parameters (JSON). Structure varies by task_name.
   */
  task_params: {
    [k: string]: unknown
  } | null
  created_by: Actor
  /**
   * This is a timestamp in ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ.
   */
  created_at: string
}
export interface CreateTaskBatchMeta {
  summary: {
    created_count: number
    skipped_count: number
  }
  skipped?: {
    /**
     * Reason a miner was skipped during task batch creation. `no_change` = miner is already in the requested state; `unsupported_mode` = miner hardware does not support the requested mode; `miner_not_found` = miner id was not found in the workspace or farm; `unstable_miner` = miner row is flagged unstable and cannot accept actions.
     */
    reason: "no_change" | "unsupported_mode" | "miner_not_found" | "unstable_miner"
    message: string
    miner_ids: string[]
  }[]
}
```
