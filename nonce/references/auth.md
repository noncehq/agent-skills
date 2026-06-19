# Authentication

Use the local auth runner for Nonce authentication.

- Default endpoint: `https://mcp.nonce.app/mcp`.
- Run commands with the installed skill root as the working directory. The skill root is the directory containing `SKILL.md`; do not assume any fixed filesystem path.
- On macOS, set `$NONCE_SKILL_HOME` to the installed skill root and run `cd "$NONCE_SKILL_HOME"` first.
- On Windows PowerShell, set `$NonceSkillHome` to the installed skill root and run `Set-Location $NonceSkillHome` first.
- Credentials are saved in the local profile.
- Check status with `vp node -- scripts/auth.mjs status`.
- Start browser login with `vp node -- scripts/auth.mjs login`; it exits after the local callback completes.
- For manual browser launch, run `vp node -- scripts/auth.mjs login --no-open`, open the printed authorization URL, and let the redirect reach the local callback server.
- If the redirect cannot reach the local callback server, keep `login --no-open` running and complete the exchange from another terminal with `vp node -- scripts/auth.mjs callback "<callback-url-or-code>"`. Quote pasted callback URLs because they can contain shell metacharacters such as `&`. The login process exits after it detects the saved token.
- Verify the saved token with `vp node -- scripts/auth.mjs verify`; this initializes the local connection and lists available methods, but does not call any business method.
- Clear tokens with `vp node -- scripts/auth.mjs logout`; use `--all` to remove client registration and discovery state too.
- Store discovery state and client registration metadata separately from tokens.
- Never print access tokens, refresh tokens, PKCE verifiers, or authorization codes.
- Support browser launch and manual callback paste flows.
