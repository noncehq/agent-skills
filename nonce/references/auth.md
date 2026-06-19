# Authentication

Use MCP OAuth with a local `OAuthClientProvider`.

- Default endpoint: `https://mcp.nonce.app/mcp`.
- Run `vp run ...` commands from the skill directory.
- Check status with `vp run nonce:auth -- status`.
- Start browser login with `vp run nonce:auth -- login`; it exits after the local callback completes.
- For manual browser launch, run `vp run nonce:auth -- login --no-open`, open the printed authorization URL, and let the redirect reach the local callback server.
- If the redirect cannot reach the local callback server, keep `login --no-open` running and complete the exchange from another terminal with `vp run nonce:auth -- callback <callback-url-or-code>`. The login process exits after it detects the saved token.
- Verify the saved token with `vp run nonce:auth -- verify`; this initializes MCP and lists tools, but does not call any business tool.
- Clear tokens with `vp run nonce:auth -- logout`; use `--all` to remove client registration and discovery state too.
- macOS uses Keychain by default unless `--file-credentials` is passed.
- Windows uses the user-only local file fallback in this version.
- Store discovery state and client registration metadata separately from tokens.
- Never print access tokens, refresh tokens, PKCE verifiers, or authorization codes.
- Support browser launch and manual callback paste flows.
