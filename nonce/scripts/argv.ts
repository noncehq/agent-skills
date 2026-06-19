export const getCliArgv = (): string[] => {
  const argv = [...process.argv];
  const separatorIndex = argv.indexOf("--", 2);
  if (separatorIndex !== -1) {
    argv.splice(separatorIndex, 1);
  }
  return argv;
};
