# Workflow

Use this skill as a local-code execution layer for Nonce MCP.

1. Bootstrap the runtime when `vp`, Node.js, or dependencies are unavailable.
2. Authenticate with `nonce:auth` before business queries.
3. Refresh generated signatures with `vp run nonce:generate-sdk -- --profile <profile>` when MCP tools may have changed. The generator uses MCP `tools/list` as the primary source and supplements missing schema metadata from the Nonce OpenAPI document.
4. Inspect the generated tool signatures before writing code.
5. Generate a TypeScript task file that imports the bundled runtime SDK.
6. Run the task through the local runner.
7. Use compact JSON stdout as the only model-facing data surface.

Desktop apps should call the local runner or import the local SDK. They should not depend on their own MCP client token cache.

Use `vp run nonce:bootstrap -- --json` to inspect the current runtime. Use `scripts/bootstrap-runtime.sh` on macOS and `scripts/bootstrap-runtime.ps1` on Windows to install or repair Vite+, Node.js, and dependencies.
