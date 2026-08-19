# listWorkspaces

ListWorkspaces — read-only

## Purpose

List Workspaces

List accessible workspaces.

## Code

```js
const result = await nonce.listWorkspaces(input)
```

## CLI

```bash
"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/nonce.mjs" call listWorkspaces --input-file ".nonce/requests/list-workspaces.json"
```

## Input

```ts
export type ListWorkspacesInput = {} & object
```

## Output

```ts
export interface ListWorkspacesOutput {
  success: true
  data: Workspace[]
  error: null
}
export interface Workspace {
  /**
   * Workspace ID
   */
  id: string
  /**
   * Workspace name
   */
  name: string
  /**
   * Workspace slug
   */
  slug: string
  /**
   * @minItems 1
   */
  relations: ["member" | "grantee", ...("member" | "grantee")[]]
  /**
   * Effective Public API permissions
   */
  permissions: (
    | "workspace.read"
    | "workspace.manage"
    | "farm.read"
    | "farm.manage"
    | "miner.read"
    | "miner.manage"
    | "miner.high_risk_manage"
  )[]
}
```
