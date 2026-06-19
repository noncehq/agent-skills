export const runTaskCommandName = "nonce run-task";

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(JSON.stringify({ command: runTaskCommandName, implemented: false }));
}
