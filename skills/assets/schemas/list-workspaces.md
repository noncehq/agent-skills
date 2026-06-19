# listWorkspaces

ListWorkspaces — read-only

## Signature

```ts
listWorkspaces(input?: ListWorkspacesInput, options?: ReadonlyCallOptions): Promise<ListWorkspacesOutput>
```

## Input

```ts
type ListWorkspacesInput = Record<string, unknown>;
```

## Output

```ts
/**
 * Observed output from read-only MCP tool ListWorkspaces.
 */
interface ListWorkspacesOutput {
  status: number;
  data: {
    success: boolean;
    data: {
      workspace_id: string;
      workspace_name: string;
      workspace_slug: string;
      role: string;
    }[];
    error: null;
  };
}
```
