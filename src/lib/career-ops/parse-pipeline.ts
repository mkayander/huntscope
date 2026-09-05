import type { PipelineSummary } from "~/lib/career-ops/types";

function extractSectionLines(content: string, heading: string): string[] {
  const lines = content.split("\n");
  const startIndex = lines.findIndex(
    (line) => line.trim().toLowerCase() === heading.toLowerCase(),
  );

  if (startIndex === -1) {
    return [];
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
  const pendingLines = extractSectionLines(content, "## Pending");
  const processedLines = extractSectionLines(content, "## Processed");

  return {
    pendingCount: countMeaningfulLines(pendingLines),
    processedCount: countMeaningfulLines(processedLines),
    pendingPreview: extractPendingPreview(pendingLines),
  };
}
