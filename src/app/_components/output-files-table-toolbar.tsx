"use client";

import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from "lucide-react";

import { FilterMultiSelect } from "~/app/_components/filter-multi-select";
import { clickableSurfaceClassName } from "~/components/ui/interaction";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";
import {
  formatOutputFilesFilterSummary,
  getOutputFilesSortLabel,
  hasActiveOutputFilesFilters,
  type OutputFileSortColumn,
  type OutputFileSortDirection,
  type OutputFilesTableQuery,
  type OutputLinkedFilterValue,
} from "~/lib/career-ops/output-files-table";
import { getSearchShortcutLabel } from "~/lib/dashboard/shortcut-label";

const LINKED_FILTER_OPTIONS: {
  value: OutputLinkedFilterValue;
  label: string;
}[] = [
  { value: "with", label: "Linked application" },
  { value: "without", label: "Unlinked" },
];

type OutputFilesTableToolbarProps = {
  query: OutputFilesTableQuery;
  resultCount: number;
  totalCount: number;
  onQueryChange: (query: OutputFilesTableQuery) => void;
  onClearFilters: () => void;
};

export function OutputFilesTableToolbar({
  query,
  resultCount,
  totalCount,
  onQueryChange,
  onClearFilters,
}: OutputFilesTableToolbarProps) {
  const linkedSummary = formatOutputFilesFilterSummary(
    query.linkedFilters,
    LINKED_FILTER_OPTIONS,
  );

  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 gap-3 sm:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="output-files-search" className="text-white/80">
              Search PDFs
            </Label>
            <Input
              id="output-files-search"
              value={query.searchQuery}
              onChange={(event) =>
                onQueryChange({
                  ...query,
                  searchQuery: event.target.value,
                })
              }
              placeholder={`Search by file, company, or role (${getSearchShortcutLabel()})`}
              className="border-white/15 bg-[#15162c] text-white placeholder:text-white/45"
            />
          </div>

          <FilterMultiSelect
            id="output-files-linked-filter"
            label="Application link"
            options={LINKED_FILTER_OPTIONS}
            selected={query.linkedFilters}
            onChange={(linkedFilters) =>
              onQueryChange({ ...query, linkedFilters })
            }
            placeholder="All PDFs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {hasActiveOutputFilesFilters(query) ? (
            <Button
              type="button"
              variant="brandSecondary"
              size="pillSm"
              onClick={onClearFilters}
            >
              Clear filters
            </Button>
          ) : null}
        </div>
      </div>

      <p className="text-xs text-white/50">
        Showing {resultCount} of {totalCount} PDFs
        {linkedSummary ? ` · Application link: ${linkedSummary}` : ""}
        {query.sortColumn
          ? ` · Sorted by ${getOutputFilesSortLabel(query.sortColumn, query.sortDirection)}`
          : ""}
      </p>
    </div>
  );
}

type SortableHeaderProps = {
  label: string;
  column: OutputFileSortColumn;
  sortColumn: OutputFileSortColumn;
  sortDirection: OutputFileSortDirection;
  onSort: (column: OutputFileSortColumn) => void;
  className?: string;
  as?: "th" | "div";
};

export function OutputFilesStaticHeader({
  label,
  className,
  as = "div",
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

export function OutputFilesSortableHeader({
  label,
  column,
  sortColumn,
  sortDirection,
  onSort,
  className,
  as = "div",
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
