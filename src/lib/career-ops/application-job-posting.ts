import { extractMarkdownLink } from "~/lib/career-ops/links";
import type { ApplicationEntry } from "~/lib/career-ops/types";

const HTTP_URL_PATTERN = /^https?:\/\//i;

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

  return extractHttpUrl(application.notes);
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
