export const STATUS_ORDER = [
  "Evaluated",
  "Applied",
  "Responded",
  "Interview",
  "Offer",
  "Rejected",
  "Discarded",
  "SKIP",
] as const;

export const TERMINAL_STATUSES = new Set<string>([
  "Rejected",
  "Discarded",
  "SKIP",
  "Offer",
]);

const STATUS_DATE_SUFFIX_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const KNOWN_STATUSES = new Set<string>(STATUS_ORDER);

function isKnownStatus(
  status: string,
): status is (typeof STATUS_ORDER)[number] {
  return KNOWN_STATUSES.has(status);
}

export function normalizeStatus(status: string): string {
  const trimmed = status.trim();
  if (!trimmed || isKnownStatus(trimmed)) {
    return trimmed;
  }

  const spaceIndex = trimmed.lastIndexOf(" ");
  if (spaceIndex <= 0) {
    return trimmed;
  }

  const suffix = trimmed.slice(spaceIndex + 1);
  if (!STATUS_DATE_SUFFIX_PATTERN.test(suffix)) {
    return trimmed;
  }

  const baseStatus = trimmed.slice(0, spaceIndex);
  return isKnownStatus(baseStatus) ? baseStatus : trimmed;
}

export function countApplicationsByStatus(
  applications: readonly { status: string }[],
): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const application of applications) {
    const status = normalizeStatus(application.status);
    counts[status] = (counts[status] ?? 0) + 1;
  }

  return counts;
}

export function sortStatuses(statusCounts: Record<string, number>): string[] {
  const known = STATUS_ORDER.filter(
    (status) => (statusCounts[status] ?? 0) > 0,
  );
  const unknown = Object.keys(statusCounts).filter(
    (status) => !STATUS_ORDER.includes(status as (typeof STATUS_ORDER)[number]),
  );

  unknown.sort((left, right) => left.localeCompare(right));
  return [...known, ...unknown];
}

/** Pipeline order for tracker board columns (early funnel → terminal outcomes). */
export function getBoardColumnOrder(
  statusCounts: Record<string, number>,
): string[] {
  return sortStatuses(statusCounts);
}

export function getStatusChipClassName(
  status: string,
  isActive: boolean,
): string {
  const base =
    "cursor-pointer rounded-full px-3 py-1 text-xs font-medium ring-1 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300";

  const palette: Record<string, string> = {
    Evaluated: "bg-sky-500/15 text-sky-100 ring-sky-400/30",
    Applied: "bg-violet-500/15 text-violet-100 ring-violet-400/30",
    Responded: "bg-indigo-500/15 text-indigo-100 ring-indigo-400/30",
    Interview: "bg-amber-500/15 text-amber-100 ring-amber-400/30",
    Offer: "bg-emerald-500/15 text-emerald-100 ring-emerald-400/30",
    Rejected: "bg-red-500/15 text-red-100 ring-red-400/30",
    Discarded: "bg-zinc-500/15 text-zinc-200 ring-zinc-400/30",
    SKIP: "bg-zinc-500/15 text-zinc-200 ring-zinc-400/30",
  };

  const colors = palette[status] ?? "bg-white/10 text-white/80 ring-white/15";
  const active = isActive ? "ring-2 ring-white/40" : "hover:ring-white/25";

  return `${base} ${colors} ${active}`;
}
