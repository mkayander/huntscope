import type { CareerOpsDataSource } from "~/lib/career-ops/data-source";
import {
  matchRepoFilePath,
  normalizeRepoRelativePath,
} from "~/lib/career-ops/repo-paths";

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
  knownFiles: readonly { path: string }[] = [],
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

    const resolvedPath = matchRepoFilePath(
      normalizeRepoRelativePath(path),
      knownFiles,
    );

    return resolveRepoFileUrl(
      source.repo.fullName,
      resolvedPath,
      defaultBranch ?? "main",
    );
  }

  return null;
}

export function resolveArtifactLink(
  source: CareerOpsDataSource,
  value: string,
  defaultBranch: string | null = "main",
  knownFiles: readonly { path: string }[] = [],
): { label: string; href: string | null; path: string | null } | null {
  const trimmedValue = value.trim();
  const directPath =
    trimmedValue.includes("/") || trimmedValue.endsWith(".md")
      ? matchRepoFilePath(normalizeRepoRelativePath(trimmedValue), knownFiles)
      : trimmedValue.toLowerCase().endsWith(".pdf")
        ? matchRepoFilePath(normalizeRepoRelativePath(trimmedValue), knownFiles)
        : null;

  if (
    directPath &&
    !trimmedValue.includes("[") &&
    !trimmedValue.startsWith("http")
  ) {
    const label = trimmedValue.toLowerCase().endsWith(".pdf")
      ? "PDF"
      : "Report";

    return {
      label,
      href: resolveDataSourceFileUrl(
        source,
        directPath,
        defaultBranch,
        knownFiles,
      ),
      path: directPath,
    };
  }

  const markdownLink = extractMarkdownLink(value);

  if (markdownLink) {
    const path = markdownLink.href.startsWith("http")
      ? null
      : matchRepoFilePath(
          normalizeRepoRelativePath(markdownLink.href),
          knownFiles,
        );
    const href = markdownLink.href.startsWith("http")
      ? markdownLink.href
      : path
        ? resolveDataSourceFileUrl(source, path, defaultBranch, knownFiles)
        : resolveDataSourceFileUrl(
            source,
            markdownLink.href,
            defaultBranch,
            knownFiles,
          );

    return {
      label: markdownLink.label,
      href,
      path,
    };
  }

  const trimmed = value.trim();

  if (trimmed && (trimmed.includes("/") || trimmed.endsWith(".md"))) {
    const path = matchRepoFilePath(
      normalizeRepoRelativePath(trimmed),
      knownFiles,
    );
    return {
      label: "Report",
      href: resolveDataSourceFileUrl(source, path, defaultBranch, knownFiles),
      path,
    };
  }

  if (trimmed.toLowerCase().endsWith(".pdf")) {
    const path = matchRepoFilePath(
      normalizeRepoRelativePath(trimmed),
      knownFiles,
    );
    return {
      label: "PDF",
      href: resolveDataSourceFileUrl(source, path, defaultBranch, knownFiles),
      path,
    };
  }

  return null;
}
