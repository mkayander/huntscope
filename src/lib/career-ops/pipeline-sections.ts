export const PENDING_SECTION_HEADINGS = [
  "## Pending",
  "## Pendientes",
  "## Offen",
  "## En attente",
] as const;

export const PROCESSED_SECTION_HEADINGS = [
  "## Processed",
  "## Procesadas",
  "## Verarbeitet",
  "## Traitées",
] as const;

export function findSectionStart(
  lines: readonly string[],
  headings: readonly string[],
): number {
  return lines.findIndex((line) =>
    headings.some(
      (heading) => line.trim().toLowerCase() === heading.toLowerCase(),
    ),
  );
}

export function findSectionEnd(
  lines: readonly string[],
  startIndex: number,
): number {
  for (let index = startIndex + 1; index < lines.length; index += 1) {
    if (lines[index]?.trimStart().startsWith("## ")) {
      return index;
    }
  }

  return lines.length;
}

export function extractSectionLines(
  content: string,
  headings: readonly string[],
): string[] {
  const lines = content.split(/\r?\n/);
  const startIndex = findSectionStart(lines, headings);

  if (startIndex === -1) {
    return [];
  }

  return lines.slice(startIndex + 1, findSectionEnd(lines, startIndex));
}
