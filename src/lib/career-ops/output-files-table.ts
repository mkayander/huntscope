import { parseApplicationDate } from "~/lib/career-ops/dates";
import { extractMarkdownLink } from "~/lib/career-ops/links";
import type { ApplicationEntry, RepoDataFile } from "~/lib/career-ops/types";

export type OutputFileSortColumn = "name" | "company" | "role" | "date";
export type OutputFileSortDirection = "asc" | "desc";
export type OutputLinkedFilterValue = "with" | "without";

export type OutputFileRow = {
  file: RepoDataFile;
  path: string;
  name: string;
  extension: string;
  linkedApplication: ApplicationEntry | null;
  sortDate: string;
};

export type OutputFilesTableQuery = {
  searchQuery: string;
  linkedFilters: OutputLinkedFilterValue[];
  sortColumn: OutputFileSortColumn;
  sortDirection: OutputFileSortDirection;
};

export const DEFAULT_OUTPUT_FILES_TABLE_QUERY: OutputFilesTableQuery = {
  searchQuery: "",
  linkedFilters: [],
  sortColumn: "date",
  sortDirection: "desc",
};

const FILENAME_DATE_PATTERN = /(\d{4}-\d{2}-\d{2})/;

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

export function getFileExtension(name: string): string {
  const match = /\.([^.]+)$/.exec(name);
  return match?.[1]?.toLowerCase() ?? "";
}

function extractDateFromFilename(name: string): string | null {
  const match = FILENAME_DATE_PATTERN.exec(name);
  return match?.[1] ?? null;
}

function getCompanySearchToken(company: string): string | null {
  const token = company
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .find(Boolean);

  return token ?? null;
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

export function buildOutputFileRows(
  outputFiles: readonly RepoDataFile[],
  applications: readonly ApplicationEntry[] = [],
): OutputFileRow[] {
  const linkedByPath = new Map<string, ApplicationEntry>();

  for (const application of applications) {
    const pdfPath = getPdfPathFromApplicationValue(application.pdf);
    if (pdfPath) {
      linkedByPath.set(pdfPath, application);
    }
  }

  return outputFiles
    .filter((file) => file.type === "file")
    .map((file) => {
      const linkedApplication =
        linkedByPath.get(file.path) ??
        inferApplicationForOutputFile(file, applications);
      const sortDate =
        (linkedApplication
          ? parseApplicationDate(linkedApplication.date)
          : null) ??
        extractDateFromFilename(file.name) ??
        "";

      return {
        file,
        path: file.path,
        name: file.name,
        extension: getFileExtension(file.name),
        linkedApplication,
        sortDate,
      };
    });
}

function compareDates(left: string, right: string): number {
  if (left && right) {
    return left.localeCompare(right);
  }

  if (left) {
    return -1;
  }

  if (right) {
    return 1;
  }

  return 0;
}

function compareRows(
  left: OutputFileRow,
  right: OutputFileRow,
  column: OutputFileSortColumn,
): number {
  switch (column) {
    case "name":
      return left.name.localeCompare(right.name, undefined, {
        sensitivity: "base",
      });
    case "company":
      return (left.linkedApplication?.company ?? "").localeCompare(
        right.linkedApplication?.company ?? "",
        undefined,
        { sensitivity: "base" },
      );
    case "role":
      return (left.linkedApplication?.role ?? "").localeCompare(
        right.linkedApplication?.role ?? "",
        undefined,
        { sensitivity: "base" },
      );
    case "date":
      return compareDates(left.sortDate, right.sortDate);
    default:
      return 0;
  }
}

export function sortOutputFileRows(
  rows: OutputFileRow[],
  column: OutputFileSortColumn,
  direction: OutputFileSortDirection,
): OutputFileRow[] {
  const sorted = [...rows].sort((left, right) =>
    compareRows(left, right, column),
  );
  return direction === "asc" ? sorted : sorted.reverse();
}

function matchesLinkedFilter(
  row: OutputFileRow,
  filter: OutputLinkedFilterValue,
): boolean {
  const hasLink = row.linkedApplication !== null;
  return filter === "with" ? hasLink : !hasLink;
}

function matchesLinkedFilters(
  row: OutputFileRow,
  linkedFilters: OutputLinkedFilterValue[],
): boolean {
  if (linkedFilters.length === 0) {
    return true;
  }

  return linkedFilters.some((filter) => matchesLinkedFilter(row, filter));
}

function matchesSearch(row: OutputFileRow, searchQuery: string): boolean {
  const query = searchQuery.trim().toLowerCase();
  if (!query) {
    return true;
  }

  const haystack = [
    row.name,
    row.path,
    row.extension,
    row.linkedApplication?.company ?? "",
    row.linkedApplication?.role ?? "",
    row.linkedApplication?.status ?? "",
    row.sortDate,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

export function queryOutputFileRows(
  rows: OutputFileRow[],
  query: OutputFilesTableQuery,
): OutputFileRow[] {
  const filtered = rows.filter(
    (row) =>
      matchesSearch(row, query.searchQuery) &&
      matchesLinkedFilters(row, query.linkedFilters),
  );

  return sortOutputFileRows(filtered, query.sortColumn, query.sortDirection);
}

export function hasActiveOutputFilesFilters(
  query: OutputFilesTableQuery,
): boolean {
  return (
    query.searchQuery.trim().length > 0 ||
    query.linkedFilters.length > 0 ||
    query.sortColumn !== DEFAULT_OUTPUT_FILES_TABLE_QUERY.sortColumn ||
    query.sortDirection !== DEFAULT_OUTPUT_FILES_TABLE_QUERY.sortDirection
  );
}

export function getOutputFilesSortLabel(
  column: OutputFileSortColumn,
  direction: OutputFileSortDirection,
): string {
  const labels: Record<OutputFileSortColumn, string> = {
    name: "File",
    company: "Company",
    role: "Role",
    date: "Date",
  };

  if (column === "date") {
    return `${labels[column]} (${direction === "asc" ? "oldest first" : "newest first"})`;
  }

  return `${labels[column]} (${direction === "asc" ? "A→Z" : "Z→A"})`;
}

export function formatOutputFilesFilterSummary(
  values: string[],
  options: { value: string; label: string }[],
): string {
  if (values.length === 0) {
    return "";
  }

  return values
    .map(
      (value) =>
        options.find((option) => option.value === value)?.label ?? value,
    )
    .join(", ");
}
