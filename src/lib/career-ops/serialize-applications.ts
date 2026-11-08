import {
  escapeMarkdownTableCell,
  parseMarkdownTableCells,
  replaceMarkdownTableCell,
} from "~/lib/career-ops/markdown-table";
import { shouldShowViaColumn } from "~/lib/career-ops/parse-applications";
import type { ApplicationEntry } from "~/lib/career-ops/types";

const LEGACY_TABLE_HEADER = `# Applications

| # | Date | Company | Role | Score | Status | PDF | Report | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
`;

const CAREER_OPS_TABLE_HEADER = `# Applications

| # | Date | Company | Via | Role | Score | Status | PDF | Report | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
`;

function formatTableCell(value: string): string {
  const trimmed = value.trim();
  return trimmed.length > 0 ? escapeMarkdownTableCell(trimmed) : "—";
}

function shouldIncludeViaColumn(applications: ApplicationEntry[]): boolean {
  return shouldShowViaColumn(applications);
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
): string {
  const includeVia = shouldIncludeViaColumn(applications);
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

export function updateApplicationStatusInMarkdown(
  content: string,
  applicationNum: number,
  status: string,
): string {
  const newline = content.includes("\r\n") ? "\r\n" : "\n";
  const lines = content.split(/\r?\n/);
  let numberColumnIndex = -1;
  let statusColumnIndex = -1;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    if (!line) {
      continue;
    }

    const cells = parseMarkdownTableCells(line);

    if (!cells) {
      continue;
    }

    if (numberColumnIndex === -1 || statusColumnIndex === -1) {
      numberColumnIndex = cells.findIndex((cell) => cell === "#");
      statusColumnIndex = cells.findIndex(
        (cell) => cell.toLowerCase() === "status",
      );
      continue;
    }

    const rowNumber = Number.parseInt(cells[numberColumnIndex] ?? "", 10);

    if (rowNumber !== applicationNum) {
      continue;
    }

    lines[index] = replaceMarkdownTableCell(line, statusColumnIndex, status);
    return lines.join(newline);
  }

  throw new Error(
    `Could not find application #${applicationNum} in the applications table.`,
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
