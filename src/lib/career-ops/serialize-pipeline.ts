import {
  extractSectionLines,
  findSectionEnd,
  findSectionStart,
  PENDING_SECTION_HEADINGS,
  PROCESSED_SECTION_HEADINGS,
} from "~/lib/career-ops/pipeline-sections";
import {
  pendingSectionUsesChecklistRows,
  pendingSectionUsesFence,
} from "~/lib/career-ops/pipeline-line-url";
import { collectPipelineSectionUrls } from "~/lib/career-ops/pipeline-section-urls";

function normalizePipelineUrl(url: string): string {
  return url.trim();
}

export function parsePipelineSections(content: string): {
  pending: string[];
  processed: string[];
} {
  return {
    pending: collectPipelineSectionUrls(
      extractSectionLines(content, PENDING_SECTION_HEADINGS),
    ),
    processed: collectPipelineSectionUrls(
      extractSectionLines(content, PROCESSED_SECTION_HEADINGS),
    ),
  };
}

export function serializePipelineMarkdown(input: {
  pending: string[];
  processed: string[];
}): string {
  const pendingBody =
    input.pending.length > 0 ? `${input.pending.join("\n")}\n` : "\n";
  const processedBody =
    input.processed.length > 0 ? `${input.processed.join("\n")}\n` : "\n";

  return `# Pipeline

## Pending

${pendingBody}
## Processed

${processedBody}`;
}

export function appendPendingPipelineUrl(
  content: string | null,
  url: string,
): string {
  const normalizedUrl = normalizePipelineUrl(url);
  const existingContent =
    content ??
    `# Pipeline

## Pending

## Processed

`;
  const sections = parsePipelineSections(existingContent);

  if (sections.pending.includes(normalizedUrl)) {
    return existingContent;
  }

  const newline = existingContent.includes("\r\n") ? "\r\n" : "\n";
  const lines = existingContent.split(/\r?\n/);
  const pendingStart = findSectionStart(lines, PENDING_SECTION_HEADINGS);

  if (pendingStart === -1) {
    const separator = existingContent.endsWith(newline)
      ? newline
      : `${newline}${newline}`;
    return `${existingContent}${separator}## Pending${newline}${newline}${normalizedUrl}${newline}`;
  }

  const pendingEnd = findSectionEnd(lines, pendingStart);
  const pendingSectionText = lines
    .slice(pendingStart + 1, pendingEnd)
    .join(newline);

  let newLine = normalizedUrl;
  if (pendingSectionUsesChecklistRows(pendingSectionText)) {
    newLine = `- [ ] ${normalizedUrl}`;
  } else if (pendingSectionUsesFence(pendingSectionText)) {
    const sectionLines = lines.slice(pendingStart + 1, pendingEnd);
    const openFenceIndex = sectionLines.findIndex(
      (line) => line.trim() === "```",
    );
    const closeFenceIndex = sectionLines.findIndex(
      (line, index) => index > openFenceIndex && line.trim() === "```",
    );

    if (openFenceIndex >= 0 && closeFenceIndex >= 0) {
      lines.splice(pendingStart + 1 + closeFenceIndex, 0, normalizedUrl);
      return lines.join(newline);
    }
  }

  let insertIndex = pendingEnd;

  while (
    insertIndex > pendingStart + 2 &&
    lines[insertIndex - 1]?.trim().length === 0
  ) {
    insertIndex -= 1;
  }

  lines.splice(insertIndex, 0, newLine);
  return lines.join(newline);
}
