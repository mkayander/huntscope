import { filterApplications } from "~/lib/career-ops/analytics";
import { parseApplicationDate } from "~/lib/career-ops/dates";
import { parseScore } from "~/lib/career-ops/score";
import { normalizeStatus } from "~/lib/career-ops/status-meta";
import type { ApplicationEntry } from "~/lib/career-ops/types";

export type TrackerSortColumn = "num" | "date" | "company" | "role" | "score" | "status";
export type TrackerSortDirection = "asc" | "desc";
export type TrackerScoreFilter = "all" | "high" | "medium" | "low" | "unknown";
export type TrackerReportFilter = "all" | "with" | "without";

export type TrackerTableQuery = {
  searchQuery: string;
  statusFilter: string | null;
  scoreFilter: TrackerScoreFilter;
  reportFilter: TrackerReportFilter;
  sortColumn: TrackerSortColumn;
  sortDirection: TrackerSortDirection;
};

export const DEFAULT_TRACKER_TABLE_QUERY: TrackerTableQuery = {
  searchQuery: "",
  statusFilter: null,
  scoreFilter: "all",
  reportFilter: "all",
  sortColumn: "num",
  sortDirection: "desc",
};

function hasReportValue(value: string): boolean {
  return value.trim().length > 0 && value.trim() !== "—";
}

function matchesScoreFilter(score: string, scoreFilter: TrackerScoreFilter): boolean {
  if (scoreFilter === "all") {
    return true;
  }

  const parsed = parseScore(score);
  if (scoreFilter === "unknown") {
    return parsed === null;
  }

  if (parsed === null) {
    return false;
  }

  if (scoreFilter === "high") {
    return parsed >= 4;
  }

  if (scoreFilter === "medium") {
    return parsed >= 3 && parsed < 4;
  }

  return parsed < 3;
}

function matchesReportFilter(report: string, reportFilter: TrackerReportFilter): boolean {
  if (reportFilter === "all") {
    return true;
  }

  const hasReport = hasReportValue(report);
  return reportFilter === "with" ? hasReport : !hasReport;
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
      return left.company.localeCompare(right.company, undefined, { sensitivity: "base" });
    case "role":
      return left.role.localeCompare(right.role, undefined, { sensitivity: "base" });
    case "score": {
      const leftScore = parseScore(left.score);
      const rightScore = parseScore(right.score);

      if (leftScore === null && rightScore === null) {
        return 0;
      }

      if (leftScore === null) {
        return 1;
      }

      if (rightScore === null) {
        return -1;
      }

      return leftScore - rightScore;
    }
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
  const sorted = [...applications].sort((left, right) => compareEntries(left, right, column));
  return direction === "asc" ? sorted : sorted.reverse();
}

export function queryTrackerApplications(
  applications: ApplicationEntry[],
  query: TrackerTableQuery,
): ApplicationEntry[] {
  const filtered = filterApplications(applications, {
    statusFilter: query.statusFilter,
    searchQuery: query.searchQuery,
  }).filter(
    (application) =>
      matchesScoreFilter(application.score, query.scoreFilter) &&
      matchesReportFilter(application.report, query.reportFilter),
  );

  return sortApplications(filtered, query.sortColumn, query.sortDirection);
}

export function hasActiveTrackerFilters(query: TrackerTableQuery): boolean {
  return (
    query.searchQuery.trim().length > 0 ||
    query.statusFilter !== null ||
    query.scoreFilter !== "all" ||
    query.reportFilter !== "all" ||
    query.sortColumn !== DEFAULT_TRACKER_TABLE_QUERY.sortColumn ||
    query.sortDirection !== DEFAULT_TRACKER_TABLE_QUERY.sortDirection
  );
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
