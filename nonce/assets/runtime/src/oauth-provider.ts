export interface OAuthProviderOptions {
  profile: string;
}

export const createOAuthProvider = (options: OAuthProviderOptions): never => {
  void options;
  throw new Error("Nonce OAuth provider is not implemented yet");
};
