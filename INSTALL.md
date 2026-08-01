# Install and Update Nonce Agent Skills

Use this workflow to install `reboot-report` with access to Nonce data. Prefer
installing the `nonce` skill alongside it so agents can collect, combine, and
reduce data in code before producing a report. Already connected Nonce tools
remain a fallback when `nonce` is unavailable.

## 1. Inspect the current agent

1. Identify the target agent. Supported examples are Codex (`codex`) and Claude
   Code (`claude-code`).
2. Check whether the `nonce` skill is already installed in the target project or
   global scope.
3. Check whether the current session exposes authenticated Nonce tools only to
   establish a fallback. Do not infer availability from documentation or
   configuration alone; a read operation must be callable.

## 2. Choose a data path

### Preferred: `nonce` skill

Install `nonce` together with `reboot-report`:

```bash
npx skills add noncehq/agent-skills \
  --skill nonce reboot-report \
  --agent codex \
  -y
```

Replace `codex` with `claude-code` when appropriate. The `nonce` skill provides
the runtime check, authentication flow, generated method schemas, code-first
client, and compact-output workflow used by `reboot-report`.

### Fallback: already connected Nonce tools

When `nonce` cannot be installed or the user explicitly chooses the existing
connection, install only `reboot-report`:

```bash
npx skills add noncehq/agent-skills \
  --skill reboot-report \
  --agent codex \
  -y
```

Replace `codex` with `claude-code` when appropriate. Continue using the existing
connection's authentication and live read schemas. Do not mix this fallback with
partial results collected through `nonce` in the same report.

Install at project scope by default. Add `--global` only when the user asks to
make the skills available across projects.

## 3. Verify the installation

1. Confirm that `.agents/skills/reboot-report/SKILL.md` exists.
2. For the preferred path, also confirm that `.agents/skills/nonce/SKILL.md`
   exists.
3. If the agent does not discover newly installed skills immediately, start a
   new task or session in the same project.

## 4. Authenticate and test read access

- Preferred `nonce` path: follow the installed skill's runtime and
  authentication instructions, then call `listWorkspaces`.
- Fallback path: complete the existing connection's normal authorization flow
  when needed, then run its workspace-list operation.

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

4. Do not install `nonce` as a side effect of updating an existing fallback
   setup unless the user asks to adopt the preferred path. Do not remove either
   skill or change its project/global scope.
5. Confirm the expected `SKILL.md` files still exist. If the agent does not
   reload an updated skill immediately, start a new task or session.
6. Re-run the selected path's read-only workspace query. Report the updated
   skills, scope, and verification result.

## Safety

- Do not call any method that creates a task batch or changes Nonce resources
  during installation, update, or verification.
- Never print access tokens, refresh tokens, authorization codes, or PKCE
  verifiers.
- Do not fall back to direct REST calls when neither supported data path is
  available.
