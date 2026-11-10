const UNCHECKED_PIPELINE_ROW = /^-\s+\[ \]\s+/;

/** URL token from a pending/processed line (plain URL, fence line, or checklist row). */
export function extractPipelineLineUrl(line: string): string | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("|")) {
    return null;
  }

  const withoutCheckbox = trimmed.replace(UNCHECKED_PIPELINE_ROW, "");
  const urlToken = (
    withoutCheckbox.split(/\s+\|\s+/)[0] ?? withoutCheckbox
  ).trim();

  if (
    urlToken.startsWith("http://") ||
    urlToken.startsWith("https://") ||
    urlToken.startsWith("local:")
  ) {
    return urlToken;
  }

  return null;
}

export function isChecklistPipelineContent(content: string): boolean {
  if (!content || content.includes("```")) {
    return false;
  }

  return (
    /^-\s+\[[ xX]\]\s+/m.test(content) ||
    /^## Pending\s*$/m.test(content) ||
    /^## Pendientes\s*$/m.test(content)
  );
}

export function pendingSectionUsesChecklistRows(
  pendingSectionText: string,
): boolean {
  return /^-\s+\[[ xX]\]\s+/m.test(pendingSectionText);
}

export function pendingSectionUsesFence(pendingSectionText: string): boolean {
  return pendingSectionText.includes("```");
}
