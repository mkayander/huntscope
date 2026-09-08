import {
  getCompanySearchToken,
  getCompanySearchTokens,
  hasLinkedArtifactValue,
  inferApplicationForFile,
  inferFileForApplication,
} from "~/lib/career-ops/application-artifact-inference";
import type { ApplicationArtifactRef } from "~/lib/career-ops/application-artifacts";
import { extractMarkdownLink } from "~/lib/career-ops/links";
import {
  matchRepoFilePath,
  normalizeRepoRelativePath,
} from "~/lib/career-ops/repo-paths";
import type { ApplicationEntry, RepoDataFile } from "~/lib/career-ops/types";

export type ApplicationPdfSource = ApplicationArtifactRef["source"];
export type ApplicationPdfRef = ApplicationArtifactRef;

export {
  getCompanySearchToken,
  getCompanySearchTokens,
  hasLinkedArtifactValue as hasLinkedPdfValue,
};

export function getPdfPathFromApplicationValue(
  value: string,
  outputFiles: readonly RepoDataFile[] = [],
): string | null {
  const markdownLink = extractMarkdownLink(value);
  if (markdownLink && !markdownLink.href.startsWith("http")) {
    return matchRepoFilePath(
      normalizeRepoRelativePath(markdownLink.href),
      outputFiles,
    );
  }

  const trimmed = value.trim();
  if (trimmed.toLowerCase().endsWith(".pdf")) {
    return matchRepoFilePath(normalizeRepoRelativePath(trimmed), outputFiles);
  }

  return null;
}

export function inferApplicationForOutputFile(
  file: RepoDataFile,
  applications: readonly ApplicationEntry[],
): ApplicationEntry | null {
  return inferApplicationForFile(file, applications);
}

export function inferOutputFileForApplication(
  application: ApplicationEntry,
  outputFiles: readonly RepoDataFile[],
): RepoDataFile | null {
  return inferFileForApplication(application, outputFiles, ".pdf");
}

export function getEffectivePdfValue(
  application: ApplicationEntry,
  outputFiles: readonly RepoDataFile[] = [],
): string | null {
  return getApplicationPdfRef(application, outputFiles)?.path ?? null;
}

export function applicationHasPdf(
  application: ApplicationEntry,
  outputFiles: readonly RepoDataFile[] = [],
): boolean {
  return getEffectivePdfValue(application, outputFiles) !== null;
}

function getPdfLabel(
  value: string,
  application: ApplicationEntry,
  outputFiles: readonly RepoDataFile[] = [],
  fileName?: string,
): string {
  const markdownLink = extractMarkdownLink(value);
  const label = markdownLink?.label?.trim();

  if (label && label.toLowerCase() !== "pdf") {
    return label;
  }

  if (fileName) {
    return fileName.replace(/\.pdf$/i, "");
  }

  const path = getPdfPathFromApplicationValue(value, outputFiles);
  if (path) {
    const basename =
      path
        .split("/")
        .pop()
        ?.replace(/\.pdf$/i, "") ?? "";
    if (basename) {
      return basename;
    }
  }

  return `${application.company} CV`;
}

export function getApplicationPdfRef(
  application: ApplicationEntry,
  outputFiles: readonly RepoDataFile[] = [],
): ApplicationPdfRef | null {
  if (hasLinkedArtifactValue(application.pdf)) {
    const path = getPdfPathFromApplicationValue(application.pdf, outputFiles);

    if (!path) {
      return null;
    }

    return {
      value: application.pdf,
      path,
      label: getPdfLabel(application.pdf, application, outputFiles),
      source: "linked",
    };
  }

  const inferred = inferOutputFileForApplication(application, outputFiles);
  if (!inferred) {
    return null;
  }

  return {
    value: inferred.path,
    path: inferred.path,
    label: getPdfLabel(inferred.path, application, outputFiles, inferred.name),
    source: "inferred",
  };
}
