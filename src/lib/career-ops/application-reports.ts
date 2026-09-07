import { extractMarkdownLink } from "~/lib/career-ops/links";
import type { ApplicationEntry, RepoDataFile } from "~/lib/career-ops/types";

export type ApplicationReportSource = "linked" | "inferred";

export type ApplicationReportRef = {
  value: string;
  path: string;
  label: string;
  source: ApplicationReportSource;
};

export function hasLinkedReportValue(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed !== "—" && trimmed !== "-";
}

export function inferReportFileForApplication(
  application: ApplicationEntry,
  reportFiles: readonly RepoDataFile[],
): RepoDataFile | null {
  const paddedPrefix = `${application.num}`.padStart(3, "0");
  const candidates = reportFiles.filter(
    (file) =>
      file.type === "file" &&
      file.name.endsWith(".md") &&
      (file.name.startsWith(`${paddedPrefix}-`) ||
        file.name.startsWith(`${application.num}-`)),
  );

  if (candidates.length === 0) {
    return null;
  }

  return (
    [...candidates].sort((left, right) =>
      right.name.localeCompare(left.name),
    )[0] ?? null
  );
}

export function getEffectiveReportValue(
  application: ApplicationEntry,
  reportFiles: readonly RepoDataFile[] = [],
): string | null {
  if (hasLinkedReportValue(application.report)) {
    return application.report;
  }

  return inferReportFileForApplication(application, reportFiles)?.path ?? null;
}

export function applicationHasReport(
  application: ApplicationEntry,
  reportFiles: readonly RepoDataFile[] = [],
): boolean {
  return getEffectiveReportValue(application, reportFiles) !== null;
}

function getReportPathFromValue(value: string): string | null {
  const markdownLink = extractMarkdownLink(value);
  if (markdownLink && !markdownLink.href.startsWith("http")) {
    return markdownLink.href.replace(/^\.\//, "");
  }

  const trimmed = value.trim();
  if (trimmed.includes("/") || trimmed.endsWith(".md")) {
    return trimmed.replace(/^\.\//, "");
  }

  return null;
}

function getReportLabel(value: string, application: ApplicationEntry): string {
  const markdownLink = extractMarkdownLink(value);
  const label = markdownLink?.label?.trim();

  if (label && label.toLowerCase() !== "report") {
    return label;
  }

  const path = getReportPathFromValue(value);
  if (path) {
    const basename = path.split("/").pop()?.replace(/\.md$/i, "") ?? "";
    if (basename) {
      return basename;
    }
  }

  return `${application.company} — ${application.role}`;
}

export function getApplicationReportRef(
  application: ApplicationEntry,
  reportFiles: readonly RepoDataFile[] = [],
): ApplicationReportRef | null {
  if (hasLinkedReportValue(application.report)) {
    const path = getReportPathFromValue(application.report);

    if (!path) {
      return null;
    }

    return {
      value: application.report,
      path,
      label: getReportLabel(application.report, application),
      source: "linked",
    };
  }

  const inferred = inferReportFileForApplication(application, reportFiles);
  if (!inferred) {
    return null;
  }

  return {
    value: inferred.path,
    path: inferred.path,
    label: inferred.name.replace(/\.md$/i, ""),
    source: "inferred",
  };
}
