import { countToActivityLevel } from "~/lib/career-ops/activity-levels";
import type { ActivityHeatmapWindow } from "~/lib/career-ops/activity-heatmap";
import {
  dateKeyToDate,
  parseApplicationDate,
  toDateKey,
} from "~/lib/career-ops/dates";
import { formatDisplayDate } from "~/lib/i18n/date-format";
import type { ApplicationEntry } from "~/lib/career-ops/types";

export type DashboardPeriodWeeks = 12 | 26 | 52;

export type DashboardPeriod =
  | { kind: "all" }
  | { kind: "weeks"; weeks: DashboardPeriodWeeks }
  | { kind: "days"; days: number }
  | { kind: "range"; start: string; end: string };

export const DEFAULT_DASHBOARD_PERIOD: DashboardPeriod = { kind: "all" };

export type DashboardPeriodPreset = {
  period: DashboardPeriod;
  label: string;
};

export const DASHBOARD_PERIOD_PRESETS: DashboardPeriodPreset[] = [
  { period: { kind: "all" }, label: "All time" },
  { period: { kind: "days", days: 7 }, label: "7d" },
  { period: { kind: "days", days: 30 }, label: "30d" },
  { period: { kind: "weeks", weeks: 26 }, label: "6 mo" },
  { period: { kind: "weeks", weeks: 52 }, label: "1 yr" },
];

/** @deprecated Use DASHBOARD_PERIOD_PRESETS instead. */
export const DASHBOARD_PERIOD_WEEKS_OPTIONS: {
  weeks: DashboardPeriodWeeks;
  label: string;
}[] = [
  { weeks: 12, label: "12 weeks" },
  { weeks: 26, label: "6 months" },
  { weeks: 52, label: "1 year" },
];

/** @deprecated Use DASHBOARD_PERIOD_PRESETS instead. */
export const DASHBOARD_PERIOD_DAYS_QUICK_OPTIONS = [4, 7, 14, 30, 90] as const;

export function matchesDashboardPeriodPreset(
  period: DashboardPeriod,
): DashboardPeriodPreset | null {
  return (
    DASHBOARD_PERIOD_PRESETS.find((preset) =>
      isDashboardPeriodEqual(preset.period, period),
    ) ?? null
  );
}

