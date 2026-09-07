import { applicationHasPdf } from "~/lib/career-ops/application-pdfs";
import { applicationHasReport } from "~/lib/career-ops/application-reports";
import { parseApplicationDate } from "~/lib/career-ops/dates";
import { parseScore } from "~/lib/career-ops/score";
import { normalizeStatus } from "~/lib/career-ops/status-meta";
import type { ApplicationEntry, RepoDataFile } from "~/lib/career-ops/types";

export type TrackerSortColumn =
  "num" | "date" | "company" | "role" | "score" | "status";
export type TrackerSortDirection = "asc" | "desc";
export type TrackerScoreFilterValue = "high" | "medium" | "low" | "unknown";
export type TrackerReportFilterValue = "with" | "without";
export type TrackerPdfFilterValue = "with" | "without";

export type TrackerTableQuery = {
  reportFilters: TrackerReportFilterValue[];
  pdfFilters: TrackerPdfFilterValue[];
  sortColumn: TrackerSortColumn;
  sortDirection: TrackerSortDirection;
};

export const DEFAULT_TRACKER_TABLE_QUERY: TrackerTableQuery = {
  reportFilters: [],
  pdfFilters: [],
  sortColumn: "score",
  sortDirection: "desc",
};

export type TrackerRepoFiles = {
  reportFiles: readonly RepoDataFile[];
  outputFiles: readonly RepoDataFile[];
};

const EMPTY_TRACKER_REPO_FILES: TrackerRepoFiles = {
  reportFiles: [],
  outputFiles: [],
};

function hasReportValue(
  application: ApplicationEntry,
  reportFiles: readonly RepoDataFile[],
): boolean {
  return applicationHasReport(application, reportFiles);
}

function matchesReportValue(
  application: ApplicationEntry,
  filter: TrackerReportFilterValue,
  reportFiles: readonly RepoDataFile[],
): boolean {
  const hasReport = hasReportValue(application, reportFiles);
  return filter === "with" ? hasReport : !hasReport;
}

function hasPdfValue(
  application: ApplicationEntry,
  outputFiles: readonly RepoDataFile[],
): boolean {
  return applicationHasPdf(application, outputFiles);
}

function matchesPdfValue(
  application: ApplicationEntry,
  filter: TrackerPdfFilterValue,
  outputFiles: readonly RepoDataFile[],
): boolean {
  const hasPdf = hasPdfValue(application, outputFiles);
  return filter === "with" ? hasPdf : !hasPdf;
}

function matchesPdfFilters(
  application: ApplicationEntry,
  pdfFilters: TrackerPdfFilterValue[],
  outputFiles: readonly RepoDataFile[],
): boolean {
  if (pdfFilters.length === 0) {
    return true;
  }

  return pdfFilters.some((filter) =>
    matchesPdfValue(application, filter, outputFiles),
  );
}

function matchesReportFilters(
  application: ApplicationEntry,
  reportFilters: TrackerReportFilterValue[],
  reportFiles: readonly RepoDataFile[],
): boolean {
  if (reportFilters.length === 0) {
    return true;
  }

  return reportFilters.some((filter) =>
    matchesReportValue(application, filter, reportFiles),
  );
}

function compareDates(left: string, right: string): number {
  const leftKey = parseApplicationDate(left);
  const rightKey = parseApplicationDate(right);

  if (leftKey && rightKey) {
    return leftKey.localeCompare(rightKey);
  }

  if (leftKey) {
    return -1;
  }

  if (rightKey) {
    return 1;
  }

  const leftTime = Date.parse(left);
  const rightTime = Date.parse(right);

  if (!Number.isNaN(leftTime) && !Number.isNaN(rightTime)) {
    return leftTime - rightTime;
  }

  return left.localeCompare(right, undefined, { sensitivity: "base" });
}

function compareScores(
  left: string,
  right: string,
  direction: TrackerSortDirection,
): number {
  const leftScore = parseScore(left);
  const rightScore = parseScore(right);

  if (leftScore === null && rightScore === null) {
    return 0;
  }

  // Unscored entries always sort last.
  if (leftScore === null) {
    return 1;
  }

  if (rightScore === null) {
    return -1;
  }

  return direction === "asc" ? leftScore - rightScore : rightScore - leftScore;
}

function compareEntries(
  left: ApplicationEntry,
  right: ApplicationEntry,
  column: TrackerSortColumn,
): number {
  switch (column) {
    case "num":
      return left.num - right.num;
    case "date":
      return compareDates(left.date, right.date);
    case "company":
      return left.company.localeCompare(right.company, undefined, {
        sensitivity: "base",
      });
    case "role":
      return left.role.localeCompare(right.role, undefined, {
        sensitivity: "base",
      });
    case "score":
      return compareScores(left.score, right.score, "asc");
    case "status":
      return normalizeStatus(left.status).localeCompare(
        normalizeStatus(right.status),
        undefined,
        { sensitivity: "base" },
      );
    default:
      return 0;
  }
}

export function sortApplications(
  applications: ApplicationEntry[],
  column: TrackerSortColumn,
  direction: TrackerSortDirection,
): ApplicationEntry[] {
  if (column === "score") {
    return [...applications].sort((left, right) =>
      compareScores(left.score, right.score, direction),
    );
  }

  const sorted = [...applications].sort((left, right) =>
    compareEntries(left, right, column),
  );
  return direction === "asc" ? sorted : sorted.reverse();
}

export function queryTrackerApplications(
  applications: ApplicationEntry[],
  query: TrackerTableQuery,
  repoFiles: TrackerRepoFiles = EMPTY_TRACKER_REPO_FILES,
): ApplicationEntry[] {
  const { reportFiles, outputFiles } = repoFiles;

  const filtered = applications.filter(
    (application) =>
      matchesReportFilters(application, query.reportFilters, reportFiles) &&
      matchesPdfFilters(application, query.pdfFilters, outputFiles),
  );

  return sortApplications(filtered, query.sortColumn, query.sortDirection);
}

export function hasActiveTrackerFilters(query: TrackerTableQuery): boolean {
  return (
    query.reportFilters.length > 0 ||
    query.pdfFilters.length > 0 ||
    query.sortColumn !== DEFAULT_TRACKER_TABLE_QUERY.sortColumn ||
    query.sortDirection !== DEFAULT_TRACKER_TABLE_QUERY.sortDirection
  );
}

export function formatTrackerFilterSummary(
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

export function getTrackerSortLabel(
  column: TrackerSortColumn,
  direction: TrackerSortDirection,
): string {
  const labels: Record<TrackerSortColumn, string> = {
    num: "#",
    date: "Date",
    company: "Company",
    role: "Role",
    score: "Score",
    status: "Status",
  };

  const ascending = direction === "asc";

  if (column === "num" || column === "score") {
    return `${labels[column]} (${ascending ? "low→high" : "high→low"})`;
  }

  if (column === "date") {
    return `${labels[column]} (${ascending ? "oldest first" : "newest first"})`;
  }

  return `${labels[column]} (${ascending ? "A→Z" : "Z→A"})`;
}
