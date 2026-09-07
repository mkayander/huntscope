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

function normalizePipelineUrl(url: string): string {
  return url.trim();
}

export function parsePipelineSections(content: string): {
  pending: string[];
  processed: string[];
} {
  const pending = extractSectionLines(content, "## Pending")
    .map(normalizePipelineUrl)
    .filter((line) => line.length > 0);
  const processed = extractSectionLines(content, "## Processed")
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
  const sections = parsePipelineSections(
    content ??
      `# Pipeline

## Pending

## Processed

`,
  );

  if (sections.pending.includes(normalizedUrl)) {
    return serializePipelineMarkdown(sections);
  }

  return serializePipelineMarkdown({
    pending: [...sections.pending, normalizedUrl],
    processed: sections.processed,
  });
}
