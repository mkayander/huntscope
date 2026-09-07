import { parseApplicationDate } from "~/lib/career-ops/dates";
import { parseScore } from "~/lib/career-ops/score";
import { normalizeStatus } from "~/lib/career-ops/status-meta";
import type { ApplicationEntry } from "~/lib/career-ops/types";

export type TrackerSortColumn =
  "num" | "date" | "company" | "role" | "score" | "status";
export type TrackerSortDirection = "asc" | "desc";

export type TrackerTableQuery = {
  sortColumn: TrackerSortColumn;
  sortDirection: TrackerSortDirection;
};

export const DEFAULT_TRACKER_TABLE_QUERY: TrackerTableQuery = {
  sortColumn: "score",
  sortDirection: "desc",
};

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
  return sortApplications(applications, query.sortColumn, query.sortDirection);
}

export function hasNonDefaultTrackerSort(query: TrackerTableQuery): boolean {
  return (
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
