# Install and Update Nonce Agent Skills

Use this workflow to install `reboot-report` with exactly one Nonce data-access
path. An existing Nonce MCP connection and the `nonce` skill are alternatives;
both are not required.

## 1. Inspect the current agent

1. Identify the target agent. Supported examples are Codex (`codex`) and Claude
   Code (`claude-code`).
2. Check whether the current session already exposes authenticated Nonce MCP
   tools from `https://mcp.nonce.app/mcp`, such as `ListWorkspaces`.
3. Do not infer MCP availability from documentation or configuration alone. The
   tool must be callable in the current session.

## 2. Choose one data path

### Existing Nonce MCP connection

Install only `reboot-report`:

```bash
npx skills add noncehq/agent-skills \
  --skill reboot-report \
  --agent codex \
  -y
```

Replace `codex` with `claude-code` when appropriate. Keep using the MCP client's
authentication and live tool schemas. Do not install `nonce` only to duplicate
an already working MCP connection.

### No Nonce MCP connection

Install `nonce` together with `reboot-report`:

```bash
npx skills add noncehq/agent-skills \
  --skill nonce reboot-report \
  --agent codex \
  -y
```

Replace `codex` with `claude-code` when appropriate. The `nonce` skill provides
the detection-only runtime check, authentication flow, generated method
schemas, a code-first client for the complete Nonce MCP tool set, and a
schema-validated CLI for one-off calls.

Install at project scope by default. Add `--global` only when the user asks to
make the skills available across projects.

## 3. Verify the installation

1. Confirm that `.agents/skills/reboot-report/SKILL.md` exists.
2. When using the `nonce` skill path, also confirm that
   `.agents/skills/nonce/SKILL.md` exists.
3. If the agent does not discover newly installed skills immediately, start a
   new task or session in the same project.

## 4. Authenticate and test read access

- MCP path: complete the MCP client's normal Nonce authorization flow when
  needed, then call `ListWorkspaces`.
- `nonce` skill path: follow the installed skill's runtime and authentication
  instructions, then call `listWorkspaces` through `scripts/nonce.mjs`.

The verification is successful only when the read-only workspace query returns.
Report the selected data path and verification result. Do not claim that Nonce
is connected after installation alone.

## 5. Update an existing installation

1. Inspect both installation scopes before updating:

   ```bash
   npx skills list --json
   npx skills list --global --json
   ```

2. Before replacing an older `nonce` installation, resolve its installed skill
   root. If `<installed skill root>/.nonce-skill/tasks/` exists, copy its
   contents to the current project's `.nonce/code/legacy/` directory and
   verify the copied files. The installed skill directory is update-owned and
   must not remain the only copy of user-created files.
3. Update `reboot-report` in every scope where it is already installed. If
   `nonce` is installed in the same scope, update both skills together. For a
   project installation, use one of:

   ```bash
   npx skills update reboot-report --project -y
   npx skills update nonce reboot-report --project -y
   ```

   For a global installation, replace `--project` with `--global`.

4. Do not install `nonce` as a side effect of updating an MCP-based setup. Do
   not remove either skill or change its project/global scope.
5. Confirm the expected `SKILL.md` files still exist. If the agent does not
   reload an updated skill immediately, start a new task or session.
6. Re-run the selected path's read-only workspace query: `ListWorkspaces` for
   MCP or `listWorkspaces` for the `nonce` skill. Report the updated skills,
   scope, and verification result.

## Safety

- Do not call any `CreateTaskBatch_*` MCP tool, code-client method, or CLI method
  during installation, update, or verification.
- Never print access tokens, refresh tokens, authorization codes, or PKCE
  verifiers.
- Do not fall back to direct REST calls when neither supported data path is
  available.
