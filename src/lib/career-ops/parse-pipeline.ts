import type { PipelineSummary } from "~/lib/career-ops/types";
import {
  extractSectionLines,
  PENDING_SECTION_HEADINGS,
  PROCESSED_SECTION_HEADINGS,
} from "~/lib/career-ops/pipeline-sections";

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
