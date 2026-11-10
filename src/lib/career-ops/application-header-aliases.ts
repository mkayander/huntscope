import type { ApplicationColumnKey } from "~/lib/career-ops/parse-applications-types";

/** Mirrors career-ops-ui `HEADER_ALIASES` (localized / variant tracker columns). */
export const APPLICATION_HEADER_ALIASES: Record<string, ApplicationColumnKey> =
  {
    "#": "num",
    num: "num",
    date: "date",
    company: "company",
    via: "via",
    role: "role",
    location: "location",
    score: "score",
    status: "status",
    pdf: "pdf",
    report: "report",
    notes: "notes",
    url: "url",
    empresa: "company",
    puesto: "role",
    estado: "status",
    fecha: "date",
    enlace: "url",
    position: "role",
    stage: "status",
    link: "url",
  };

export function normalizeApplicationHeaderLabel(label: string): string {
  return label.replace(/^#/, "num").toLowerCase().trim();
}

export function resolveApplicationHeaderKey(
  label: string,
): ApplicationColumnKey | null {
  const normalized = normalizeApplicationHeaderLabel(label);
  return APPLICATION_HEADER_ALIASES[normalized] ?? null;
}
