export interface CallOptions {
  timeoutMs?: number;
}

export type ReadonlyCallOptions = CallOptions;

export interface DestructiveCallOptions extends CallOptions {
  confirmDestructive: true;
  confirmation: string;
}

export type ListWorkspacesInput = Record<string, never>;

export type ListWorkspacesOutput = unknown;

export interface NonceMcpClient {
  listWorkspaces(
    input?: ListWorkspacesInput,
    options?: ReadonlyCallOptions,
  ): Promise<ListWorkspacesOutput>;
}
