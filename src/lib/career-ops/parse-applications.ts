import type { ApplicationEntry } from "~/lib/career-ops/types";

type ApplicationColumnKey =
  | "num"
  | "date"
  | "company"
  | "via"
  | "role"
  | "score"
  | "status"
  | "pdf"
  | "report"
  | "notes";

const COLUMN_ALIASES: Record<string, ApplicationColumnKey> = {
  "#": "num",
  date: "date",
  company: "company",
  via: "via",
  role: "role",
  score: "score",
  status: "status",
  pdf: "pdf",
  report: "report",
  notes: "notes",
};

const LEGACY_COLUMN_INDICES: Record<ApplicationColumnKey, number> = {
  num: 1,
  date: 2,
  company: 3,
  via: -1,
  role: 4,
  score: 5,
  status: 6,
  pdf: 7,
  report: 8,
  notes: 9,
};

function parseHeaderColumns(
  line: string,
): Map<ApplicationColumnKey, number> | null {
  const parts = line.split("|").map((part) => part.trim());
  const columns = new Map<ApplicationColumnKey, number>();

  for (let index = 1; index < parts.length; index += 1) {
    const label = parts[index]?.toLowerCase() ?? "";
    const key = COLUMN_ALIASES[label];

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

  return parts[index] ?? "";
}

function parseApplicationRow(
  parts: string[],
  columnMap: Map<ApplicationColumnKey, number> | null,
): ApplicationEntry | null {
  const num = Number.parseInt(getCell(parts, columnMap, "num"), 10);

  if (Number.isNaN(num)) {
    return null;
  }

  return {
    num,
    date: getCell(parts, columnMap, "date"),
    company: getCell(parts, columnMap, "company"),
    via: getCell(parts, columnMap, "via"),
    role: getCell(parts, columnMap, "role"),
    score: getCell(parts, columnMap, "score"),
    status: getCell(parts, columnMap, "status"),
    pdf: getCell(parts, columnMap, "pdf"),
    report: getCell(parts, columnMap, "report"),
    notes: getCell(parts, columnMap, "notes"),
  };
}

export function parseApplicationsMarkdown(content: string): ApplicationEntry[] {
  const entries: ApplicationEntry[] = [];
  let columnMap: Map<ApplicationColumnKey, number> | null = null;

  for (const line of content.split("\n")) {
    if (!line.startsWith("|")) {
      continue;
    }

    const parts = line.split("|").map((part) => part.trim());

    if (!columnMap) {
      const headerColumns = parseHeaderColumns(line);

      if (headerColumns) {
        columnMap = headerColumns;
        continue;
      }
    }

    const entry = parseApplicationRow(parts, columnMap);

    if (entry) {
      entries.push(entry);
    }
  }

  return entries;
}
