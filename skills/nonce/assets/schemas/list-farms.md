# ListFarms

listFarms — read-only

Required: `workspace_id`

## Purpose

List Farms

List farms in the workspace.

## Code

```js
const result = await nonce.listFarms(input)
```

## CLI

```bash
"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/nonce.mjs" call listFarms --input-file ".nonce/requests/list-farms.json"
```

## Input

```ts
export interface ListFarmsInput {
  workspace_id: string
  page?: number
  page_size?: number
}
```

## Output

```ts
export interface ListFarmsOutput {
  success: true
  data: Farm[]
  pagination: {
    total: number
    page: number
    page_size: number
    total_pages: number
  }
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
