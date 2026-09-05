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

export function normalizeStatus(status: string): string {
  return status.trim();
}

export function sortStatuses(statusCounts: Record<string, number>): string[] {
  const known = STATUS_ORDER.filter((status) => (statusCounts[status] ?? 0) > 0);
  const unknown = Object.keys(statusCounts).filter(
    (status) => !STATUS_ORDER.includes(status as (typeof STATUS_ORDER)[number]),
  );

  unknown.sort((left, right) => left.localeCompare(right));
  return [...known, ...unknown];
}

export function getStatusChipClassName(status: string, isActive: boolean): string {
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
