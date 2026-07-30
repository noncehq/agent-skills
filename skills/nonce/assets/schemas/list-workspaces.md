# listWorkspaces

ListWorkspaces — read-only

## Purpose

List Workspaces

Returns all workspaces the authenticated user has access to, with their role (admin/member/viewer) in each. Call this first to get workspace_id values needed by all other tools.

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
/**
 * Observed output from read-only MCP tool ListWorkspaces.
 */
export interface ListWorkspacesOutput {
  status: number
  data: {
    success: boolean
    data: {
      workspace_id: string
      workspace_name: string
      workspace_slug: string
      role: string
    }[]
    error: null
  }
}
```
