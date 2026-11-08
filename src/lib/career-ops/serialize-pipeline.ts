import {
  extractSectionLines,
  findSectionEnd,
  findSectionStart,
  PENDING_SECTION_HEADINGS,
  PROCESSED_SECTION_HEADINGS,
} from "~/lib/career-ops/pipeline-sections";

function normalizePipelineUrl(url: string): string {
  return url.trim();
}

export function parsePipelineSections(content: string): {
  pending: string[];
  processed: string[];
} {
  const pending = extractSectionLines(content, PENDING_SECTION_HEADINGS)
    .map(normalizePipelineUrl)
    .filter((line) => line.length > 0);
  const processed = extractSectionLines(content, PROCESSED_SECTION_HEADINGS)
    .map(normalizePipelineUrl)
    .filter((line) => line.length > 0);

  return { pending, processed };
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
  let insertIndex = pendingEnd;

  while (
    insertIndex > pendingStart + 2 &&
    lines[insertIndex - 1]?.trim().length === 0
  ) {
    insertIndex -= 1;
  }

  lines.splice(insertIndex, 0, normalizedUrl);
  return lines.join(newline);
}
