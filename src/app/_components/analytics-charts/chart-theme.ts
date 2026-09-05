export const CHART_MARGIN = {
  top: 28,
  right: 20,
  bottom: 40,
  left: 44,
} as const;

export const STATUS_COLORS: Record<string, string> = {
  Evaluated: "#38bdf8",
  Applied: "#a78bfa",
  Responded: "#818cf8",
  Interview: "#fbbf24",
  Offer: "#34d399",
  Rejected: "#f87171",
  Discarded: "#a1a1aa",
  SKIP: "#71717a",
};

export const CHART_COLORS = {
  axis: "rgba(255,255,255,0.35)",
  grid: "rgba(255,255,255,0.08)",
  label: "rgba(255,255,255,0.55)",
  tooltipBg: "rgba(15,16,35,0.94)",
  tooltipBorder: "rgba(167,139,250,0.35)",
  violet: "#a78bfa",
  violetBright: "#c4b5fd",
  emerald: "#34d399",
  amber: "#fbbf24",
} as const;

export function getStatusColor(status: string): string {
  return STATUS_COLORS[status] ?? "#c4b5fd";
}
