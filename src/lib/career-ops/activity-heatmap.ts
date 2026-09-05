import { parseApplicationDate, toDateKey } from "~/lib/career-ops/dates";
import { formatMonthLabel } from "~/lib/i18n/date-format";

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

export type ActivityLevel = 0 | 1 | 2 | 3 | 4;

export type ActivityDay = {
  date: string;
  count: number;
  level: ActivityLevel;
};

export type ActivityHeatmapPeriod = 12 | 26 | 52;

export type ActivityHeatmap = {
  weeks: (ActivityDay | null)[][];
  monthLabels: { label: string; weekIndex: number }[];
  totalActivities: number;
  activeDays: number;
  maxCount: number;
  periodWeeks: ActivityHeatmapPeriod;
  startDate: string;
  endDate: string;
  datedApplications: number;
  undatedApplications: number;
};

function countToLevel(count: number, maxCount: number): ActivityLevel {
  if (count <= 0) {
    return 0;
  }

  if (maxCount <= 1) {
    return 1;
  }

  const ratio = count / maxCount;
  if (ratio <= 0.25) {
    return 1;
  }

  if (ratio <= 0.5) {
    return 2;
  }

  if (ratio <= 0.75) {
    return 3;
  }

  return 4;
}

export function computeActivityHeatmap(
  dateKeys: string[],
  periodWeeks: ActivityHeatmapPeriod,
  endDate = new Date(),
  locale?: string,
): ActivityHeatmap {
  const countsByDate = new Map<string, number>();

  for (const dateKey of dateKeys) {
    countsByDate.set(dateKey, (countsByDate.get(dateKey) ?? 0) + 1);
  }

  const end = startOfDay(endDate);
  const currentWeekSunday = getSundayWeekStart(end);
  const alignedStart = addDays(currentWeekSunday, -(periodWeeks - 1) * 7);

  const weeks: (ActivityDay | null)[][] = [];
  const monthLabels: { label: string; weekIndex: number }[] = [];
  let lastMonth = "";
  let totalActivities = 0;
  let activeDays = 0;
  let maxCount = 0;

  for (let weekIndex = 0; weekIndex < periodWeeks; weekIndex += 1) {
    const weekStart = addDays(alignedStart, weekIndex * 7);
    const week: (ActivityDay | null)[] = [];
    const monthLabel = formatMonthLabel(weekStart, locale);

    if (monthLabel !== lastMonth) {
      monthLabels.push({ label: monthLabel, weekIndex });
      lastMonth = monthLabel;
    }

    for (let dayOffset = 0; dayOffset < 7; dayOffset += 1) {
      const day = addDays(weekStart, dayOffset);
      if (day > end) {
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
    periodWeeks,
    startDate: toDateKey(alignedStart),
    endDate: toDateKey(end),
    datedApplications: dateKeys.length,
    undatedApplications: 0,
  };
}

export function buildHeatmapFromApplications(
  applications: { date: string }[],
  periodWeeks: ActivityHeatmapPeriod,
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

  const heatmap = computeActivityHeatmap(parsedDates, periodWeeks, new Date(), locale);
  return {
    ...heatmap,
    undatedApplications,
  };
}
