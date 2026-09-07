"use client";

import { FilterMultiSelect } from "~/app/_components/filter-multi-select";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { getSearchShortcutLabel } from "~/lib/dashboard/shortcut-label";
import {
  DASHBOARD_PDF_FILTER_OPTIONS,
  DASHBOARD_PERIOD_OPTIONS,
  DASHBOARD_REPORT_FILTER_OPTIONS,
  DASHBOARD_SCORE_FILTER_OPTIONS,
  DEFAULT_DASHBOARD_FILTERS,
  getDashboardFilterSummaryLine,
  hasActiveDashboardFilters,
  type DashboardFilters,
} from "~/lib/career-ops/dashboard-filters";
import {
  countApplicationsByStatus,
  sortStatuses,
} from "~/lib/career-ops/status-meta";
import type { ApplicationEntry } from "~/lib/career-ops/types";

type DashboardFiltersFormProps = {
  applications: ApplicationEntry[];
  filters: DashboardFilters;
  resultCount: number;
  onFiltersChange: (filters: DashboardFilters) => void;
};

export function DashboardFiltersForm({
  applications,
  filters,
  resultCount,
  onFiltersChange,
}: DashboardFiltersFormProps) {
  const statusOptions = sortStatuses(
    countApplicationsByStatus(applications),
  ).map((status) => ({
    value: status,
    label: status,
  }));

  const summaryLine = getDashboardFilterSummaryLine(filters, {
    resultCount,
    totalCount: applications.length,
    statusOptions,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
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
          className="w-full sm:w-auto"
          disabled={!hasActiveDashboardFilters(filters)}
          onClick={() => onFiltersChange(DEFAULT_DASHBOARD_FILTERS)}
        >
          Reset filters
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-1.5 sm:col-span-2">
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

        <FilterMultiSelect
          id="dashboard-report-filter"
          label="Report"
          options={DASHBOARD_REPORT_FILTER_OPTIONS}
          selected={filters.reportFilters}
          placeholder="All reports"
          onChange={(reportFilters) => {
            onFiltersChange({ ...filters, reportFilters });
          }}
        />

        <FilterMultiSelect
          id="dashboard-pdf-filter"
          label="PDF"
          options={DASHBOARD_PDF_FILTER_OPTIONS}
          selected={filters.pdfFilters}
          placeholder="All PDFs"
          onChange={(pdfFilters) => {
            onFiltersChange({ ...filters, pdfFilters });
          }}
        />
      </div>

      <p className="text-sm text-white/50">{summaryLine}</p>
    </div>
  );
}
