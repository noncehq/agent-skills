---
name: reboot-report
description: >-
  Use this skill when the user wants a factual reboot analysis for one Nonce mining farm over a specific time range, delivered as a shareable HTML report or slide deck with findings, outcomes, revenue impact, and recommendations. Typical requests mention a farm reboot report, reboot review, restart effectiveness, or reboot-related losses. Use connected Nonce MCP tools or the nonce skill for data access. Do not use it to perform reboots, answer generic mining-hardware questions, or analyze only a user-provided dataset that does not require Nonce.
---

# Reboot Report

Produce a read-only, externally shareable HTML report for one farm and one time
window. Reconstruct facts first, then evaluate outcomes and revenue, and end with
practical recommendations.

## Data Access Boundary

- This skill owns the reboot-analysis and report workflow. It does not contain a
  Nonce client, authentication flow, or duplicate tool schemas.
- Use exactly one available data path for the whole report:
  - **Nonce MCP path:** when the current session exposes authenticated tools from
    `https://mcp.nonce.app/mcp`, use those tools and their live schemas directly.
  - **`nonce` skill path:** when Nonce MCP tools are unavailable, activate the
    sibling `nonce` skill and follow its runtime, authentication, schema,
    task-runner, pagination, and permission instructions.
- Prefer an already connected Nonce MCP path. If both paths are available, use
  MCP unless the user asks for the `nonce` skill. Do not mix paths within one
  report.
- If the selected path fails, repair it or restart data collection on the other
  path. Do not merge partial results collected under different paths.
- If neither path is available, tell the user to connect Nonce MCP or install
  the `nonce` skill from `https://github.com/noncehq/agent-skills`. Do not fall
  back to direct REST calls.
- This workflow is read-only. Never call a `CreateTaskBatch_*` MCP tool or a
  `createTaskBatch...` SDK method.

## Inputs

Confirm only the missing items before querying:

1. One farm.
2. Inclusive start and exclusive end of the analysis window.
3. Reporting timezone.

Use the user's existing wording when these are already clear. Do not ask them to
provide workspace IDs, farm IDs, or write code; discover IDs through the
selected data path.

## Workflow

1. Resolve this skill's installed root, the directory containing this
   `SKILL.md`, as `REBOOT_REPORT_SKILL_HOME` on macOS/Linux or
   `$RebootReportSkillHome` on Windows.
2. Select and record the MCP or `nonce` skill data path using the rules above.
   Complete that path's normal authentication flow when needed.
3. Read `references/analysis.md`.
4. Inspect the selected path's schemas for the report operations:
   - MCP path: `ListWorkspaces`, `ListFarms`, `ListMinerRebootEvents`,
     `SearchTaskBatches`, and `GetTaskBatchTasks`; optionally `ListMiners`,
     `GetMinerStats`, `ListFarmMetricsHistory`, `ListMinerHistory`, and
     `ListBtcNetworkHistory`.
   - `nonce` skill path: read its method index and schema files for
     `listWorkspaces`, `listFarms`, `listMinerRebootEvents`,
     `searchTaskBatches`, and `getTaskBatchTasks`; optionally `listMiners`,
     `getMinerStats`, `listFarmMetricsHistory`, `listMinerHistory`, and
     `listBtcNetworkHistory`.
5. Query every page for the requested farm and time window. Filter task batches
   to `miner.system.reboot` and fetch their tasks. Keep detected reboot events,
   platform-issued reboot tasks, and their matched pairs as three distinct
   datasets.
6. Analyze the datasets with the definitions and calculation rules in
   `references/analysis.md`. Match tasks to detected events one-to-one by miner
   and nearby time; state the tolerance used and leave uncertain pairs
   unmatched.
7. Copy `assets/template.html` to a new output file outside the installed skill
   directory. Treat all farm-specific values in the template as examples and
   replace them with report data. Change only user-visible data and wording:
   preserve the existing HTML/CSS comments, `style` block, classes, component
   markup, slide order, responsive rules, and print rules. Do not reformat or
   redesign the template. When data is unavailable, write "数据不足" or "待确认"
   in the existing component instead of inventing data or removing the section.
8. Run the report validator.

   macOS/Linux:

   ```bash
   node "$REBOOT_REPORT_SKILL_HOME/scripts/validate-report.mjs" "/path/to/report.html"
   ```

   PowerShell:

   ```powershell
   node (Join-Path $RebootReportSkillHome "scripts/validate-report.mjs") "C:\path\report.html"
   ```

9. Open the report at desktop width and inspect every slide. Check text fit,
   chart labels, page order, and print preview before returning the file.

## Report Contract

- Default to Chinese unless the user requests another language.
- Keep the sequence: cover, 3-4 core findings, definitions and facts, outcomes,
  revenue, recommendations, and pending confirmations.
- Aggregate externally shared results. Do not include workspace IDs, farm IDs,
  miner IDs, serial numbers, IP addresses, task IDs, or account details unless
  the user explicitly asks for them.
- Label inferred power events as suspected until corroborated by site records.
- Show assumptions, sample sizes, unmatched counts, missing data, timezone, and
  the exact analysis window.
- Use the selected path's BTC network history operation as the primary hashprice
  source. Label estimates with "约" and never present a window total as a daily
  value.
- Use plain operator language. Avoid blame, unexplained internal field names,
  and long implementation instructions.
- When evidence is insufficient, add the item to "待确认"; do not turn it into a
  conclusion.

## Safety

This workflow is read-only. If the user also asks to restart miners, finish or
pause the report work and handle that request separately through Nonce MCP or
the `nonce` skill. Destructive-action preview and explicit confirmation remain
mandatory.
