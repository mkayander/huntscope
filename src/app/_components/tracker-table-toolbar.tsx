"use client";

import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from "lucide-react";

import { FilterMultiSelect } from "~/app/_components/filter-multi-select";
import { clickableSurfaceClassName } from "~/components/ui/interaction";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import {
  DEFAULT_TRACKER_TABLE_QUERY,
  formatTrackerFilterSummary,
  getTrackerSortLabel,
  hasActiveTrackerFilters,
  type TrackerPdfFilterValue,
  type TrackerReportFilterValue,
  type TrackerSortColumn,
  type TrackerSortDirection,
  type TrackerTableQuery,
} from "~/lib/career-ops/tracker-table";

const REPORT_FILTER_OPTIONS: {
  value: TrackerReportFilterValue;
  label: string;
}[] = [
  { value: "with", label: "With report" },
  { value: "without", label: "Without report" },
];

const PDF_FILTER_OPTIONS: {
  value: TrackerPdfFilterValue;
  label: string;
}[] = [
  { value: "with", label: "With PDF" },
  { value: "without", label: "Without PDF" },
];

type TrackerTableToolbarProps = {
  query: TrackerTableQuery;
  resultCount: number;
  totalCount: number;
  onQueryChange: (query: TrackerTableQuery) => void;
  onClearFilters: () => void;
};

export function TrackerTableToolbar({
  query,
  resultCount,
  totalCount,
  onQueryChange,
  onClearFilters,
}: TrackerTableToolbarProps) {
  const reportSummary = formatTrackerFilterSummary(
    query.reportFilters,
    REPORT_FILTER_OPTIONS,
  );
  const pdfSummary = formatTrackerFilterSummary(
    query.pdfFilters,
    PDF_FILTER_OPTIONS,
  );

  return (
    <div className="mt-4 flex flex-col gap-4">
      <div className="grid gap-3 lg:grid-cols-[repeat(2,minmax(9rem,1fr))_auto] lg:items-end">
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

        <FilterMultiSelect
          id="tracker-pdf-filter"
          label="PDF"
          options={PDF_FILTER_OPTIONS}
          selected={query.pdfFilters}
          placeholder="All PDFs"
          onChange={(pdfFilters) => {
            onQueryChange({ ...query, pdfFilters });
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
          Reset tracker filters
        </Button>
      </div>

      <p className="text-sm text-white/50">
        Showing {resultCount} of {totalCount} scoped applications
        {reportSummary ? ` · report: ${reportSummary}` : ""}
        {pdfSummary ? ` · pdf: ${pdfSummary}` : ""}
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

export function TrackerStaticHeader({
  label,
  className,
  as = "th",
}: {
  label: string;
  className?: string;
  as?: "th" | "div";
}) {
  const HeaderTag = as;

  return (
    <HeaderTag
      className={className}
      role={as === "div" ? "columnheader" : undefined}
    >
      <span className="inline-flex w-full items-center gap-1 px-0 py-1 text-left font-medium text-white/60">
        <span>{label}</span>
        <ArrowUpDownIcon
          className="size-3.5 shrink-0 opacity-0"
          aria-hidden="true"
        />
      </span>
    </HeaderTag>
  );
}

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
        className={cn(
          clickableSurfaceClassName,
          "inline-flex w-full items-center gap-1 rounded-md px-0 py-1 text-left font-medium text-white/60 hover:text-white",
        )}
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

export function createDefaultTrackerQuery(): TrackerTableQuery {
  return DEFAULT_TRACKER_TABLE_QUERY;
}
