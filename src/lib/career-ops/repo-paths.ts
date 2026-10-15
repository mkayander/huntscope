export function normalizeRepoRelativePath(path: string): string {
  const trimmed = path.trim();

  if (!trimmed) {
    return "";
  }

  return trimmed.replace(/^\.\//, "").replace(/^(?:\.\.\/)+/, "");
}

export function matchRepoFilePath(
  normalizedPath: string,
  files: readonly { path: string }[],
): string {
  if (!normalizedPath) {
    return "";
  }

  const exactMatch = files.find((file) => file.path === normalizedPath);

  if (exactMatch) {
    return exactMatch.path;
  }

  const suffixMatch = files.find((file) =>
    file.path.endsWith(`/${normalizedPath}`),
  );

  return suffixMatch?.path ?? normalizedPath;
}
