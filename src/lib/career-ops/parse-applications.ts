import { resolveApplicationHeaderKey } from "~/lib/career-ops/application-header-aliases";
import { extractCellUrl } from "~/lib/career-ops/extract-cell-url";
import {
  parseMarkdownTableCells,
  unescapeMarkdownTableCell,
} from "~/lib/career-ops/markdown-table";
import type { ApplicationColumnKey } from "~/lib/career-ops/parse-applications-types";
import type { ApplicationEntry } from "~/lib/career-ops/types";

export type { ApplicationColumnKey } from "~/lib/career-ops/parse-applications-types";

const LEGACY_COLUMN_INDICES: Record<ApplicationColumnKey, number> = {
  num: 0,
  date: 1,
  company: 2,
  via: -1,
  role: 3,
  location: -1,
  score: 4,
  status: 5,
  pdf: 6,
  report: 7,
  notes: 8,
  url: -1,
};

function isTableSeparatorRow(cells: string[]): boolean {
  return cells.length > 0 && cells.every((cell) => /^:?-+:?$/.test(cell));
}

function parseHeaderColumns(
  parts: string[],
): Map<ApplicationColumnKey, number> | null {
  const columns = new Map<ApplicationColumnKey, number>();

  for (let index = 0; index < parts.length; index += 1) {
    const label = parts[index] ?? "";
    const key = resolveApplicationHeaderKey(label);

    if (key) {
      columns.set(key, index);
    }
  }

  if (!columns.has("num") || !columns.has("company") || !columns.has("role")) {
    return null;
  }

  return columns;
}

export function hasMeaningfulViaValue(via: string): boolean {
  const trimmed = via.trim();

  return trimmed.length > 0 && trimmed !== "—" && trimmed !== "-";
}

export function shouldShowViaColumn(
  applications: readonly ApplicationEntry[],
): boolean {
  return applications.some((application) =>
    hasMeaningfulViaValue(application.via),
  );
}

function getCell(
  parts: string[],
  columnMap: Map<ApplicationColumnKey, number> | null,
  key: ApplicationColumnKey,
): string {
  const index = columnMap?.get(key) ?? LEGACY_COLUMN_INDICES[key];

  if (index < 0) {
    return "";
  }

  return unescapeMarkdownTableCell(parts[index] ?? "");
}

function parseApplicationRow(
  parts: string[],
  columnMap: Map<ApplicationColumnKey, number> | null,
): ApplicationEntry | null {
  const num = Number.parseInt(getCell(parts, columnMap, "num"), 10);

  if (Number.isNaN(num)) {
    return null;
  }

  const urlCell = getCell(parts, columnMap, "url");

  return {
    num,
    date: getCell(parts, columnMap, "date"),
    company: getCell(parts, columnMap, "company"),
    via: getCell(parts, columnMap, "via"),
    role: getCell(parts, columnMap, "role"),
    location: getCell(parts, columnMap, "location"),
    score: getCell(parts, columnMap, "score"),
    status: getCell(parts, columnMap, "status"),
    pdf: getCell(parts, columnMap, "pdf"),
    report: getCell(parts, columnMap, "report"),
    notes: getCell(parts, columnMap, "notes"),
    url: urlCell ? extractCellUrl(urlCell) : "",
  };
}

export function parseApplicationsMarkdown(content: string): ApplicationEntry[] {
  const entries: ApplicationEntry[] = [];
  let columnMap: Map<ApplicationColumnKey, number> | null = null;

  for (const line of content.split("\n")) {
    if (!line.startsWith("|")) {
      continue;
    }

    const parts = parseMarkdownTableCells(line);

    if (!parts) {
      continue;
    }

    const cells = parts.map((cell) => unescapeMarkdownTableCell(cell));

    if (!columnMap) {
      const headerColumns = parseHeaderColumns(cells);

      if (headerColumns) {
        columnMap = headerColumns;
        continue;
      }
    }

    if (isTableSeparatorRow(cells)) {
      continue;
    }

    const entry = parseApplicationRow(cells, columnMap);

    if (entry) {
      entries.push(entry);
    }
  }

  return entries;
}
