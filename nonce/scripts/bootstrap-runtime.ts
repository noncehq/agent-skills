export const bootstrapCommandName = "nonce bootstrap-runtime";

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(JSON.stringify({ command: bootstrapCommandName, implemented: false }));
}
