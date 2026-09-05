import { parseApplicationDate } from "~/lib/career-ops/dates";
import { parseScore } from "~/lib/career-ops/score";
import { normalizeStatus, sortStatuses } from "~/lib/career-ops/status-meta";
import type { ApplicationEntry } from "~/lib/career-ops/types";

export type StatusChartDatum = {
  status: string;
  count: number;
};

export type ScoreHistogramDatum = {
  binStart: number;
  binEnd: number;
  label: string;
  count: number;
};

export type TimelineDatum = {
  monthKey: string;
  label: string;
  count: number;
  cumulative: number;
};

export type ScoreScatterDatum = {
  id: number;
  company: string;
  role: string;
  status: string;
  score: number;
  date: Date;
  dateKey: string;
};

export function buildStatusChartData(
  statusCounts: Record<string, number>,
): StatusChartDatum[] {
  return sortStatuses(statusCounts).map((status) => ({
    status,
    count: statusCounts[status] ?? 0,
  }));
}

export function buildScoreHistogramData(
  applications: ApplicationEntry[],
): ScoreHistogramDatum[] {
  const bins = [
    { binStart: 0, binEnd: 2, label: "< 2" },
    { binStart: 2, binEnd: 3, label: "2 – 3" },
    { binStart: 3, binEnd: 4, label: "3 – 4" },
    { binStart: 4, binEnd: 5, label: "4 – 5" },
  ];

  const counts = new Map(bins.map((bin) => [bin.label, 0]));

  for (const application of applications) {
    const score = parseScore(application.score);
    if (score === null) {
      continue;
    }

    const bin =
      score < 2
        ? bins[0]!
        : score < 3
          ? bins[1]!
          : score < 4
            ? bins[2]!
            : bins[3]!;

    counts.set(bin.label, (counts.get(bin.label) ?? 0) + 1);
  }

  return bins.map((bin) => ({
    ...bin,
    count: counts.get(bin.label) ?? 0,
  }));
}

export function buildTimelineData(applications: ApplicationEntry[]): TimelineDatum[] {
  const countsByMonth = new Map<string, number>();

  for (const application of applications) {
    const dateKey = parseApplicationDate(application.date);
    if (!dateKey) {
      continue;
    }

    const monthKey = dateKey.slice(0, 7);
    countsByMonth.set(monthKey, (countsByMonth.get(monthKey) ?? 0) + 1);
  }

  const sortedMonths = [...countsByMonth.keys()].sort();
  let cumulative = 0;

  return sortedMonths.map((monthKey) => {
    const count = countsByMonth.get(monthKey) ?? 0;
    cumulative += count;

    const [year, month] = monthKey.split("-");
    const label = new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("en", {
      month: "short",
      year: "2-digit",
    });

    return {
      monthKey,
      label,
      count,
      cumulative,
    };
  });
}

export function buildScoreScatterData(applications: ApplicationEntry[]): ScoreScatterDatum[] {
  const points: ScoreScatterDatum[] = [];

  for (const application of applications) {
    const score = parseScore(application.score);
    const dateKey = parseApplicationDate(application.date);
    if (score === null || !dateKey) {
      continue;
    }

    const [yearText, monthText, dayText] = dateKey.split("-");
    const year = Number(yearText);
    const month = Number(monthText);
    const day = Number(dayText);
    if (!year || !month || !day) {
      continue;
    }

    points.push({
      id: application.num,
      company: application.company,
      role: application.role,
      status: normalizeStatus(application.status),
      score,
      date: new Date(year, month - 1, day),
      dateKey,
    });
  }

  return points.sort((left, right) => left.date.getTime() - right.date.getTime());
}

export function hasAnalyticsChartData(
  applications: ApplicationEntry[],
  statusCounts: Record<string, number>,
): boolean {
  const statusData = buildStatusChartData(statusCounts);
  const scatterData = buildScoreScatterData(applications);
  const timelineData = buildTimelineData(applications);
  const histogramData = buildScoreHistogramData(applications);

  return (
    statusData.length > 0 ||
    scatterData.length > 0 ||
    timelineData.length > 0 ||
    histogramData.some((bin) => bin.count > 0)
  );
}
