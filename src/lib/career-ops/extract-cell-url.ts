import { extractMarkdownLink } from "~/lib/career-ops/links";

/** Posting URL from a tracker URL cell (markdown link or bare URL). */
export function extractCellUrl(cellValue: string): string {
  const value = cellValue.trim();
  if (!value) {
    return "";
  }

  const markdownLink = extractMarkdownLink(value);
  if (markdownLink && /^https?:\/\//i.test(markdownLink.href)) {
    return markdownLink.href;
  }

  if (/^https?:\/\//i.test(value)) {
    return value.split(/\s/)[0] ?? value;
  }

  return value;
}
