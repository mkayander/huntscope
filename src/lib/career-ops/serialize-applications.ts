import type { ApplicationEntry } from "~/lib/career-ops/types";

const LEGACY_TABLE_HEADER = `# Applications

| # | Date | Company | Role | Score | Status | PDF | Report | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
`;

const CAREER_OPS_TABLE_HEADER = `# Applications

| # | Date | Company | Via | Role | Score | Status | PDF | Report | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
`;

function escapeTableCell(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function formatTableCell(value: string): string {
  const trimmed = value.trim();
  return trimmed.length > 0 ? escapeTableCell(trimmed) : "—";
}

function shouldIncludeViaColumn(
  applications: ApplicationEntry[],
  options?: { includeViaColumn?: boolean },
): boolean {
  if (options?.includeViaColumn !== undefined) {
    return options.includeViaColumn;
  }

  return applications.some((application) => application.via.length > 0);
}

function serializeApplicationRow(
  application: ApplicationEntry,
  includeVia: boolean,
): string {
  const cells = [
    String(application.num),
    formatTableCell(application.date),
    formatTableCell(application.company),
  ];

  if (includeVia) {
    cells.push(formatTableCell(application.via));
  }

  cells.push(
    formatTableCell(application.role),
    formatTableCell(application.score),
    formatTableCell(application.status),
    formatTableCell(application.pdf),
    formatTableCell(application.report),
    formatTableCell(application.notes),
  );

  return `| ${cells.join(" | ")} |`;
}

export function serializeApplicationsMarkdown(
  applications: ApplicationEntry[],
  options?: { includeViaColumn?: boolean },
): string {
  const includeVia = shouldIncludeViaColumn(applications, options);
  const header = includeVia ? CAREER_OPS_TABLE_HEADER : LEGACY_TABLE_HEADER;
  const rows = applications
    .map((application) => serializeApplicationRow(application, includeVia))
    .join("\n");

  return `${header}${rows}\n`;
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
