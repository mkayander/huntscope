import { filterApplications } from "~/lib/career-ops/analytics";
import {
  dateKeyToDate,
  parseApplicationDate,
  toDateKey,
} from "~/lib/career-ops/dates";
import { parseScore } from "~/lib/career-ops/score";
import type { ApplicationEntry } from "~/lib/career-ops/types";

export type DashboardPeriodWeeks = 12 | 26 | 52;

export type DashboardScoreFilterValue = "high" | "medium" | "low" | "unknown";

export type DashboardFilters = {
  periodWeeks: DashboardPeriodWeeks | null;
  searchQuery: string;
  statusFilters: string[];
  scoreFilters: DashboardScoreFilterValue[];
};

export const DEFAULT_DASHBOARD_FILTERS: DashboardFilters = {
  periodWeeks: null,
  searchQuery: "",
  statusFilters: [],
  scoreFilters: [],
};

export const DASHBOARD_PERIOD_OPTIONS: {
  value: DashboardPeriodWeeks | null;
  label: string;
}[] = [
  { value: null, label: "All time" },
  { value: 12, label: "12 weeks" },
  { value: 26, label: "6 months" },
  { value: 52, label: "1 year" },
];

export const DASHBOARD_SCORE_FILTER_OPTIONS: {
  value: DashboardScoreFilterValue;
  label: string;
}[] = [
  { value: "high", label: "High (4+)" },
  { value: "medium", label: "Medium (3–3.9)" },
  { value: "low", label: "Low (<3)" },
  { value: "unknown", label: "Unscored" },
];

function matchesScoreValue(
  score: string,
  filter: DashboardScoreFilterValue,
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

function matchesScoreFilters(
  score: string,
  scoreFilters: DashboardScoreFilterValue[],
): boolean {
  if (scoreFilters.length === 0) {
    return true;
  }

  return scoreFilters.some((filter) => matchesScoreValue(score, filter));
}

export function getDashboardPeriodCutoff(
  periodWeeks: DashboardPeriodWeeks,
  referenceDate = new Date(),
): string {
  const cutoff = new Date(referenceDate);
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - periodWeeks * 7);
  return toDateKey(cutoff);
}

export function matchesDashboardPeriod(
  application: ApplicationEntry,
  periodWeeks: DashboardPeriodWeeks | null,
  referenceDate = new Date(),
): boolean {
  if (periodWeeks === null) {
    return true;
  }

  const dateKey = parseApplicationDate(application.date);
  if (!dateKey) {
    return false;
  }

  const applicationDate = dateKeyToDate(dateKey);
  if (!applicationDate) {
    return false;
  }

  const cutoffKey = getDashboardPeriodCutoff(periodWeeks, referenceDate);
  return dateKey >= cutoffKey;
}

export function filterDashboardApplications(
  applications: ApplicationEntry[],
  filters: DashboardFilters,
  referenceDate = new Date(),
): ApplicationEntry[] {
  return filterApplications(applications, {
    searchQuery: filters.searchQuery,
    statusFilters: filters.statusFilters,
  }).filter(
    (application) =>
      matchesDashboardPeriod(application, filters.periodWeeks, referenceDate) &&
      matchesScoreFilters(application.score, filters.scoreFilters),
  );
}

export function hasActiveDashboardFilters(filters: DashboardFilters): boolean {
  return (
    filters.periodWeeks !== null ||
    filters.searchQuery.trim().length > 0 ||
    filters.statusFilters.length > 0 ||
    filters.scoreFilters.length > 0
  );
}

export function formatDashboardFilterSummary(
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

export function getDashboardPeriodLabel(
  periodWeeks: DashboardPeriodWeeks | null,
): string {
  return (
    DASHBOARD_PERIOD_OPTIONS.find((option) => option.value === periodWeeks)
      ?.label ?? "All time"
  );
}
