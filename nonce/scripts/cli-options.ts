const MAX_TIMEOUT_MS = 2_147_483_647;

export const parseTimeoutMs = (
  value: string | number | undefined,
  optionName: string,
  defaultValue: number,
): number => {
  const rawValue = value ?? defaultValue;
  const parsed = typeof rawValue === "number" ? rawValue : Number(rawValue);

  if (!Number.isSafeInteger(parsed) || parsed <= 0 || parsed > MAX_TIMEOUT_MS) {
    throw new Error(`${optionName} must be a positive integer no greater than ${MAX_TIMEOUT_MS}`);
  }

  return parsed;
};
