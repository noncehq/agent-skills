# Nonce Skills

Skills for Nonce. This repository builds the installable `nonce` skill, which lets agent query and operate Nonce mining resources through local JavaScript task code.

## Repository Structure

```
src/
├── runtime/          # Skill runtime, OAuth provider, credential storage, and Nonce client
├── sdk-generator/    # MCP/OpenAPI inspection and generated artifact writer
└── skill-scripts/    # Source for installed skill scripts

scripts/
└── generate-nonce-sdk.ts

skills/               # Installable skill artifact
├── SKILL.md          # Skill entrypoint and operating rules
├── agents/           # Agent-facing skill metadata
├── assets/           # Generated method manifest, schemas, and TypeScript signatures
├── references/       # Installed-skill workflow, auth, method, and safety docs
└── scripts/          # Bundled runtime/auth/task-runner scripts

test/                 # Runtime, generator, metadata, and smoke tests
```

`skills/` is the packaged skill root. Installed copies should run the bundled scripts with `node`.

## Development

### Prerequisites

- [Vite+](https://github.com/vite-plus/vite-plus) available as `vp`
- Node.js 22 or newer; the installed skill bootstrap pins the managed runtime to Node.js 24.17.0
- A Nonce account for authenticated SDK generation or runtime testing

Install dependencies:

```bash
vp install
```

Run checks:

```bash
vp check
vp test
vp run evals
vp run evals:codex
vp run evals:claude
vp fmt --check
```

Format files:

```bash
vp fmt
```

## Evaluating the Skill

The repository includes a local eval loop for the packaged skill under `skills/`.

Run the deterministic evals:

```bash
vp run evals
```

This validates the prompt cases in `evals/nonce-skill.cases.json` and confirms
the packaged skill keeps its key workflow and safety contracts.

To capture a report:

```bash
vp run evals -- --json --output evals/artifacts/last-run.json
```

Use `evals/nonce-skill-rubric.schema.json` with `codex exec --output-schema`
when qualitative trace review is needed. See `evals/README.md` for the full flow
and the optional `plugin-eval` commands.

Run the full local Codex eval suite:

```bash
vp run evals:codex
```

This provisions the current `skills/` directory into an isolated temporary
`CODEX_HOME`, runs every case through `codex exec --json --output-schema`, and
writes a normalized report plus plugin-eval-compatible usage log under
`evals/artifacts/codex-runs/`.

Run the full local Claude Code eval suite:

```bash
vp run evals:claude
```

This provisions the current `skills/` directory as a project-level skill inside
an isolated temporary workspace, runs every case through
`claude -p --output-format stream-json --json-schema` with user-level
customization excluded, and writes the same normalized report plus usage log
under `evals/artifacts/claude-runs/`. Both agent suites share the case set in
`evals/nonce-skill.cases.json` and the output contract in
`evals/nonce-skill-eval.output.schema.json`.

## Generating Artifacts

The build bundles the installed scripts and regenerates method artifacts under `skills/assets/` and `skills/references/tool-signatures.md`.

```bash
vp run build
```

SDK generation connects to the Nonce MCP endpoint and may need a saved local auth profile. Authenticate from the repository root when needed:

```bash
vp node -- skills/scripts/auth.mjs login
vp node -- skills/scripts/auth.mjs verify
```

To generate only SDK artifacts:

```bash
vp run generate:nonce-sdk
```

To create a zip of the installable skill:

```bash
vp run archive:skills
```

This writes `nonce-skills.zip`, which contains the `skills/` directory.
