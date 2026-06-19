export interface CredentialStore {
  delete(key: string): Promise<void>;
  get(key: string): Promise<string | undefined>;
  set(key: string, value: string): Promise<void>;
}

export const createCredentialStore = (): CredentialStore => {
  throw new Error("Nonce credential store is not implemented yet");
};
