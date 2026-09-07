import { extractMarkdownLink } from "~/lib/career-ops/links";
import type { ApplicationEntry, RepoDataFile } from "~/lib/career-ops/types";

export type ApplicationPdfSource = "linked" | "inferred";

export type ApplicationPdfRef = {
  value: string;
  path: string;
  label: string;
  source: ApplicationPdfSource;
};

export function hasLinkedPdfValue(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed !== "—" && trimmed !== "-";
}

export function getPdfPathFromApplicationValue(value: string): string | null {
  const markdownLink = extractMarkdownLink(value);
  if (markdownLink && !markdownLink.href.startsWith("http")) {
    return markdownLink.href.replace(/^\.\//, "");
  }

  const trimmed = value.trim();
  if (trimmed.toLowerCase().endsWith(".pdf")) {
    return trimmed.replace(/^\.\//, "");
  }

  return null;
}

export function getCompanySearchToken(company: string): string | null {
  const token = company
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .find(Boolean);

  return token ?? null;
}

function getPdfFiles(outputFiles: readonly RepoDataFile[]): RepoDataFile[] {
  return outputFiles.filter(
    (file) => file.type === "file" && file.name.toLowerCase().endsWith(".pdf"),
  );
}

export function inferApplicationForOutputFile(
  file: RepoDataFile,
  applications: readonly ApplicationEntry[],
): ApplicationEntry | null {
  const stem = file.name.replace(/\.[^.]+$/, "").toLowerCase();

  return (
    applications.find((application) => {
      const token = getCompanySearchToken(application.company);
      return token ? stem.includes(token) : false;
    }) ?? null
  );
}

export function inferOutputFileForApplication(
  application: ApplicationEntry,
  outputFiles: readonly RepoDataFile[],
): RepoDataFile | null {
  const pdfFiles = getPdfFiles(outputFiles);
  const paddedPrefix = `${application.num}`.padStart(3, "0");
  const numberedCandidates = pdfFiles.filter(
    (file) =>
      file.name.startsWith(`${paddedPrefix}-`) ||
      file.name.startsWith(`${application.num}-`),
  );

  if (numberedCandidates.length > 0) {
    return (
      [...numberedCandidates].sort((left, right) =>
        right.name.localeCompare(left.name),
      )[0] ?? null
    );
  }

  const token = getCompanySearchToken(application.company);
  if (!token) {
    return null;
  }

  const companyMatches = pdfFiles.filter((file) => {
    const stem = file.name.replace(/\.[^.]+$/, "").toLowerCase();
    return stem.includes(token);
  });

  if (companyMatches.length === 0) {
    return null;
  }

  if (companyMatches.length === 1) {
    return companyMatches[0] ?? null;
  }

  return (
    [...companyMatches].sort((left, right) =>
      right.name.localeCompare(left.name),
    )[0] ?? null
  );
}

export function getEffectivePdfValue(
  application: ApplicationEntry,
  outputFiles: readonly RepoDataFile[] = [],
): string | null {
  if (hasLinkedPdfValue(application.pdf)) {
    return application.pdf;
  }

  return inferOutputFileForApplication(application, outputFiles)?.path ?? null;
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

  const path = getPdfPathFromApplicationValue(value);
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
  if (hasLinkedPdfValue(application.pdf)) {
    const path = getPdfPathFromApplicationValue(application.pdf);

    if (!path) {
      return null;
    }

    return {
      value: application.pdf,
      path,
      label: getPdfLabel(application.pdf, application),
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
    label: getPdfLabel(inferred.path, application, inferred.name),
    source: "inferred",
  };
}
