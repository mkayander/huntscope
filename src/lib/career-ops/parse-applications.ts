import type { ApplicationEntry } from "~/lib/career-ops/types";

export function parseApplicationsMarkdown(content: string): ApplicationEntry[] {
  const entries: ApplicationEntry[] = [];

  for (const line of content.split("\n")) {
    if (!line.startsWith("|")) {
      continue;
    }

    const parts = line.split("|").map((part) => part.trim());
    if (parts.length < 9) {
      continue;
    }

    const num = Number.parseInt(parts[1] ?? "", 10);
    if (Number.isNaN(num)) {
      continue;
    }

    entries.push({
      num,
      date: parts[2] ?? "",
      company: parts[3] ?? "",
      role: parts[4] ?? "",
      score: parts[5] ?? "",
      status: parts[6] ?? "",
      pdf: parts[7] ?? "",
      report: parts[8] ?? "",
      notes: parts[9] ?? "",
    });
  }

  return entries;
}
