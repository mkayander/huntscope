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

const METADATA_LINE_PATTERN =
  /^\*\*(Score|Legitimacy|URL|Source):\*\*|^(Score|Legitimacy|URL|Source):/i;

/**
 * Removes the report title and top-level metadata block so the preview body
 * does not duplicate the summary card. Section-level lines like "Score: 4.5"
 * under headings are preserved.
 */
export function stripReportFrontmatter(content: string): string {
  const lines = content.split("\n");
  let index = 0;

  while (index < lines.length && lines[index]?.trim() === "") {
    index += 1;
  }

  if (index < lines.length && /^#\s+/.test(lines[index] ?? "")) {
    index += 1;
  }

  while (index < lines.length && lines[index]?.trim() === "") {
    index += 1;
  }

  while (index < lines.length) {
    const line = lines[index]?.trim() ?? "";

    if (line === "") {
      index += 1;
      continue;
    }

    if (/^##\s+/.test(line)) {
      break;
    }

    if (METADATA_LINE_PATTERN.test(line)) {
      index += 1;
      continue;
    }

    break;
  }

  while (index < lines.length && lines[index]?.trim() === "") {
    index += 1;
  }

  const body = lines.slice(index).join("\n").trim();
  return body.length > 0 ? body : content.trim();
}
