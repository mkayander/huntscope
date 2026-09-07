import { applicationHasPdf } from "~/lib/career-ops/application-pdfs";
import { applicationHasReport } from "~/lib/career-ops/application-reports";
import { filterApplications } from "~/lib/career-ops/analytics";
import {
  DEFAULT_DASHBOARD_PERIOD,
  getDashboardPeriodLabel,
  isDashboardPeriodActive,
  matchesDashboardPeriod,
  type DashboardPeriod,
} from "~/lib/career-ops/dashboard-period";
import { parseScore } from "~/lib/career-ops/score";
import type { ApplicationEntry, RepoDataFile } from "~/lib/career-ops/types";

export type {
  DashboardPeriod,
  DashboardPeriodWeeks,
} from "~/lib/career-ops/dashboard-period";
export {
  DASHBOARD_PERIOD_DAYS_QUICK_OPTIONS,
  DASHBOARD_PERIOD_PRESETS,
  DASHBOARD_PERIOD_WEEKS_OPTIONS,
  DEFAULT_DASHBOARD_PERIOD,
  getDashboardPeriodCutoff,
  getDashboardPeriodLabel,
} from "~/lib/career-ops/dashboard-period";

export type DashboardScoreFilterValue = "high" | "medium" | "low" | "unknown";

export type DashboardReportFilterValue = "with" | "without";

export type DashboardPdfFilterValue = "with" | "without";

export type DashboardFilters = {
  period: DashboardPeriod;
  searchQuery: string;
  statusFilters: string[];
  scoreFilters: DashboardScoreFilterValue[];
  reportFilters: DashboardReportFilterValue[];
  pdfFilters: DashboardPdfFilterValue[];
};

export type DashboardRepoFiles = {
  reportFiles: readonly RepoDataFile[];
  outputFiles: readonly RepoDataFile[];
};

export const DEFAULT_DASHBOARD_FILTERS: DashboardFilters = {
  period: DEFAULT_DASHBOARD_PERIOD,
  searchQuery: "",
  statusFilters: [],
  scoreFilters: [],
  reportFilters: [],
  pdfFilters: [],
};

