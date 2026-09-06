"use client";

import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  DEFAULT_TRACKER_TABLE_QUERY,
  getTrackerSortLabel,
  hasActiveTrackerFilters,
  type TrackerReportFilter,
  type TrackerScoreFilter,
  type TrackerSortColumn,
  type TrackerSortDirection,
  type TrackerTableQuery,
} from "~/lib/career-ops/tracker-table";
import { sortStatuses } from "~/lib/career-ops/status-meta";
import type { ApplicationEntry } from "~/lib/career-ops/types";

const STATUS_ALL_VALUE = "__all_statuses__";

const SCORE_FILTER_OPTIONS: { value: TrackerScoreFilter; label: string }[] = [
  { value: "all", label: "All scores" },
  { value: "high", label: "High (4+)" },
  { value: "medium", label: "Medium (3–3.9)" },
  { value: "low", label: "Low (<3)" },
  { value: "unknown", label: "Unscored" },
];

const REPORT_FILTER_OPTIONS: { value: TrackerReportFilter; label: string }[] = [
  { value: "all", label: "All reports" },
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

        <div className="flex min-w-0 flex-col gap-1.5">
          <Label htmlFor="tracker-status-filter" className="text-white/80">
            Status
          </Label>
          <Select
            value={query.statusFilter ?? STATUS_ALL_VALUE}
            onValueChange={(value) => {
              onQueryChange({
                ...query,
                statusFilter: value === STATUS_ALL_VALUE ? null : value,
              });
            }}
          >
            <SelectTrigger
              id="tracker-status-filter"
              className="w-full border-white/15 bg-[#15162c]"
            >
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent className="border-white/15 bg-[#15162c] text-white">
              <SelectItem value={STATUS_ALL_VALUE}>All statuses</SelectItem>
              {uniqueStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex min-w-0 flex-col gap-1.5">
          <Label htmlFor="tracker-score-filter" className="text-white/80">
            Score
          </Label>
          <Select
            value={query.scoreFilter}
            onValueChange={(value) => {
              onQueryChange({
                ...query,
                scoreFilter: value as TrackerScoreFilter,
              });
            }}
          >
            <SelectTrigger
              id="tracker-score-filter"
              className="w-full border-white/15 bg-[#15162c]"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-white/15 bg-[#15162c] text-white">
              {SCORE_FILTER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex min-w-0 flex-col gap-1.5">
          <Label htmlFor="tracker-report-filter" className="text-white/80">
            Report
          </Label>
          <Select
            value={query.reportFilter}
            onValueChange={(value) => {
              onQueryChange({
                ...query,
                reportFilter: value as TrackerReportFilter,
              });
            }}
          >
            <SelectTrigger
              id="tracker-report-filter"
              className="w-full border-white/15 bg-[#15162c]"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-white/15 bg-[#15162c] text-white">
              {REPORT_FILTER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
        {query.statusFilter ? ` · status: ${query.statusFilter}` : ""}
        {query.scoreFilter !== "all"
          ? ` · score: ${SCORE_FILTER_OPTIONS.find((option) => option.value === query.scoreFilter)?.label ?? query.scoreFilter}`
          : ""}
        {query.reportFilter !== "all"
          ? ` · report: ${REPORT_FILTER_OPTIONS.find((option) => option.value === query.reportFilter)?.label ?? query.reportFilter}`
          : ""}
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
  statusFilter: string | null,
): TrackerTableQuery {
  return {
    ...DEFAULT_TRACKER_TABLE_QUERY,
    statusFilter,
  };
}
