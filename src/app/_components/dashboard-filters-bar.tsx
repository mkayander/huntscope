"use client";

import { FilterMultiSelect } from "~/app/_components/filter-multi-select";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { getSearchShortcutLabel } from "~/lib/dashboard/shortcut-label";
import {
  DASHBOARD_PERIOD_OPTIONS,
  DASHBOARD_SCORE_FILTER_OPTIONS,
  DEFAULT_DASHBOARD_FILTERS,
  formatDashboardFilterSummary,
  getDashboardPeriodLabel,
  hasActiveDashboardFilters,
  type DashboardFilters,
} from "~/lib/career-ops/dashboard-filters";
import {
  countApplicationsByStatus,
  sortStatuses,
} from "~/lib/career-ops/status-meta";
import type { ApplicationEntry } from "~/lib/career-ops/types";

type DashboardFiltersBarProps = {
  applications: ApplicationEntry[];
  filters: DashboardFilters;
  resultCount: number;
  onFiltersChange: (filters: DashboardFilters) => void;
};

export function DashboardFiltersBar({
  applications,
  filters,
  resultCount,
  onFiltersChange,
}: DashboardFiltersBarProps) {
  const statusOptions = sortStatuses(
    countApplicationsByStatus(applications),
  ).map((status) => ({
    value: status,
    label: status,
  }));

  const statusSummary = formatDashboardFilterSummary(
    filters.statusFilters,
    statusOptions,
  );
  const scoreSummary = formatDashboardFilterSummary(
    filters.scoreFilters,
    DASHBOARD_SCORE_FILTER_OPTIONS,
  );

  return (
    <div className="mt-6 flex flex-col gap-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div className="flex flex-wrap gap-2">
          {DASHBOARD_PERIOD_OPTIONS.map((option) => (
            <Button
              key={option.label}
              type="button"
              variant={
                filters.periodWeeks === option.value
                  ? "brand"
                  : "brandSecondary"
              }
              size="pillSm"
              onClick={() => {
                onFiltersChange({ ...filters, periodWeeks: option.value });
              }}
            >
              {option.label}
            </Button>
          ))}
        </div>

        <Button
          type="button"
          variant="brandSecondary"
          size="pill"
          className="w-full xl:w-auto"
          disabled={!hasActiveDashboardFilters(filters)}
          onClick={() => onFiltersChange(DEFAULT_DASHBOARD_FILTERS)}
        >
          Reset filters
        </Button>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_repeat(2,minmax(9rem,1fr))] lg:items-end">
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-2">
            <Label htmlFor="dashboard-search" className="text-white/80">
              Search
            </Label>
            <span className="hidden text-[10px] tracking-wide text-white/35 uppercase sm:inline">
              {getSearchShortcutLabel()}
            </span>
          </div>
          <Input
            id="dashboard-search"
            value={filters.searchQuery}
            onChange={(event) => {
              onFiltersChange({ ...filters, searchQuery: event.target.value });
            }}
            placeholder="Company, role, status, notes, score…"
            className="border-white/15 bg-[#15162c] text-white placeholder:text-white/40"
          />
        </div>

        <FilterMultiSelect
          id="dashboard-status-filter"
          label="Status"
          options={statusOptions}
          selected={filters.statusFilters}
          placeholder="All statuses"
          onChange={(statusFilters) => {
            onFiltersChange({ ...filters, statusFilters });
          }}
        />

        <FilterMultiSelect
          id="dashboard-score-filter"
          label="Score"
          options={DASHBOARD_SCORE_FILTER_OPTIONS}
          selected={filters.scoreFilters}
          placeholder="All scores"
          onChange={(scoreFilters) => {
            onFiltersChange({ ...filters, scoreFilters });
          }}
        />
      </div>

      <p className="text-sm text-white/50">
        Showing {resultCount} of {applications.length} applications
        {` · period: ${getDashboardPeriodLabel(filters.periodWeeks)}`}
        {statusSummary ? ` · status: ${statusSummary}` : ""}
        {scoreSummary ? ` · score: ${scoreSummary}` : ""}
      </p>
    </div>
  );
}
