# GetFarm

getFarm — read-only

Required: `workspace_id`, `farm_id`

## Purpose

Get Farm

Get a farm by ID.

## Code

```js
const result = await nonce.getFarm(input)
```

## CLI

```bash
"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/nonce.mjs" call getFarm --input-file ".nonce/requests/get-farm.json"
```

## Input

```ts
export interface GetFarmInput {
  workspace_id: string
  farm_id: string
}
```

## Output

```ts
export interface GetFarmOutput {
  success: true
  data: Farm
  error: null
}
export interface Farm {
  /**
   * Farm ID
   */
  id: string
  /**
   * Owning workspace ID
   */
  workspace_id: string
  /**
   * Farm name
   */
  name: string | null
  /**
   * Farm description
   */
  description: string | null
  /**
   * Farm location
   */
  location: string | null
  /**
   * Farm operational status
   */
  status:
    | "running"
    | "shutdown"
    | "curtailment"
    | "partial_curtailment"
    | "leasing"
    | "maintenance"
    | "decommissioning"
    | "decommissioned"
  /**
   * Whether the farm is archived
   */
  archived: boolean
  /**
   * Hosting fee in USD per kWh
   */
  hosting_fee: number | null
  /**
   * Creation time in ISO 8601 format
   */
  created_at: string | null
  /**
   * Last update time in ISO 8601 format
   */
  updated_at: string | null
}
```
