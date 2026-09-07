import type { ApplicationEntry } from "~/lib/career-ops/types";
import { formatAverageScore, parseScore } from "~/lib/career-ops/score";
import {
  normalizeStatus,
  TERMINAL_STATUSES,
} from "~/lib/career-ops/status-meta";

export type ScoreBands = {
  high: number;
  medium: number;
  low: number;
  unknown: number;
};

export type ApplicationAnalytics = {
  total: number;
  averageScore: string;
  activeCount: number;
  topFitCount: number;
  statusCounts: Record<string, number>;
  scoreBands: ScoreBands;
  recentApplications: ApplicationEntry[];
};

export function computeApplicationAnalytics(
  applications: ApplicationEntry[],
): ApplicationAnalytics {
  const statusCounts: Record<string, number> = {};
  const scoreBands: ScoreBands = {
    high: 0,
    medium: 0,
    low: 0,
    unknown: 0,
  };
  const numericScores: number[] = [];
  let activeCount = 0;
  let topFitCount = 0;

  for (const application of applications) {
    const status = normalizeStatus(application.status);
    statusCounts[status] = (statusCounts[status] ?? 0) + 1;

    if (!TERMINAL_STATUSES.has(status)) {
      activeCount += 1;
    }

    const parsedScore = parseScore(application.score);
    if (parsedScore === null) {
      scoreBands.unknown += 1;
    } else {
      numericScores.push(parsedScore);
      if (parsedScore >= 4) {
        topFitCount += 1;
        scoreBands.high += 1;
      } else if (parsedScore >= 3) {
        scoreBands.medium += 1;
      } else {
        scoreBands.low += 1;
      }
    }
  }

  const recentApplications = [...applications]
    .sort((left, right) => right.num - left.num)
    .slice(0, 5);

  return {
    total: applications.length,
    averageScore: formatAverageScore(numericScores),
    activeCount,
    topFitCount,
    statusCounts,
    scoreBands,
    recentApplications,
  };
}

export function filterApplications(
  applications: ApplicationEntry[],
  options: {
    statusFilters?: string[];
    statusFilter?: string | null;
    searchQuery: string;
  },
): ApplicationEntry[] {
  const query = options.searchQuery.trim().toLowerCase();
  const statusFilters =
    options.statusFilters ??
    (options.statusFilter ? [options.statusFilter] : []);

  return applications.filter((application) => {
    if (
      statusFilters.length > 0 &&
      !statusFilters.includes(normalizeStatus(application.status))
    ) {
      return false;
    }

    if (!query) {
      return true;
    }

    const haystack = [
      application.company,
      application.role,
      application.status,
      application.notes,
      application.score,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
}

export function groupApplicationsByStatus(
  applications: ApplicationEntry[],
): Map<string, ApplicationEntry[]> {
  const groups = new Map<string, ApplicationEntry[]>();

  for (const application of applications) {
    const status = normalizeStatus(application.status) || "Unknown";
    const bucket = groups.get(status) ?? [];
    bucket.push(application);
    groups.set(status, bucket);
  }

  for (const [status, entries] of groups) {
    entries.sort((left, right) => right.num - left.num);
    groups.set(status, entries);
  }

  return groups;
}
