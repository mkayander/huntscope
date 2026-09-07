import { extractMarkdownLink } from "~/lib/career-ops/links";
import type { ApplicationEntry } from "~/lib/career-ops/types";

const HTTP_URL_PATTERN = /^https?:\/\//i;
const NOTES_MARKDOWN_LINK_PATTERN = /^\[([^\]]*)\]\(([^)]+)\)\s*$/;

export function isHttpUrl(value: string): boolean {
  return HTTP_URL_PATTERN.test(value.trim());
}

export function extractHttpUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "—" || trimmed === "-") {
    return null;
  }

  const markdownLink = extractMarkdownLink(trimmed);
  if (markdownLink && isHttpUrl(markdownLink.href)) {
    return markdownLink.href;
  }

  if (isHttpUrl(trimmed)) {
    return trimmed.split(/\s/)[0] ?? null;
  }

  const match = /https?:\/\/[^\s)]+/i.exec(trimmed);
  return match?.[0] ?? null;
}

function getJobPostingUrlFromNotes(notes: string): string | null {
  const trimmed = notes.trim();
  if (!trimmed || trimmed === "—" || trimmed === "-") {
    return null;
  }

  if (isHttpUrl(trimmed)) {
    return trimmed.split(/\s/)[0] ?? null;
  }

  const markdownMatch = NOTES_MARKDOWN_LINK_PATTERN.exec(trimmed);
  if (markdownMatch?.[2] && isHttpUrl(markdownMatch[2])) {
    return markdownMatch[2].trim();
  }

  return null;
}

export function getRoleDisplayLabel(role: string): string {
  const markdownLink = extractMarkdownLink(role);
  if (markdownLink?.label) {
    return markdownLink.label;
  }

  return role;
}

export function getInlineJobPostingUrl(
  application: ApplicationEntry,
): string | null {
  const roleLink = extractMarkdownLink(application.role);
  if (roleLink && isHttpUrl(roleLink.href)) {
    return roleLink.href;
  }

  return getJobPostingUrlFromNotes(application.notes);
}

export function resolveJobPostingUrl(
  application: ApplicationEntry,
  reportSourceUrl: string | null | undefined,
): string | null {
  const inlineUrl = getInlineJobPostingUrl(application);
  if (inlineUrl) {
    return inlineUrl;
  }

  if (reportSourceUrl && isHttpUrl(reportSourceUrl)) {
    return reportSourceUrl;
  }

  return null;
}
