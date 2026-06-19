export const generateSdkCommandName = "nonce generate-sdk";

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(JSON.stringify({ command: generateSdkCommandName, implemented: false }));
}
