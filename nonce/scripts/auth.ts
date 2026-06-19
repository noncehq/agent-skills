export const authCommandName = "nonce auth";

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(JSON.stringify({ command: authCommandName, implemented: false }));
}
