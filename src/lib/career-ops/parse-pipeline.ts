import type { PipelineSummary } from "~/lib/career-ops/types";

const PENDING_SECTION_HEADINGS = [
  "## Pending",
  "## Pendientes",
  "## Offen",
  "## En attente",
] as const;

const PROCESSED_SECTION_HEADINGS = [
  "## Processed",
  "## Procesadas",
  "## Verarbeitet",
  "## Traitées",
] as const;

function extractSectionLines(
  content: string,
  headings: readonly string[],
): string[] {
  const lines = content.split("\n");

  for (const heading of headings) {
    const startIndex = lines.findIndex(
      (line) => line.trim().toLowerCase() === heading.toLowerCase(),
    );

    if (startIndex === -1) {
      continue;
    }

    const sectionLines: string[] = [];
    for (let index = startIndex + 1; index < lines.length; index += 1) {
      const line = lines[index] ?? "";
      if (line.startsWith("## ")) {
        break;
      }
      sectionLines.push(line);
    }

    return sectionLines;
  }

  return [];
}

function countMeaningfulLines(lines: string[]): number {
  return lines.filter((line) => {
    const trimmed = line.trim();
    return trimmed.length > 0 && !trimmed.startsWith("|");
  }).length;
}

function extractPendingPreview(lines: string[]): string[] {
  return lines
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("|"))
    .slice(0, 5);
}

export function parsePipelineMarkdown(content: string): PipelineSummary {
  const pendingLines = extractSectionLines(content, PENDING_SECTION_HEADINGS);
  const processedLines = extractSectionLines(
    content,
    PROCESSED_SECTION_HEADINGS,
  );

  return {
    pendingCount: countMeaningfulLines(pendingLines),
    processedCount: countMeaningfulLines(processedLines),
    pendingPreview: extractPendingPreview(pendingLines),
  };
}
