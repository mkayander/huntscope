"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "~/components/ui/button";
import {
  buildApplicationDateCounts,
  getApplicationDateActivityLevels,
  getCalendarMonthDays,
  isDateKeyInRange,
  normalizeDashboardDateRange,
  type DashboardPeriod,
} from "~/lib/career-ops/dashboard-period";
import { dateKeyToDate, toDateKey } from "~/lib/career-ops/dates";
import { getWeekdayLabels } from "~/lib/i18n/date-format";
import { useLocale } from "~/lib/i18n/locale-context";
import { cn } from "~/lib/utils";
import type { ApplicationEntry } from "~/lib/career-ops/types";

const ACTIVITY_DOT_CLASS_NAMES = {
  0: "bg-transparent",
  1: "bg-violet-400/55",
  2: "bg-violet-400/75",
  3: "bg-violet-300/90",
  4: "bg-violet-200",
} as const;

type DashboardPeriodCalendarProps = {
  applications: ApplicationEntry[];
  period: DashboardPeriod;
  onPeriodChange: (period: DashboardPeriod) => void;
  onRangeComplete?: () => void;
  onDraftChange?: (isDrafting: boolean) => void;
};

export function DashboardPeriodCalendar({
  applications,
  period,
  onPeriodChange,
  onRangeComplete,
  onDraftChange,
}: DashboardPeriodCalendarProps) {
  const locale = useLocale();
  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => toDateKey(today), [today]);
  const [visibleMonth, setVisibleMonth] = useState(() => ({
    year: today.getFullYear(),
    month: today.getMonth(),
  }));
  const [rangeAnchor, setRangeAnchor] = useState<string | null>(null);

  const committedRange =
    period.kind === "range"
      ? normalizeDashboardDateRange(period.start, period.end)
      : null;

  useEffect(() => {
    setRangeAnchor(null);
    onDraftChange?.(false);

    if (period.kind !== "range") {
      return;
    }

    const startDate = dateKeyToDate(period.start);
    if (startDate) {
      setVisibleMonth({
        year: startDate.getFullYear(),
        month: startDate.getMonth(),
      });
    }
  }, [onDraftChange, period]);

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

  const selectionStart = rangeAnchor ?? committedRange?.start ?? null;
  const selectionEnd =
    rangeAnchor != null ? rangeAnchor : (committedRange?.end ?? null);

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
      onDraftChange?.(true);
      return;
    }

    const range = normalizeDashboardDateRange(rangeAnchor, dateKey);
    setRangeAnchor(null);
    onDraftChange?.(false);
    onPeriodChange({ kind: "range", ...range });
    onRangeComplete?.();
  };

  const rangeHint = rangeAnchor
    ? "Select end date"
    : committedRange
      ? `${committedRange.start} – ${committedRange.end}`
      : "Select start date";

  return (
    <div className="flex flex-col gap-2.5 p-3">
      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="brandSecondary"
          size="pillSm"
          className="size-7 px-0"
          aria-label="Previous month"
          onClick={() => shiftMonth(-1)}
        >
          <ChevronLeftIcon className="size-4" />
        </Button>
        <span className="text-sm font-medium text-white/85">{monthLabel}</span>
        <Button
          type="button"
          variant="brandSecondary"
          size="pillSm"
          className="size-7 px-0"
          aria-label="Next month"
          onClick={() => shiftMonth(1)}
        >
          <ChevronRightIcon className="size-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center text-[10px] font-medium tracking-wide text-white/35 uppercase">
        {weekdayLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {monthDays.map((day) => {
          const count = activityCounts.get(day.dateKey) ?? 0;
          const level = activityLevels.get(day.dateKey) ?? 0;
          const isToday = day.dateKey === todayKey;
          const isSelectedStart = selectionStart === day.dateKey;
          const isSelectedEnd = selectionEnd === day.dateKey;
          const inSelectedRange = isDateKeyInRange(
            day.dateKey,
            selectionStart,
            selectionEnd,
          );
          const isRangeEndpoint = isSelectedStart || isSelectedEnd;
          const dayNumber = dateKeyToDate(day.dateKey)?.getDate() ?? "";

          return (
            <button
              key={day.dateKey}
              type="button"
              aria-label={`${day.dateKey}${count > 0 ? `, ${count} applications` : ""}`}
              aria-pressed={inSelectedRange}
              onClick={() => handleDayClick(day.dateKey)}
              className={cn(
                "group relative mx-auto flex h-9 w-9 flex-col items-center justify-center rounded-lg text-[12px] transition",
                day.inCurrentMonth ? "text-white/90" : "text-white/25",
                inSelectedRange && !isRangeEndpoint && "bg-violet-500/18",
                isRangeEndpoint &&
                  "bg-violet-500 text-white shadow-sm shadow-violet-900/40",
                !inSelectedRange && "hover:bg-white/8 active:bg-white/10",
                isToday &&
                  !inSelectedRange &&
                  "ring-1 ring-white/20 ring-inset",
              )}
            >
              <span className={cn(isRangeEndpoint && "font-semibold")}>
                {dayNumber}
              </span>
              <span
                aria-hidden
                className={cn(
                  "absolute bottom-1.5 h-1 w-1 rounded-full transition-opacity",
                  ACTIVITY_DOT_CLASS_NAMES[level],
                  level === 0 && "opacity-0",
                  isRangeEndpoint && level > 0 && "bg-white/90",
                )}
              />
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 border-t border-white/8 pt-2.5 text-[11px] text-white/45">
        <span className="truncate">{rangeHint}</span>
        <div className="flex items-center gap-1.5">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <span
              key={level}
              className={cn(
                "h-2 w-2 rounded-full",
                level === 0
                  ? "bg-white/10 ring-1 ring-white/10"
                  : ACTIVITY_DOT_CLASS_NAMES[level as 0 | 1 | 2 | 3 | 4],
              )}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
