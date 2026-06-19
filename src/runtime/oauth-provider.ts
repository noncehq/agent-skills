import { randomBytes } from "node:crypto";

import type {
  OAuthClientProvider,
  OAuthDiscoveryState,
} from "@modelcontextprotocol/sdk/client/auth.js";
import type {
  OAuthClientInformationMixed,
  OAuthClientMetadata,
  OAuthTokens,
} from "@modelcontextprotocol/sdk/shared/auth.js";
import open from "open";

import { DEFAULT_CALLBACK_PORT, DEFAULT_MCP_ENDPOINT, OAUTH_CALLBACK_PATH } from "./constants.js";
import { createCredentialStore, type CredentialStore } from "./credential-store.js";
import { normalizeProfile } from "./profile.js";
import { createStateStore, type StateStore } from "./state-store.js";

const jsonGet = async <T>(store: CredentialStore, key: string): Promise<T | undefined> => {
  const value = await store.get(key);
  return value ? (JSON.parse(value) as T) : undefined;
};

const jsonSet = async <T>(store: CredentialStore, key: string, value: T): Promise<void> => {
  await store.set(key, JSON.stringify(value));
};

export interface OAuthProviderOptions {
  endpoint?: string;
  openBrowser?: boolean;
  profile?: string;
  redirectUrl?: string;
}

export interface NonceOAuthProvider extends OAuthClientProvider {
  readonly credentialStoreKind: string;
  readonly endpoint: string;
  clearAll(): Promise<void>;
  clearTokens(): Promise<void>;
  tokenMetadata(): Promise<TokenMetadata | undefined>;
}

export interface TokenMetadata {
  savedAt: string;
}

export class LocalNonceOAuthProvider implements NonceOAuthProvider {
  readonly endpoint: string;
  readonly credentialStoreKind: string;
  private readonly credentials: CredentialStore;
  private readonly stateStore: StateStore;
  private readonly profile: string;
  private readonly shouldOpenBrowser: boolean;
  private readonly redirect: string;

  constructor(options: OAuthProviderOptions = {}) {
    this.endpoint = options.endpoint ?? DEFAULT_MCP_ENDPOINT;
    this.profile = normalizeProfile(options.profile);
    this.shouldOpenBrowser = options.openBrowser ?? true;
    this.redirect =
      options.redirectUrl ?? `http://127.0.0.1:${DEFAULT_CALLBACK_PORT}${OAUTH_CALLBACK_PATH}`;
    this.credentials = createCredentialStore({
      profile: this.profile,
    });
    this.credentialStoreKind = this.credentials.kind;
    this.stateStore = createStateStore(this.profile);
  }

  get redirectUrl(): string {
    return this.redirect;
  }

  get clientMetadata(): OAuthClientMetadata {
    return {
      client_name: `Nonce Skill (${this.profile})`,
      grant_types: ["authorization_code", "refresh_token"],
      redirect_uris: [this.redirect],
      response_types: ["code"],
      token_endpoint_auth_method: "none",
    };
  }

  async state(): Promise<string> {
    const state = randomBytes(24).toString("base64url");
    await this.credentials.set("oauth-state", state);
    return state;
  }

  async clientInformation(): Promise<OAuthClientInformationMixed | undefined> {
    return jsonGet<OAuthClientInformationMixed>(this.credentials, "client-information");
  }

  async saveClientInformation(clientInformation: OAuthClientInformationMixed): Promise<void> {
    await jsonSet(this.credentials, "client-information", clientInformation);
  }

  async tokens(): Promise<OAuthTokens | undefined> {
    return jsonGet<OAuthTokens>(this.credentials, "tokens");
  }

  async saveTokens(tokens: OAuthTokens): Promise<void> {
    await jsonSet(this.credentials, "tokens", tokens);
    await this.stateStore.setJson("token-metadata", { savedAt: new Date().toISOString() });
  }

  async tokenMetadata(): Promise<TokenMetadata | undefined> {
    return this.stateStore.getJson<TokenMetadata>("token-metadata");
  }

  async redirectToAuthorization(authorizationUrl: URL): Promise<void> {
    await this.stateStore.setJson("pending-authorization", {
      authorizationUrl: authorizationUrl.toString(),
      createdAt: new Date().toISOString(),
      redirectUrl: this.redirect,
    });
    if (this.shouldOpenBrowser) {
      await open(authorizationUrl.toString());
    } else {
      console.log(JSON.stringify({ authorizationUrl: authorizationUrl.toString() }));
    }
  }

  async saveCodeVerifier(codeVerifier: string): Promise<void> {
    await this.credentials.set("code-verifier", codeVerifier);
  }

  async codeVerifier(): Promise<string> {
    const verifier = await this.credentials.get("code-verifier");
    if (!verifier) {
      throw new Error("Missing OAuth PKCE code verifier. Run auth login again.");
    }
    return verifier;
  }

  async saveDiscoveryState(state: OAuthDiscoveryState): Promise<void> {
    await this.stateStore.setJson("discovery", state);
  }

  async discoveryState(): Promise<OAuthDiscoveryState | undefined> {
    return this.stateStore.getJson<OAuthDiscoveryState>("discovery");
  }

  async invalidateCredentials(
    scope: "all" | "client" | "tokens" | "verifier" | "discovery",
  ): Promise<void> {
    if (scope === "all" || scope === "client") await this.credentials.delete("client-information");
    if (scope === "all" || scope === "tokens") await this.credentials.delete("tokens");
    if (scope === "all" || scope === "verifier") await this.credentials.delete("code-verifier");
    if (scope === "all" || scope === "discovery") await this.stateStore.delete("discovery");
  }

  async clearTokens(): Promise<void> {
    await this.credentials.delete("tokens");
    await this.credentials.delete("code-verifier");
    await this.credentials.delete("oauth-state");
    await this.stateStore.delete("token-metadata");
    await this.stateStore.delete("pending-authorization");
  }

  async clearAll(): Promise<void> {
    await this.clearTokens();
    await this.credentials.delete("client-information");
    await this.stateStore.delete("discovery");
  }

  async expectedState(): Promise<string | undefined> {
    return this.credentials.get("oauth-state");
  }
}

export const createOAuthProvider = (options: OAuthProviderOptions = {}): LocalNonceOAuthProvider =>
  new LocalNonceOAuthProvider(options);
