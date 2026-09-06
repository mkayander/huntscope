import type { CareerOpsDataSource } from "~/lib/career-ops/data-source";

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

export function resolveRepoFileUrl(
  fullName: string,
  path: string,
  defaultBranch = "main",
): string {
  const normalizedPath = path.replace(/^\.\//, "");
  return `https://github.com/${fullName}/blob/${defaultBranch}/${normalizedPath}`;
}

export function resolveDataSourceFileUrl(
  source: CareerOpsDataSource,
  path: string,
  defaultBranch: string | null = "main",
): string | null {
  if (source.kind === "github") {
    const trimmed = path.trim();

    if (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("#")
    ) {
      return trimmed;
    }

    return resolveRepoFileUrl(
      source.repo.fullName,
      path,
      defaultBranch ?? "main",
    );
  }

  return null;
}

export function resolveArtifactLink(
  source: CareerOpsDataSource,
  value: string,
  defaultBranch: string | null = "main",
): { label: string; href: string | null; path: string | null } | null {
  const markdownLink = extractMarkdownLink(value);

  if (markdownLink) {
    const path = markdownLink.href.startsWith("http")
      ? null
      : markdownLink.href.replace(/^\.\//, "");
    const href = markdownLink.href.startsWith("http")
      ? markdownLink.href
      : resolveDataSourceFileUrl(source, markdownLink.href, defaultBranch);

    return {
      label: markdownLink.label,
      href,
      path,
    };
  }

  const trimmed = value.trim();

  if (trimmed && (trimmed.includes("/") || trimmed.endsWith(".md"))) {
    const path = trimmed.replace(/^\.\//, "");
    return {
      label: "Report",
      href: resolveDataSourceFileUrl(source, trimmed, defaultBranch),
      path,
    };
  }

  if (trimmed.toLowerCase().endsWith(".pdf")) {
    const path = trimmed.replace(/^\.\//, "");
    return {
      label: "PDF",
      href: resolveDataSourceFileUrl(source, trimmed, defaultBranch),
      path,
    };
  }

  return null;
}
