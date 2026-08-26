# ListWorkspaces

listWorkspaces — read-only

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
export interface ListWorkspacesInput {}
```

## Output

```ts
export interface ListWorkspacesOutput {
  success: true
  data: {
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
    relations: ("member" | "grantee")[]
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
  }[]
  error: null
}
```
