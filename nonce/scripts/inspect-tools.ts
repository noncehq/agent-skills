export const inspectToolsCommandName = "nonce inspect-tools";

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(JSON.stringify({ command: inspectToolsCommandName, implemented: false }));
}
