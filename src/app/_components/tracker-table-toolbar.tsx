"use client";

import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from "lucide-react";

import { clickableSurfaceClassName } from "~/components/ui/interaction";
import { cn } from "~/lib/utils";
import {
  DEFAULT_TRACKER_TABLE_QUERY,
  type TrackerSortColumn,
  type TrackerSortDirection,
  type TrackerTableQuery,
} from "~/lib/career-ops/tracker-table";

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
