import { filterApplications } from "~/lib/career-ops/analytics";
import { parseApplicationDate } from "~/lib/career-ops/dates";
import { parseScore } from "~/lib/career-ops/score";
import { normalizeStatus } from "~/lib/career-ops/status-meta";
import type { ApplicationEntry } from "~/lib/career-ops/types";

export type TrackerSortColumn =
  "num" | "date" | "company" | "role" | "score" | "status";
export type TrackerSortDirection = "asc" | "desc";
export type TrackerScoreFilterValue = "high" | "medium" | "low" | "unknown";
export type TrackerReportFilterValue = "with" | "without";

export type TrackerTableQuery = {
  searchQuery: string;
  statusFilters: string[];
  scoreFilters: TrackerScoreFilterValue[];
  reportFilters: TrackerReportFilterValue[];
  sortColumn: TrackerSortColumn;
  sortDirection: TrackerSortDirection;
};

export const DEFAULT_TRACKER_TABLE_QUERY: TrackerTableQuery = {
  searchQuery: "",
  statusFilters: [],
  scoreFilters: [],
  reportFilters: [],
  sortColumn: "num",
  sortDirection: "desc",
};

function hasReportValue(value: string): boolean {
  return value.trim().length > 0 && value.trim() !== "—";
}

function matchesScoreValue(
  score: string,
  filter: TrackerScoreFilterValue,
): boolean {
  const parsed = parseScore(score);

  if (filter === "unknown") {
    return parsed === null;
  }

  if (parsed === null) {
    return false;
  }

  if (filter === "high") {
    return parsed >= 4;
  }

  if (filter === "medium") {
    return parsed >= 3 && parsed < 4;
  }

  return parsed < 3;
}

function matchesReportValue(
  report: string,
  filter: TrackerReportFilterValue,
): boolean {
  const hasReport = hasReportValue(report);
  return filter === "with" ? hasReport : !hasReport;
}

function matchesScoreFilters(
  score: string,
  scoreFilters: TrackerScoreFilterValue[],
): boolean {
  if (scoreFilters.length === 0) {
    return true;
  }

  return scoreFilters.some((filter) => matchesScoreValue(score, filter));
}

function matchesReportFilters(
  report: string,
  reportFilters: TrackerReportFilterValue[],
): boolean {
  if (reportFilters.length === 0) {
    return true;
  }

  return reportFilters.some((filter) => matchesReportValue(report, filter));
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
): ApplicationEntry[] {
  const filtered = filterApplications(applications, {
    statusFilters: query.statusFilters,
    searchQuery: query.searchQuery,
  }).filter(
    (application) =>
      matchesScoreFilters(application.score, query.scoreFilters) &&
      matchesReportFilters(application.report, query.reportFilters),
  );

  return sortApplications(filtered, query.sortColumn, query.sortDirection);
}

export function hasActiveTrackerFilters(query: TrackerTableQuery): boolean {
  return (
    query.searchQuery.trim().length > 0 ||
    query.statusFilters.length > 0 ||
    query.scoreFilters.length > 0 ||
    query.reportFilters.length > 0 ||
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
