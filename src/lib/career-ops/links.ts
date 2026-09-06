export function extractMarkdownLink(
  value: string,
): { label: string; href: string } | null {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "—" || trimmed === "-") {
    return null;
  }

  const markdownMatch = /\[([^\]]*)\]\(([^)]+)\)/.exec(trimmed);
  if (markdownMatch?.[2]) {
    return {
      label: markdownMatch[1]?.trim() ?? "Open",
      href: markdownMatch[2].trim(),
    };
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return { label: "Open", href: trimmed };
  }

  return null;
}

export function resolveRepoFileUrl(fullName: string, path: string): string {
  const normalizedPath = path.replace(/^\.\//, "");
  return `https://github.com/${fullName}/blob/main/${normalizedPath}`;
}
