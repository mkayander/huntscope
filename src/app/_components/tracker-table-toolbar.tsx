"use client";

import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from "lucide-react";

import { FilterMultiSelect } from "~/app/_components/filter-multi-select";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  DEFAULT_TRACKER_TABLE_QUERY,
  formatTrackerFilterSummary,
  getTrackerSortLabel,
  hasActiveTrackerFilters,
  type TrackerReportFilterValue,
  type TrackerScoreFilterValue,
  type TrackerSortColumn,
  type TrackerSortDirection,
  type TrackerTableQuery,
} from "~/lib/career-ops/tracker-table";
import { sortStatuses } from "~/lib/career-ops/status-meta";
import type { ApplicationEntry } from "~/lib/career-ops/types";

const SCORE_FILTER_OPTIONS: {
  value: TrackerScoreFilterValue;
  label: string;
}[] = [
  { value: "high", label: "High (4+)" },
  { value: "medium", label: "Medium (3–3.9)" },
  { value: "low", label: "Low (<3)" },
  { value: "unknown", label: "Unscored" },
];

const REPORT_FILTER_OPTIONS: {
  value: TrackerReportFilterValue;
  label: string;
}[] = [
  { value: "with", label: "With report" },
  { value: "without", label: "Without report" },
];

type TrackerTableToolbarProps = {
  applications: ApplicationEntry[];
  query: TrackerTableQuery;
  resultCount: number;
  onQueryChange: (query: TrackerTableQuery) => void;
  onClearFilters: () => void;
};

export function TrackerTableToolbar({
  applications,
  query,
  resultCount,
  onQueryChange,
  onClearFilters,
}: TrackerTableToolbarProps) {
  const uniqueStatuses = sortStatuses(
    applications.reduce<Record<string, number>>((counts, application) => {
      const status = application.status;
      counts[status] = (counts[status] ?? 0) + 1;
      return counts;
    }, {}),
  );

  const statusOptions = uniqueStatuses.map((status) => ({
    value: status,
    label: status,
  }));

  const statusSummary = formatTrackerFilterSummary(
    query.statusFilters,
    statusOptions,
  );
  const scoreSummary = formatTrackerFilterSummary(
    query.scoreFilters,
    SCORE_FILTER_OPTIONS,
  );
  const reportSummary = formatTrackerFilterSummary(
    query.reportFilters,
    REPORT_FILTER_OPTIONS,
  );

  return (
    <div className="mt-4 flex flex-col gap-4">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(9rem,1fr))_auto] lg:items-end">
        <div className="flex min-w-0 flex-col gap-1.5">
          <Label htmlFor="tracker-search" className="text-white/80">
            Search
          </Label>
          <Input
            id="tracker-search"
            value={query.searchQuery}
            onChange={(event) => {
              onQueryChange({ ...query, searchQuery: event.target.value });
            }}
            placeholder="Company, role, status, notes, score…"
            className="border-white/15 bg-[#15162c] text-white placeholder:text-white/40"
          />
        </div>

        <FilterMultiSelect
          id="tracker-status-filter"
          label="Status"
          options={statusOptions}
          selected={query.statusFilters}
          placeholder="All statuses"
          onChange={(statusFilters) => {
            onQueryChange({ ...query, statusFilters });
          }}
        />

        <FilterMultiSelect
          id="tracker-score-filter"
          label="Score"
          options={SCORE_FILTER_OPTIONS}
          selected={query.scoreFilters}
          placeholder="All scores"
          onChange={(scoreFilters) => {
            onQueryChange({ ...query, scoreFilters });
          }}
        />

        <FilterMultiSelect
          id="tracker-report-filter"
          label="Report"
          options={REPORT_FILTER_OPTIONS}
          selected={query.reportFilters}
          placeholder="All reports"
          onChange={(reportFilters) => {
            onQueryChange({ ...query, reportFilters });
          }}
        />

        <Button
          type="button"
          variant="brandSecondary"
          size="pill"
          className="w-full lg:w-auto"
          disabled={!hasActiveTrackerFilters(query)}
          onClick={onClearFilters}
        >
          Reset
        </Button>
      </div>

      <p className="text-sm text-white/50">
        Showing {resultCount} of {applications.length} applications
        {statusSummary ? ` · status: ${statusSummary}` : ""}
        {scoreSummary ? ` · score: ${scoreSummary}` : ""}
        {reportSummary ? ` · report: ${reportSummary}` : ""}
        {` · sorted by ${getTrackerSortLabel(query.sortColumn, query.sortDirection)}`}
      </p>
    </div>
  );
}

type SortableHeaderProps = {
  label: string;
  column: TrackerSortColumn;
  sortColumn: TrackerSortColumn;
  sortDirection: TrackerSortDirection;
  onSort: (column: TrackerSortColumn) => void;
  className?: string;
  as?: "th" | "div";
};

export function TrackerSortableHeader({
  label,
  column,
  sortColumn,
  sortDirection,
  onSort,
  className,
  as = "th",
}: SortableHeaderProps) {
  const isActive = sortColumn === column;
  const HeaderTag = as;

  return (
    <HeaderTag
      className={className}
      role={as === "div" ? "columnheader" : undefined}
      aria-sort={
        isActive
          ? sortDirection === "asc"
            ? "ascending"
            : "descending"
          : "none"
      }
    >
      <button
        type="button"
        onClick={() => onSort(column)}
        className="inline-flex w-full cursor-pointer items-center gap-1 rounded-md px-0 py-1 text-left font-medium text-white/60 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
      >
        <span>{label}</span>
        {isActive ? (
          sortDirection === "asc" ? (
            <ArrowUpIcon className="size-3.5 shrink-0 text-violet-300" />
          ) : (
            <ArrowDownIcon className="size-3.5 shrink-0 text-violet-300" />
          )
        ) : (
          <ArrowUpDownIcon className="size-3.5 shrink-0 opacity-40" />
        )}
      </button>
    </HeaderTag>
  );
}

export function createDefaultTrackerQuery(
  statusFilters: string[],
): TrackerTableQuery {
  return {
    ...DEFAULT_TRACKER_TABLE_QUERY,
    statusFilters,
  };
}
