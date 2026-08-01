# Install and Update Nonce Agent Skills

Use the current [skills.sh documentation](https://www.skills.sh/docs/cli) as the
source of truth for installation and update commands, supported targets, scope,
and installed-file locations. This file defines only the choices and checks
specific to Nonce skills.

Skill source: `https://github.com/noncehq/agent-skills`

## Install

For reboot reports, prefer installing both skills:

- `nonce` provides authentication, data access, code-first preprocessing, and
  compact output.
- `reboot-report` provides reboot analysis and report delivery.

Install only `reboot-report` when `nonce` is unavailable or the user explicitly
chooses an existing authenticated Nonce connection. Use one data path for the
whole report; do not combine partial results from different paths.

## Update

Update the skills already installed without changing their target or scope. If
both skills are installed together, update both. Do not add `nonce` to an
existing fallback setup unless the user chooses the preferred two-skill setup.

Before updating an older `nonce` installation, check its installed root. If
`.nonce-skill/tasks/` exists, copy its contents to the current project's
`.nonce/code/legacy/` directory and verify the copy before updating. Installed
skill directories must not remain the only location of user-created files.

## Verify

Confirm that skills.sh reports the requested skills as installed, then verify
Nonce read access:

- With `nonce`, follow its runtime and authentication instructions and call
  `listWorkspaces`.
- With the fallback connection, run its workspace-list operation.

Treat the connection as verified only when the read-only query succeeds. Report
the installed skill set, selected data path, scope, and verification result.

## Safety

- Do not create task batches or change Nonce resources during installation,
  update, or verification.
- Never print access tokens, refresh tokens, authorization codes, or PKCE
  verifiers.
- Do not replace either supported data path with direct REST calls.