export function isDashboardPeriodCustom(period: DashboardPeriod): boolean {
  if (period.kind === "all") {
    return false;
  }

  return matchesDashboardPeriodPreset(period) == null;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function normalizeDashboardPeriodDays(days: number): number {
  if (!Number.isFinite(days)) {
    return 1;
  }

  return Math.min(365, Math.max(1, Math.round(days)));
}

export function parseDashboardPeriodDaysInput(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  const rounded = Math.round(parsed);
  if (rounded < 1 || rounded > 365) {
    return null;
  }

  return rounded;
}

export function isDashboardPeriodEqual(
  left: DashboardPeriod,
  right: DashboardPeriod,
): boolean {
  if (left.kind !== right.kind) {
    return false;
  }

  switch (left.kind) {
    case "all":
      return true;
    case "weeks":
      return right.kind === "weeks" && left.weeks === right.weeks;
    case "days":
      return right.kind === "days" && left.days === right.days;
    case "range":
      return (
        right.kind === "range" &&
        left.start === right.start &&
        left.end === right.end
      );
    default:
      return false;
  }
}

export function getDashboardPeriodWeeksCutoff(
  weeks: DashboardPeriodWeeks,
  referenceDate = new Date(),
): string {
  const cutoff = startOfDay(referenceDate);
  cutoff.setDate(cutoff.getDate() - weeks * 7);
  return toDateKey(cutoff);
}

export function getDashboardPeriodStartKey(
  period: DashboardPeriod,
  referenceDate = new Date(),
): string | null {
  if (period.kind === "all") {
    return null;
  }

  if (period.kind === "weeks") {
    return getDashboardPeriodWeeksCutoff(period.weeks, referenceDate);
  }

  if (period.kind === "days") {
    const start = startOfDay(referenceDate);
    start.setDate(start.getDate() - (period.days - 1));
    return toDateKey(start);
  }

  return period.start;
}

export function getDashboardPeriodEndKey(
  period: DashboardPeriod,
  referenceDate = new Date(),
): string | null {
  if (period.kind === "all") {
    return null;
  }

  if (period.kind === "range") {
    return period.end;
  }

  return toDateKey(startOfDay(referenceDate));
}

export function matchesDashboardPeriod(
  application: ApplicationEntry,
  period: DashboardPeriod,
  referenceDate = new Date(),
): boolean {
  if (period.kind === "all") {
    return true;
  }

  const dateKey = parseApplicationDate(application.date);
  if (!dateKey) {
    return false;
  }

  const startKey = getDashboardPeriodStartKey(period, referenceDate);
  const endKey = getDashboardPeriodEndKey(period, referenceDate);

  if (startKey && dateKey < startKey) {
    return false;
  }

  if (endKey && dateKey > endKey) {
    return false;
  }

  return true;
}

export function isDashboardPeriodActive(period: DashboardPeriod): boolean {
  return period.kind !== "all";
}

export function getDashboardPeriodLabel(
  period: DashboardPeriod,
  locale?: string,
): string {
  switch (period.kind) {
    case "all":
      return "All time";
    case "weeks":
      return (
        DASHBOARD_PERIOD_WEEKS_OPTIONS.find(
          (option) => option.weeks === period.weeks,
        )?.label ?? `${period.weeks} weeks`
      );
    case "days":
      return period.days === 1 ? "Last day" : `Last ${period.days} days`;
    case "range":
      return `${formatDisplayDate(period.start, locale, "medium")} – ${formatDisplayDate(period.end, locale, "medium")}`;
  }
}

export function getActivityHeatmapWindow(
  period: DashboardPeriod,
  referenceDate = new Date(),
): ActivityHeatmapWindow {
  const endDateKey =
    getDashboardPeriodEndKey(period, referenceDate) ??
    toDateKey(startOfDay(referenceDate));

  if (period.kind === "all") {
    const endDate = startOfDay(referenceDate);
    const alignedStart = getSundayWeekStart(endDate);
    alignedStart.setDate(alignedStart.getDate() - (52 - 1) * 7);
    return {
      startDateKey: toDateKey(alignedStart),
      endDateKey,
    };
  }

  const startDateKey = getDashboardPeriodStartKey(period, referenceDate);
  if (!startDateKey) {
    return getActivityHeatmapWindow(DEFAULT_DASHBOARD_PERIOD, referenceDate);
  }

  const startDate = dateKeyToDate(startDateKey);
  if (!startDate) {
    return {
      startDateKey,
      endDateKey,
    };
  }

  return {
    startDateKey: toDateKey(getSundayWeekStart(startDate)),
    endDateKey,
  };
}

function getSundayWeekStart(date: Date): Date {
  const normalized = startOfDay(date);
  normalized.setDate(normalized.getDate() - normalized.getDay());
  return normalized;
}

/** @deprecated Use getActivityHeatmapWindow instead. */
export function getActivityHeatmapPeriodWeeks(
  period: DashboardPeriod,
): 12 | 26 | 52 {
  const window = getActivityHeatmapWindow(period);
  const dayCount = countInclusiveDays(window.startDateKey, window.endDateKey);

  if (dayCount <= 12 * 7) {
    return 12;
  }

  if (dayCount <= 26 * 7) {
    return 26;
  }

  return 52;
}

function countInclusiveDays(startKey: string, endKey: string): number {
  const start = dateKeyToDate(startKey);
  const end = dateKeyToDate(endKey);
  if (!start || !end) {
    return 52 * 7;
  }

  const diffMs = end.getTime() - start.getTime();
  return Math.max(1, Math.floor(diffMs / 86_400_000) + 1);
}

export function buildApplicationDateCounts(
  applications: readonly { date: string }[],
): Map<string, number> {
  const counts = new Map<string, number>();

  for (const application of applications) {
    const dateKey = parseApplicationDate(application.date);
    if (!dateKey) {
      continue;
    }

    counts.set(dateKey, (counts.get(dateKey) ?? 0) + 1);
  }

  return counts;
}

export function getApplicationDateActivityLevels(
  applications: readonly { date: string }[],
): Map<string, ReturnType<typeof countToActivityLevel>> {
  const counts = buildApplicationDateCounts(applications);
  const maxCount = Math.max(0, ...counts.values());
  const levels = new Map<string, ReturnType<typeof countToActivityLevel>>();

  for (const [dateKey, count] of counts) {
    levels.set(dateKey, countToActivityLevel(count, maxCount));
  }

  return levels;
}

export type CalendarMonthDay = {
  dateKey: string;
  inCurrentMonth: boolean;
};

export function getCalendarMonthDays(
  year: number,
  month: number,
): CalendarMonthDay[] {
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay();
  const gridStart = new Date(year, month, 1 - startOffset);
  const days: CalendarMonthDay[] = [];

  for (let index = 0; index < 42; index += 1) {
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + index);
    days.push({
      dateKey: toDateKey(day),
      inCurrentMonth: day.getMonth() === month,
    });
  }

  return days;
}

export function normalizeDashboardDateRange(
  start: string,
  end: string,
): { start: string; end: string } {
  return start <= end ? { start, end } : { start: end, end: start };
}

export function isDateKeyInRange(
  dateKey: string,
  start: string | null,
  end: string | null,
): boolean {
  if (start && dateKey < start) {
    return false;
  }

  if (end && dateKey > end) {
    return false;
  }

  return true;
}

/** @deprecated Use getDashboardPeriodWeeksCutoff instead. */
export function getDashboardPeriodCutoff(
  periodWeeks: DashboardPeriodWeeks,
  referenceDate = new Date(),
): string {
  return getDashboardPeriodWeeksCutoff(periodWeeks, referenceDate);
}
