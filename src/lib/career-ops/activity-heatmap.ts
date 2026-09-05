const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function parseApplicationDate(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (DATE_KEY_PATTERN.test(trimmed)) {
    return trimmed;
  }

  const slashMatch = /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/.exec(trimmed);
  if (slashMatch) {
    return `${slashMatch[1]}-${pad2(Number(slashMatch[2]))}-${pad2(Number(slashMatch[3]))}`;
  }

  const dottedMatch = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(trimmed);
  if (dottedMatch) {
    return `${dottedMatch[3]}-${pad2(Number(dottedMatch[2]))}-${pad2(Number(dottedMatch[1]))}`;
  }

  const parsed = Date.parse(trimmed);
  if (Number.isNaN(parsed)) {
    return null;
  }

  return toDateKey(new Date(parsed));
}

export function formatDisplayDate(dateKey: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
  if (!match) {
    return dateKey;
  }

  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

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
    const monthLabel = weekStart.toLocaleDateString(undefined, { month: "short" });

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

  const heatmap = computeActivityHeatmap(parsedDates, periodWeeks);
  return {
    ...heatmap,
    undatedApplications,
  };
}
