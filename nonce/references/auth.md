# Authentication

Use MCP OAuth with a local `OAuthClientProvider`.

- Default endpoint: `https://mcp.nonce.app/mcp`.
- Check status with `vp run nonce:auth -- status`.
- Start browser login with `vp run nonce:auth -- login`.
- For headless use, run `vp run nonce:auth -- login --no-open`, open the printed authorization URL manually, then either let the local callback server receive the redirect or pass the copied callback to `vp run nonce:auth -- callback <url-or-code>`.
- Verify the saved token with `vp run nonce:auth -- verify`; this initializes MCP and lists tools, but does not call any business tool.
- Clear tokens with `vp run nonce:auth -- logout`; use `--all` to remove client registration and discovery state too.
- Prefer macOS Keychain or Windows Credential Manager for tokens.
- The first implementation supports macOS Keychain and a cross-platform user-only local file fallback. Windows uses the file fallback until Credential Manager support is added.
- Store discovery state and client registration metadata separately from tokens.
- Never print access tokens, refresh tokens, PKCE verifiers, or authorization codes.
- Support browser launch and manual callback paste flows.
