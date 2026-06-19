export const normalizeProfile = (profile: string | undefined): string => {
  const value = profile?.trim() || "default";
  if (!/^[a-zA-Z0-9_.-]+$/.test(value)) {
    throw new Error("Profile may only contain letters, numbers, dots, underscores, and dashes");
  }
  return value;
};
