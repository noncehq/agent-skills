type ErrorSink = (message: string) => void;

const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

export const runCliMain = async (
  main: () => Promise<void>,
  errorSink: ErrorSink = (message) => console.error(message),
): Promise<void> => {
  try {
    await main();
  } catch (error) {
    errorSink(errorMessage(error));
    process.exitCode = 1;
  }
};
