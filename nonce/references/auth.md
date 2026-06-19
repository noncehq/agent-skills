# Authentication

Use MCP OAuth with a local `OAuthClientProvider`.

- Default endpoint: `https://mcp.nonce.app/mcp`.
- Run `vp run ...` commands from the skill directory.
- Credentials are saved in the local profile.
- Check status with `vp run nonce:auth -- status`.
- Start browser login with `vp run nonce:auth -- login`; it exits after the local callback completes.
- For manual browser launch, run `vp run nonce:auth -- login --no-open`, open the printed authorization URL, and let the redirect reach the local callback server.
- If the redirect cannot reach the local callback server, keep `login --no-open` running and complete the exchange from another terminal with `vp run nonce:auth -- callback "<callback-url-or-code>"`. Quote pasted callback URLs because they can contain shell metacharacters such as `&`. The login process exits after it detects the saved token.
- Verify the saved token with `vp run nonce:auth -- verify`; this initializes MCP and lists tools, but does not call any business tool.
- Clear tokens with `vp run nonce:auth -- logout`; use `--all` to remove client registration and discovery state too.
- Store discovery state and client registration metadata separately from tokens.
- Never print access tokens, refresh tokens, PKCE verifiers, or authorization codes.
- Support browser launch and manual callback paste flows.
