export type ScoreTone = "high" | "medium" | "low" | "unknown";

const HIGH_SCORE_THRESHOLD = 4;
const MEDIUM_SCORE_THRESHOLD = 3;

export function parseScore(value: string): number | null {
  const match = /(\d+(?:\.\d+)?)/.exec(value);
  if (!match?.[1]) {
    return null;
  }

  const parsed = Number.parseFloat(match[1]);
  return Number.isNaN(parsed) ? null : parsed;
}

export function getScoreTone(score: string): ScoreTone {
  const parsed = parseScore(score);
  if (parsed === null) {
    return "unknown";
  }

  if (parsed >= HIGH_SCORE_THRESHOLD) {
    return "high";
  }

  if (parsed >= MEDIUM_SCORE_THRESHOLD) {
    return "medium";
  }

  return "low";
}

export function formatAverageScore(scores: number[]): string {
  if (scores.length === 0) {
    return "—";
  }

  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  return average.toFixed(1);
}
