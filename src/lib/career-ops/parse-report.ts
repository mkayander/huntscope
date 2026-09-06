import { parseScore } from "~/lib/career-ops/score";

export type ParsedReportMeta = {
  title: string;
  score: string | null;
  numericScore: number | null;
  legitimacy: string | null;
  sourceUrl: string | null;
};

const TITLE_PATTERN = /^#\s+(.+)$/m;
const SCORE_PATTERN = /\*\*Score:\*\*\s*([^\n]+)|^Score:\s*([^\n]+)/im;
const LEGITIMACY_PATTERN =
  /\*\*Legitimacy:\*\*\s*([^\n]+)|^Legitimacy:\s*([^\n]+)/im;
const URL_PATTERN =
  /\*\*URL:\*\*\s*(https?:\/\/[^\s)]+)|\*\*Source:\*\*\s*(https?:\/\/[^\s)]+)/im;

export function parseReportMarkdown(content: string): ParsedReportMeta {
  const titleMatch = TITLE_PATTERN.exec(content);
  const scoreMatch = SCORE_PATTERN.exec(content);
  const legitimacyMatch = LEGITIMACY_PATTERN.exec(content);
  const urlMatch = URL_PATTERN.exec(content);

  const rawScore = (scoreMatch?.[1] ?? scoreMatch?.[2] ?? "").trim();
  const numericScore = rawScore ? parseScore(rawScore) : null;

  return {
    title: titleMatch?.[1]?.trim() ?? "Evaluation report",
    score: rawScore || null,
    numericScore,
    legitimacy:
      (legitimacyMatch?.[1] ?? legitimacyMatch?.[2] ?? "").trim() || null,
    sourceUrl: (urlMatch?.[1] ?? urlMatch?.[2] ?? "").trim() || null,
  };
}

export function sortReportFilesByName<T extends { name: string }>(
  files: T[],
): T[] {
  return [...files].sort((left, right) => right.name.localeCompare(left.name));
}
