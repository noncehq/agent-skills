# Workflow

Use this skill as a local-code execution layer for Nonce MCP.

1. Bootstrap the runtime when `vp`, Node.js, or dependencies are unavailable.
2. Authenticate with `nonce:auth` before business queries.
3. Inspect the generated tool signatures before writing code.
4. Generate a TypeScript task file that imports the bundled runtime SDK.
5. Run the task through the local runner.
6. Use compact JSON stdout as the only model-facing data surface.

Desktop apps should call the local runner or import the local SDK. They should not depend on their own MCP client token cache.
