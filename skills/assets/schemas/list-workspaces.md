# listWorkspaces

ListWorkspaces — read-only

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
