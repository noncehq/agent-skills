//#region src/skill-scripts/cli-options.ts
const MAX_TIMEOUT_MS = 2147483647;
const parseTimeoutMs = (value, optionName, defaultValue) => {
	const rawValue = value ?? defaultValue;
	const parsed = typeof rawValue === "number" ? rawValue : Number(rawValue);
	if (!Number.isSafeInteger(parsed) || parsed <= 0 || parsed > MAX_TIMEOUT_MS) throw new Error(`${optionName} must be a positive integer no greater than ${MAX_TIMEOUT_MS}`);
	return parsed;
};
//#endregion
export { parseTimeoutMs as t };
