"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { ACTIVITY_LEVEL_CLASS_NAMES } from "~/lib/career-ops/activity-levels";
import {
  buildApplicationDateCounts,
  getApplicationDateActivityLevels,
  getCalendarMonthDays,
  isDateKeyInRange,
  normalizeDashboardDateRange,
  type DashboardPeriod,
} from "~/lib/career-ops/dashboard-period";
import { dateKeyToDate } from "~/lib/career-ops/dates";
import { getWeekdayLabels } from "~/lib/i18n/date-format";
import { useLocale } from "~/lib/i18n/locale-context";
import { cn } from "~/lib/utils";
import type { ApplicationEntry } from "~/lib/career-ops/types";

type DashboardPeriodCalendarProps = {
  applications: ApplicationEntry[];
  period: DashboardPeriod;
  onPeriodChange: (period: DashboardPeriod) => void;
};

export function DashboardPeriodCalendar({
  applications,
  period,
  onPeriodChange,
}: DashboardPeriodCalendarProps) {
  const locale = useLocale();
  const today = useMemo(() => new Date(), []);
  const [visibleMonth, setVisibleMonth] = useState(() => ({
    year: today.getFullYear(),
    month: today.getMonth(),
  }));
  const [rangeAnchor, setRangeAnchor] = useState<string | null>(null);

  useEffect(() => {
    if (period.kind !== "range") {
      setRangeAnchor(null);
    }
  }, [period]);

  const activityCounts = useMemo(
    () => buildApplicationDateCounts(applications),
    [applications],
  );
  const activityLevels = useMemo(
    () => getApplicationDateActivityLevels(applications),
    [applications],
  );
  const monthDays = useMemo(
    () => getCalendarMonthDays(visibleMonth.year, visibleMonth.month),
    [visibleMonth.month, visibleMonth.year],
  );
  const weekdayLabels = getWeekdayLabels(locale);

  const selectedRange =
    period.kind === "range"
      ? normalizeDashboardDateRange(period.start, period.end)
      : null;
  const pendingRangeStart = rangeAnchor ?? selectedRange?.start ?? null;
  const pendingRangeEnd =
    rangeAnchor != null ? null : (selectedRange?.end ?? null);

  const monthLabel = new Date(
    visibleMonth.year,
    visibleMonth.month,
    1,
  ).toLocaleDateString(locale, {
    month: "long",
    year: "numeric",
  });

  const shiftMonth = (delta: number) => {
    setVisibleMonth((current) => {
      const next = new Date(current.year, current.month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  };

  const handleDayClick = (dateKey: string) => {
    if (!rangeAnchor) {
      setRangeAnchor(dateKey);
      onPeriodChange({ kind: "range", start: dateKey, end: dateKey });
      return;
    }

    const range = normalizeDashboardDateRange(rangeAnchor, dateKey);
    setRangeAnchor(null);
    onPeriodChange({ kind: "range", ...range });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-white/80">Calendar range</Label>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="brandSecondary"
            size="pillSm"
            aria-label="Previous month"
            onClick={() => shiftMonth(-1)}
          >
            ‹
          </Button>
          <span className="min-w-[8rem] text-center text-sm text-white/80">
            {monthLabel}
          </span>
          <Button
            type="button"
            variant="brandSecondary"
            size="pillSm"
            aria-label="Next month"
            onClick={() => shiftMonth(1)}
          >
            ›
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-white/40">
        {weekdayLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {monthDays.map((day) => {
          const count = activityCounts.get(day.dateKey) ?? 0;
          const level = activityLevels.get(day.dateKey) ?? 0;
          const isSelectedStart =
            pendingRangeStart === day.dateKey ||
            selectedRange?.start === day.dateKey;
          const isSelectedEnd =
            pendingRangeEnd === day.dateKey ||
            selectedRange?.end === day.dateKey;
          const inSelectedRange = isDateKeyInRange(
            day.dateKey,
            pendingRangeStart,
            pendingRangeEnd ?? pendingRangeStart,
          );
          const dayNumber = dateKeyToDate(day.dateKey)?.getDate() ?? "";

          return (
            <button
              key={day.dateKey}
              type="button"
              aria-label={`${day.dateKey}${count > 0 ? `, ${count} applications` : ""}`}
              aria-pressed={inSelectedRange}
              onClick={() => handleDayClick(day.dateKey)}
              className={cn(
                "flex h-8 flex-col items-center justify-center rounded-md text-[11px] transition",
                ACTIVITY_LEVEL_CLASS_NAMES[level],
                day.inCurrentMonth ? "text-white/85" : "text-white/30",
                inSelectedRange &&
                  "ring-2 ring-violet-300/80 ring-offset-1 ring-offset-[#0f1024]",
                (isSelectedStart || isSelectedEnd) &&
                  "font-semibold text-white",
              )}
            >
              {dayNumber}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-white/45">
        <span>
          {selectedRange
            ? `${selectedRange.start} – ${selectedRange.end}`
            : rangeAnchor
              ? "Choose an end date"
              : "Choose a start date"}
        </span>
        <div className="flex items-center gap-2">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <span
              key={level}
              className={cn(
                "h-2.5 w-2.5 rounded-[3px]",
                ACTIVITY_LEVEL_CLASS_NAMES[level as 0 | 1 | 2 | 3 | 4],
              )}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
