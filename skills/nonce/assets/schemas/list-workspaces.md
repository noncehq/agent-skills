# listWorkspaces

ListWorkspaces — read-only

## Purpose

List Workspaces

Returns all workspaces the authenticated user has access to, with their role (admin/member/viewer) in each. Call this first to get workspace_id values needed by all other tools.

## Signature

```ts
listWorkspaces(input?: ListWorkspacesInput, options?: ReadonlyCallOptions): Promise<ListWorkspacesOutput>
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
