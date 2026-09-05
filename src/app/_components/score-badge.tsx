import { getScoreTone } from "~/lib/career-ops/score";

const toneClassNames = {
  high: "bg-emerald-500/20 text-emerald-100 ring-emerald-400/30",
  medium: "bg-amber-500/20 text-amber-100 ring-amber-400/30",
  low: "bg-red-500/20 text-red-100 ring-red-400/30",
  unknown: "bg-white/10 text-white/70 ring-white/15",
} as const;

type ScoreBadgeProps = {
  score: string;
};

export function ScoreBadge({ score }: ScoreBadgeProps) {
  const tone = getScoreTone(score);

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${toneClassNames[tone]}`}
    >
      {score || "—"}
    </span>
  );
}
