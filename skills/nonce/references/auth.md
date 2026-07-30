# Authentication

Use the fixed local auth command for Nonce authentication.

- Default endpoint: `https://mcp.nonce.app/mcp`.
- Keep the current project as the working directory. Complete the path setup in
  `references/workflow.md` first and reuse its exact Node executable and
  installed skill root.
- The examples below use macOS/Linux variables. On PowerShell, invoke the same
  subcommand with
  `& $NonceNode (Join-Path $NonceSkillHome "scripts\auth.mjs")`.
- Credentials are saved as local profile files. On POSIX systems, the command
  resets profile directories to mode `0700` and credential files to mode
  `0600`. On Windows, files stay under the current user's application-data
  profile and inherit that profile's ACLs; the command does not launch a
  permission-changing subprocess.
- Check status with
  `"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/auth.mjs" status`.
- Start login with
  `"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/auth.mjs" login`; it prints an
  `authorizationUrl` JSON object and exits after the local callback completes.
  Open that HTTPS URL in a browser. The auth script never launches a browser
  subprocess.
- If the redirect cannot reach the local callback server, keep `login` running
  and complete the exchange from another terminal with
  `"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/auth.mjs" callback "<callback-url>"`.
  Quote pasted callback URLs because they can contain shell metacharacters such
  as `&`. The callback must contain the pending OAuth state; a missing or
  mismatched state is rejected.
- Verify the saved token with
  `"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/auth.mjs" verify`; this initializes
  the local connection and lists available methods, but does not call any
  business method.
- Clear tokens with
  `"$NONCE_NODE" "$NONCE_SKILL_HOME/scripts/auth.mjs" logout`; use `--all` to
  remove client registration and discovery state too.
- Store discovery state and client registration metadata separately from tokens.
- Never print access tokens, refresh tokens, PKCE verifiers, or authorization codes.
- Support the printed-link and manual callback paste flows.
