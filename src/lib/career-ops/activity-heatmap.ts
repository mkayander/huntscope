import {
  countToActivityLevel,
  type ActivityLevel,
} from "~/lib/career-ops/activity-levels";
import {
  dateKeyToDate,
  parseApplicationDate,
  toDateKey,
} from "~/lib/career-ops/dates";
import { formatMonthLabel } from "~/lib/i18n/date-format";

export type { ActivityLevel } from "~/lib/career-ops/activity-levels";

/** @deprecated Prefer ActivityHeatmapWindow for exact dashboard period alignment. */
export type ActivityHeatmapPeriod = 12 | 26 | 52;

export type ActivityHeatmapWindow = {
  startDateKey: string;
  endDateKey: string;
};

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getSundayWeekStart(date: Date): Date {
  const normalized = startOfDay(date);
  normalized.setDate(normalized.getDate() - normalized.getDay());
  return normalized;
}

export type ActivityDay = {
  date: string;
  count: number;
  level: ActivityLevel;
};

export type ActivityHeatmap = {
  weeks: (ActivityDay | null)[][];
  monthLabels: { label: string; weekIndex: number }[];
  totalActivities: number;
  activeDays: number;
  maxCount: number;
  weekCount: number;
  startDate: string;
  endDate: string;
  datedApplications: number;
  undatedApplications: number;
};

function countToLevel(count: number, maxCount: number): ActivityLevel {
  return countToActivityLevel(count, maxCount);
}

export function computeActivityHeatmapForWindow(
  dateKeys: string[],
  window: ActivityHeatmapWindow,
  locale?: string,
): ActivityHeatmap {
  const startDate = dateKeyToDate(window.startDateKey);
  const endDate = dateKeyToDate(window.endDateKey);
  if (!startDate || !endDate) {
    return {
      weeks: [],
      monthLabels: [],
      totalActivities: 0,
      activeDays: 0,
      maxCount: 0,
      weekCount: 0,
      startDate: window.startDateKey,
      endDate: window.endDateKey,
      datedApplications: dateKeys.length,
      undatedApplications: 0,
    };
  }

  const countsByDate = new Map<string, number>();
  for (const dateKey of dateKeys) {
    if (dateKey < window.startDateKey || dateKey > window.endDateKey) {
      continue;
    }

    countsByDate.set(dateKey, (countsByDate.get(dateKey) ?? 0) + 1);
  }

  const alignedStart = getSundayWeekStart(startDate);
  const weeks: (ActivityDay | null)[][] = [];
  const monthLabels: { label: string; weekIndex: number }[] = [];
  let lastMonth = "";
  let totalActivities = 0;
  let activeDays = 0;
  let maxCount = 0;

  for (
    let weekStart = alignedStart, weekIndex = 0;
    weekStart <= endDate;
    weekStart = addDays(weekStart, 7), weekIndex += 1
  ) {
    const week: (ActivityDay | null)[] = [];
    const monthLabel = formatMonthLabel(weekStart, locale);

    if (monthLabel !== lastMonth) {
      monthLabels.push({ label: monthLabel, weekIndex });
      lastMonth = monthLabel;
    }

    for (let dayOffset = 0; dayOffset < 7; dayOffset += 1) {
      const day = addDays(weekStart, dayOffset);
      if (day > endDate) {
        week.push(null);
        continue;
      }

      const dateKey = toDateKey(day);
      const count = countsByDate.get(dateKey) ?? 0;
      maxCount = Math.max(maxCount, count);
      week.push({
        date: dateKey,
        count,
        level: 0,
      });
    }

    weeks.push(week);
  }

  for (const week of weeks) {
    for (const day of week) {
      if (!day) {
        continue;
      }

      day.level = countToLevel(day.count, maxCount);

      if (day.count > 0) {
        totalActivities += day.count;
        activeDays += 1;
      }
    }
  }

  return {
    weeks,
    monthLabels,
    totalActivities,
    activeDays,
    maxCount,
    weekCount: weeks.length,
    startDate: window.startDateKey,
    endDate: window.endDateKey,
    datedApplications: dateKeys.length,
    undatedApplications: 0,
  };
}

/** @deprecated Use computeActivityHeatmapForWindow instead. */
export function computeActivityHeatmap(
  dateKeys: string[],
  periodWeeks: ActivityHeatmapPeriod,
  endDate = new Date(),
  locale?: string,
): ActivityHeatmap {
  const end = startOfDay(endDate);
  const currentWeekSunday = getSundayWeekStart(end);
  const alignedStart = addDays(currentWeekSunday, -(periodWeeks - 1) * 7);

  return computeActivityHeatmapForWindow(
    dateKeys,
    {
      startDateKey: toDateKey(alignedStart),
      endDateKey: toDateKey(end),
    },
    locale,
  );
}

export function buildHeatmapFromApplications(
  applications: { date: string }[],
  window: ActivityHeatmapWindow,
  locale?: string,
): ActivityHeatmap {
  const parsedDates: string[] = [];
  let undatedApplications = 0;

  for (const application of applications) {
    const dateKey = parseApplicationDate(application.date);
    if (dateKey) {
      parsedDates.push(dateKey);
    } else {
      undatedApplications += 1;
    }
  }

  const heatmap = computeActivityHeatmapForWindow(parsedDates, window, locale);
  return {
    ...heatmap,
    undatedApplications,
  };
}
