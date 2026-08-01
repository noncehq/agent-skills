# Nonce Skills

Skills for Nonce. This repository builds an installable skill collection:

- `nonce` lets agents write project-local JavaScript that queries and operates
  Nonce MCP resources, processes large results in code, and returns compact
  output. A fixed CLI remains available for one-off calls.
- `reboot-report` analyzes one farm's reboot activity and produces a shareable
  HTML report. It prefers `nonce` for code-first data collection and
  preprocessing, with already connected Nonce tools as a fallback.

## Repository Structure

```
src/
├── runtime/          # Restricted code client, OAuth storage, and internal MCP transport
├── sdk-generator/    # MCP/OpenAPI inspection and generated artifact writer
└── skill-scripts/    # Source for installed skill scripts

scripts/
└── generate-nonce-sdk.ts

skills/               # Installable skill collection
├── nonce/            # Nonce data-access skill, code client, and diagnostic CLI
│   ├── SKILL.md
│   ├── agents/
│   ├── assets/
│   ├── references/
│   └── scripts/
└── reboot-report/    # Read-only reboot analysis and HTML report workflow
    ├── SKILL.md
    ├── agents/
    ├── assets/
    ├── references/
    └── scripts/

test/                 # Runtime, generator, metadata, and smoke tests
```

`skills/` is the collection root. Each direct child containing `SKILL.md` is an
independently discoverable skill. `reboot-report` prefers the sibling `nonce`
skill for its data path and can fall back to already connected Nonce tools when
`nonce` is unavailable. See [`INSTALL.md`](INSTALL.md) for the installation,
update, and read-only verification flow.

## Development

### Prerequisites

- [Vite+](https://github.com/vite-plus/vite-plus) available as `vp`
- Node.js 22 or 24 LTS. The installed skill checks the existing runtime and does
  not download or install one.
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

The repository includes a local eval loop for the packaged `nonce` skill under
`skills/nonce/`.

Run the deterministic evals:

```bash
vp run evals
```

This validates raw invocation cases in `evals/cases/invoke.json`, behavior
contracts in `evals/cases/behavior.json`, and the packaged skill's key workflow
and safety contracts.

To capture a report:

```bash
vp run evals -- --json --output evals/artifacts/last-run.json
```

Use `evals/nonce-skill-rubric.schema.json` only for out-of-band qualitative
trace review. See `evals/README.md` for the full flow and the optional
`plugin-eval` commands.

Run the full local Codex eval suite:

```bash
vp run evals:codex
```

This provisions the current `skills/nonce/` directory into an isolated temporary
`CODEX_HOME`, sends each raw invocation query from `evals/cases/invoke.json` to
`codex exec --json`, and writes a normalized trigger report plus
plugin-eval-compatible usage log under
`evals/artifacts/codex-runs/`.

Run the full local Claude Code eval suite:

```bash
vp run evals:claude
```

This provisions the current `skills/nonce/` directory as a project-level skill inside
an isolated temporary workspace, runs every case through
`claude -p --output-format stream-json` with user-level customization excluded,
and writes the same normalized trigger report plus usage log under
`evals/artifacts/claude-runs/`. Both agent suites share
`evals/cases/invoke.json`, run each case 3 times, and report train/validation
splits separately.

## Generating Artifacts

The build bundles the installed scripts and regenerates method artifacts under
`skills/nonce/assets/` and `skills/nonce/references/tool-signatures.md`.

```bash
vp run build
```

SDK generation connects to the Nonce MCP endpoint and may need a saved local auth profile. Authenticate from the repository root when needed:

```bash
vp node -- skills/nonce/scripts/auth.mjs login
vp node -- skills/nonce/scripts/auth.mjs verify
```

To generate only SDK artifacts:

```bash
vp run generate:nonce-sdk
```

## Reboot Report Template

`skills/reboot-report/assets/template.html` is the original report deck, preserved
with its structure, styles, and comments. Generated reports must be copied outside
the installed skill directory and should change only report data and wording.
Validate a completed report with:

```bash
vp node -- skills/reboot-report/scripts/validate-report.mjs path/to/report.html
```

The validator rejects an unchanged copy of the bundled example, removed template
comments, and incomplete deck structure. A hash test prevents the bundled template
from being reformatted or rewritten accidentally.

To create a zip of the installable skill:

```bash
vp run archive:skills
```

This writes `nonce-skills.zip`, which contains `INSTALL.md` and both skill
directories under `skills/`.
