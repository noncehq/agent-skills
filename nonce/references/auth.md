# Authentication

Use MCP OAuth with a local `OAuthClientProvider`.

- Prefer macOS Keychain or Windows Credential Manager for tokens.
- If OS credential storage is unavailable, ask for confirmation before falling back to a user-only local file.
- Store discovery state and client registration metadata separately from tokens.
- Never print access tokens, refresh tokens, PKCE verifiers, or authorization codes.
- Support browser launch and manual callback paste flows.
