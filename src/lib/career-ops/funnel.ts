import { parseApplicationDate } from "~/lib/career-ops/dates";
import { parseScore } from "~/lib/career-ops/score";
import {
  normalizeStatus,
  TERMINAL_STATUSES,
} from "~/lib/career-ops/status-meta";
import type { ApplicationEntry } from "~/lib/career-ops/types";

export type FunnelMetrics = {
  total: number;
  activeCount: number;
  terminalCount: number;
  interviewCount: number;
  offerCount: number;
  rejectedCount: number;
  responseRate: string;
  interviewRate: string;
  offerRate: string;
  rejectionByScoreBand: {
    high: number;
    medium: number;
    low: number;
    unknown: number;
  };
  averageScoreApplied: string;
  averageScoreInterview: string;
};

function formatRate(numerator: number, denominator: number): string {
  if (denominator <= 0) {
    return "—";
  }

  return `${Math.round((numerator / denominator) * 100)}%`;
}

function formatAverage(scores: number[]): string {
  if (scores.length === 0) {
    return "—";
  }

  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  return average.toFixed(1);
}

export function computeFunnelMetrics(
  applications: ApplicationEntry[],
): FunnelMetrics {
  let activeCount = 0;
  let interviewCount = 0;
  let offerCount = 0;
  let rejectedCount = 0;
  let respondedCount = 0;

  const appliedScores: number[] = [];
  const interviewScores: number[] = [];
  const rejectionBands = {
    high: 0,
    medium: 0,
    low: 0,
    unknown: 0,
  };

  for (const application of applications) {
    const status = normalizeStatus(application.status);
    const parsedScore = parseScore(application.score);

    if (!TERMINAL_STATUSES.has(status)) {
      activeCount += 1;
    }

    if (status === "Interview") {
      interviewCount += 1;
      if (parsedScore !== null) {
        interviewScores.push(parsedScore);
      }
    }

    if (status === "Offer") {
      offerCount += 1;
    }

    if (status === "Rejected" || status === "Discarded" || status === "SKIP") {
      rejectedCount += 1;
      if (parsedScore === null) {
        rejectionBands.unknown += 1;
      } else if (parsedScore >= 4) {
        rejectionBands.high += 1;
      } else if (parsedScore >= 3) {
        rejectionBands.medium += 1;
      } else {
        rejectionBands.low += 1;
      }
    }

    if (
      status === "Responded" ||
      status === "Interview" ||
      status === "Offer"
    ) {
      respondedCount += 1;
    }

    if (
      status === "Applied" ||
      status === "Responded" ||
      status === "Interview" ||
      status === "Offer"
    ) {
      if (parsedScore !== null) {
        appliedScores.push(parsedScore);
      }
    }
  }

  const total = applications.length;
  const nonEvaluatedOnly = applications.filter(
    (application) => normalizeStatus(application.status) !== "Evaluated",
  ).length;

  return {
    total,
    activeCount,
    terminalCount: total - activeCount,
    interviewCount,
    offerCount,
    rejectedCount,
    responseRate: formatRate(respondedCount, nonEvaluatedOnly),
    interviewRate: formatRate(interviewCount, nonEvaluatedOnly),
    offerRate: formatRate(offerCount, nonEvaluatedOnly),
    rejectionByScoreBand: rejectionBands,
    averageScoreApplied: formatAverage(appliedScores),
    averageScoreInterview: formatAverage(interviewScores),
  };
}

export function countDatedApplications(
  applications: ApplicationEntry[],
): number {
  return applications.filter((application) =>
    Boolean(parseApplicationDate(application.date)),
  ).length;
}
