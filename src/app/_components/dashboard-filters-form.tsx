"use client";

import { useState } from "react";

import { DashboardPeriodCalendar } from "~/app/_components/dashboard-period-calendar";
import { FilterMultiSelect } from "~/app/_components/filter-multi-select";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { getSearchShortcutLabel } from "~/lib/dashboard/shortcut-label";
import {
  DASHBOARD_PDF_FILTER_OPTIONS,
  DASHBOARD_PERIOD_DAYS_QUICK_OPTIONS,
  DASHBOARD_PERIOD_WEEKS_OPTIONS,
  DASHBOARD_REPORT_FILTER_OPTIONS,
  DASHBOARD_SCORE_FILTER_OPTIONS,
  DEFAULT_DASHBOARD_FILTERS,
  getDashboardFilterSummaryLine,
  hasActiveDashboardFilters,
  type DashboardFilters,
} from "~/lib/career-ops/dashboard-filters";
import {
  isDashboardPeriodEqual,
  normalizeDashboardPeriodDays,
  type DashboardPeriod,
} from "~/lib/career-ops/dashboard-period";
import {
  countApplicationsByStatus,
  sortStatuses,
} from "~/lib/career-ops/status-meta";
import { useLocale } from "~/lib/i18n/locale-context";
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
  const locale = useLocale();
  const [customDaysInput, setCustomDaysInput] = useState(
    filters.period.kind === "days" ? String(filters.period.days) : "7",
  );
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
    locale,
  });

  const setPeriod = (period: DashboardPeriod) => {
    onFiltersChange({ ...filters, period });
  };

  const handleCustomDaysApply = () => {
    const days = normalizeDashboardPeriodDays(Number(customDaysInput));
    setCustomDaysInput(String(days));
    setPeriod({ kind: "days", days });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <Label className="text-white/80">Period</Label>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={filters.period.kind === "all" ? "brand" : "brandSecondary"}
            size="pillSm"
            onClick={() => setPeriod({ kind: "all" })}
          >
            All time
          </Button>
          {DASHBOARD_PERIOD_WEEKS_OPTIONS.map((option) => (
            <Button
              key={option.label}
              type="button"
              variant={
                isDashboardPeriodEqual(filters.period, {
                  kind: "weeks",
                  weeks: option.weeks,
                })
                  ? "brand"
                  : "brandSecondary"
              }
              size="pillSm"
              onClick={() => setPeriod({ kind: "weeks", weeks: option.weeks })}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="dashboard-period-days" className="text-white/80">
          Last N days
        </Label>
        <div className="flex flex-wrap gap-2">
          {DASHBOARD_PERIOD_DAYS_QUICK_OPTIONS.map((days) => (
            <Button
              key={days}
              type="button"
              variant={
                isDashboardPeriodEqual(filters.period, { kind: "days", days })
                  ? "brand"
                  : "brandSecondary"
              }
              size="pillSm"
              onClick={() => {
                setCustomDaysInput(String(days));
                setPeriod({ kind: "days", days });
              }}
            >
              {days}d
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            id="dashboard-period-days"
            type="number"
            min={1}
            max={365}
            value={customDaysInput}
            onChange={(event) => setCustomDaysInput(event.target.value)}
            className="border-white/15 bg-[#15162c] text-white placeholder:text-white/40"
          />
          <Button
            type="button"
            variant="brandSecondary"
            size="pillSm"
            onClick={handleCustomDaysApply}
          >
            Apply
          </Button>
        </div>
      </div>

      <DashboardPeriodCalendar
        applications={applications}
        period={filters.period}
        onPeriodChange={setPeriod}
      />

      <div className="flex justify-end">
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
