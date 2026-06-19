import type { NonceMcpClient } from "./generated/tool-signatures.js";

export interface CreateNonceClientOptions {
  profile?: string;
}

export const createNonceClient = (
  options: CreateNonceClientOptions = {},
): Promise<NonceMcpClient> => {
  void options;
  return Promise.reject(new Error("Nonce MCP client is not implemented yet"));
};
