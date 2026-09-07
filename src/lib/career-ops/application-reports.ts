import {
  hasLinkedArtifactValue,
  inferFileForApplication,
} from "~/lib/career-ops/application-artifact-inference";
import type { ApplicationArtifactRef } from "~/lib/career-ops/application-artifacts";
import { extractMarkdownLink } from "~/lib/career-ops/links";
import type { ApplicationEntry, RepoDataFile } from "~/lib/career-ops/types";

export type ApplicationReportSource = ApplicationArtifactRef["source"];
export type ApplicationReportRef = ApplicationArtifactRef;

export { hasLinkedArtifactValue as hasLinkedReportValue };

export function inferReportFileForApplication(
  application: ApplicationEntry,
  reportFiles: readonly RepoDataFile[],
): RepoDataFile | null {
  return inferFileForApplication(application, reportFiles, ".md");
}

export function getEffectiveReportValue(
  application: ApplicationEntry,
  reportFiles: readonly RepoDataFile[] = [],
): string | null {
  return getApplicationReportRef(application, reportFiles)?.path ?? null;
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
  if (hasLinkedArtifactValue(application.report)) {
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

function reportFileExistsAtPath(
  reportFiles: readonly RepoDataFile[],
  path: string,
): boolean {
  return reportFiles.some((file) => file.type === "file" && file.path === path);
}

export function resolveApplicationReportFetchRef(
  application: ApplicationEntry,
  reportFiles: readonly RepoDataFile[] = [],
): ApplicationReportRef | null {
  const reportRef = getApplicationReportRef(application, reportFiles);

  if (
    reportRef?.source !== "linked" ||
    reportFiles.length === 0 ||
    reportFileExistsAtPath(reportFiles, reportRef.path)
  ) {
    return reportRef;
  }

  const inferred = inferReportFileForApplication(application, reportFiles);
  if (!inferred) {
    return reportRef;
  }

  return {
    value: inferred.path,
    path: inferred.path,
    label: inferred.name.replace(/\.md$/i, ""),
    source: "inferred",
  };
}
