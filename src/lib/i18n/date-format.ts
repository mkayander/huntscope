import { dateKeyToDate, parseApplicationDate } from "~/lib/career-ops/dates";

export type DateDisplayStyle = "medium" | "long";

export function formatDisplayDate(
  dateKey: string,
  locale?: string,
  style: DateDisplayStyle = "long",
): string {
  const date = dateKeyToDate(dateKey);
  if (!date) {
    return dateKey;
  }

  if (style === "medium") {
    return date.toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return date.toLocaleDateString(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatApplicationDate(
  value: string,
  locale?: string,
  style: DateDisplayStyle = "medium",
): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "—";
  }

  const dateKey = parseApplicationDate(trimmed);
  if (!dateKey) {
    return trimmed;
  }

  return formatDisplayDate(dateKey, locale, style);
}

export function formatMonthLabel(date: Date, locale?: string): string {
  return date.toLocaleDateString(locale, { month: "short" });
}

export function getWeekdayLabels(locale?: string): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
  const sunday = new Date(2024, 0, 7);

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(sunday);
    day.setDate(sunday.getDate() + index);
    return formatter.format(day);
  });
}