/** @deprecated Use DASHBOARD_PERIOD_WEEKS_OPTIONS with DashboardPeriod instead. */
export const DASHBOARD_PERIOD_OPTIONS = [
  { value: null, label: "All time" },
  ...[
    { weeks: 12 as const, label: "12 weeks" },
    { weeks: 26 as const, label: "6 months" },
    { weeks: 52 as const, label: "1 year" },
  ].map((option) => ({
    value: option.weeks,
    label: option.label,
  })),
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

export const DASHBOARD_REPORT_FILTER_OPTIONS: {
  value: DashboardReportFilterValue;
  label: string;
}[] = [
  { value: "with", label: "With report" },
  { value: "without", label: "Without report" },
];

export const DASHBOARD_PDF_FILTER_OPTIONS: {
  value: DashboardPdfFilterValue;
  label: string;
}[] = [
  { value: "with", label: "With PDF" },
  { value: "without", label: "Without PDF" },
];

const EMPTY_DASHBOARD_REPO_FILES: DashboardRepoFiles = {
  reportFiles: [],
  outputFiles: [],
};

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

function matchesReportValue(
  application: ApplicationEntry,
  filter: DashboardReportFilterValue,
  reportFiles: readonly RepoDataFile[],
): boolean {
  const hasReport = applicationHasReport(application, reportFiles);
  return filter === "with" ? hasReport : !hasReport;
}

function matchesPdfValue(
  application: ApplicationEntry,
  filter: DashboardPdfFilterValue,
  outputFiles: readonly RepoDataFile[],
): boolean {
  const hasPdf = applicationHasPdf(application, outputFiles);
  return filter === "with" ? hasPdf : !hasPdf;
}

function matchesReportFilters(
  application: ApplicationEntry,
  reportFilters: DashboardReportFilterValue[],
  reportFiles: readonly RepoDataFile[],
): boolean {
  if (reportFilters.length === 0) {
    return true;
  }

  return reportFilters.some((filter) =>
    matchesReportValue(application, filter, reportFiles),
  );
}

function matchesPdfFilters(
  application: ApplicationEntry,
  pdfFilters: DashboardPdfFilterValue[],
  outputFiles: readonly RepoDataFile[],
): boolean {
  if (pdfFilters.length === 0) {
    return true;
  }

  return pdfFilters.some((filter) =>
    matchesPdfValue(application, filter, outputFiles),
  );
}

export function filterDashboardApplications(
  applications: ApplicationEntry[],
  filters: DashboardFilters,
  options: {
    referenceDate?: Date;
    repoFiles?: DashboardRepoFiles;
  } = {},
): ApplicationEntry[] {
  const { referenceDate = new Date(), repoFiles = EMPTY_DASHBOARD_REPO_FILES } =
    options;
  const { reportFiles, outputFiles } = repoFiles;

  return filterApplications(applications, {
    searchQuery: filters.searchQuery,
    statusFilters: filters.statusFilters,
  }).filter(
    (application) =>
      matchesDashboardPeriod(application, filters.period, referenceDate) &&
      matchesScoreFilters(application.score, filters.scoreFilters) &&
      matchesReportFilters(application, filters.reportFilters, reportFiles) &&
      matchesPdfFilters(application, filters.pdfFilters, outputFiles),
  );
}

export function hasActiveDashboardFilters(filters: DashboardFilters): boolean {
  return (
    isDashboardPeriodActive(filters.period) ||
    filters.searchQuery.trim().length > 0 ||
    filters.statusFilters.length > 0 ||
    filters.scoreFilters.length > 0 ||
    filters.reportFilters.length > 0 ||
    filters.pdfFilters.length > 0
  );
}

export function countActiveDashboardFilters(filters: DashboardFilters): number {
  let count = 0;

  if (isDashboardPeriodActive(filters.period)) {
    count += 1;
  }

  if (filters.searchQuery.trim().length > 0) {
    count += 1;
  }

  count += filters.statusFilters.length;
  count += filters.scoreFilters.length;
  count += filters.reportFilters.length;
  count += filters.pdfFilters.length;

  return count;
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

export function getDashboardFilterSummaryLine(
  filters: DashboardFilters,
  options: {
    resultCount: number;
    totalCount: number;
    statusOptions?: { value: string; label: string }[];
    locale?: string;
  },
): string {
  const statusSummary = formatDashboardFilterSummary(
    filters.statusFilters,
    options.statusOptions ??
      filters.statusFilters.map((status) => ({
        value: status,
        label: status,
      })),
  );
  const scoreSummary = formatDashboardFilterSummary(
    filters.scoreFilters,
    DASHBOARD_SCORE_FILTER_OPTIONS,
  );
  const reportSummary = formatDashboardFilterSummary(
    filters.reportFilters,
    DASHBOARD_REPORT_FILTER_OPTIONS,
  );
  const pdfSummary = formatDashboardFilterSummary(
    filters.pdfFilters,
    DASHBOARD_PDF_FILTER_OPTIONS,
  );

  return [
    `Showing ${options.resultCount} of ${options.totalCount} applications`,
    `period: ${getDashboardPeriodLabel(filters.period, options.locale)}`,
    statusSummary ? `status: ${statusSummary}` : "",
    scoreSummary ? `score: ${scoreSummary}` : "",
    reportSummary ? `report: ${reportSummary}` : "",
    pdfSummary ? `pdf: ${pdfSummary}` : "",
  ]
    .filter(Boolean)
    .join(" · ");
}

export const DASHBOARD_FILTERS_OPEN_EVENT = "dashboard:open-filters";

export function openDashboardFilters(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(DASHBOARD_FILTERS_OPEN_EVENT));
}
