export function normalizeRepoRelativePath(path: string): string {
  const trimmed = path.trim();

  if (!trimmed) {
    return "";
  }

  return trimmed.replace(/^\.\//, "").replace(/^(?:\.\.\/)+/, "");
}
