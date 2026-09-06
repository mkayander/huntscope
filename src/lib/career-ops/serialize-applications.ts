import type { ApplicationEntry } from "~/lib/career-ops/types";

const TABLE_HEADER = `# Applications

| # | Date | Company | Role | Score | Status | PDF | Report | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
`;

function escapeTableCell(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function formatTableCell(value: string): string {
  const trimmed = value.trim();
  return trimmed.length > 0 ? escapeTableCell(trimmed) : "—";
}

export function serializeApplicationsMarkdown(
  applications: ApplicationEntry[],
): string {
  const rows = applications
    .map((application) => {
      return `| ${application.num} | ${formatTableCell(application.date)} | ${formatTableCell(application.company)} | ${formatTableCell(application.role)} | ${formatTableCell(application.score)} | ${formatTableCell(application.status)} | ${formatTableCell(application.pdf)} | ${formatTableCell(application.report)} | ${formatTableCell(application.notes)} |`;
    })
    .join("\n");

  return `${TABLE_HEADER}${rows}\n`;
}

export function updateApplicationStatus(
  applications: ApplicationEntry[],
  applicationNum: number,
  status: string,
): ApplicationEntry[] {
  return applications.map((application) =>
    application.num === applicationNum
      ? { ...application, status }
      : application,
  );
}

export function updateApplicationNotes(
  applications: ApplicationEntry[],
  applicationNum: number,
  notes: string,
): ApplicationEntry[] {
  return applications.map((application) =>
    application.num === applicationNum
      ? { ...application, notes }
      : application,
  );
}
