import type { ApplicationAnalytics } from "~/lib/career-ops/analytics";
import type { PipelineSummary } from "~/lib/career-ops/types";
import {
  getStatusChipClassName,
  sortStatuses,
} from "~/lib/career-ops/status-meta";
import { Button } from "~/components/ui/button";
import { glassCardSurfaceClassName } from "~/components/ui/glass-surface";
import { GlowPanel } from "~/components/ui/glow-panel";
import { DASHBOARD_SECTION_IDS } from "~/lib/dashboard/sections";
import { cn } from "~/lib/utils";

type OverviewStripProps = {
  repoFullName: string;
  analytics: ApplicationAnalytics;
  pipeline: PipelineSummary | null;
  reportsCount: number;
  activeStatusFilter: string | null;
  onStatusFilterChange: (status: string | null) => void;
};

export function OverviewStrip({
  repoFullName,
  analytics,
  pipeline,
  reportsCount,
  activeStatusFilter,
  onStatusFilterChange,
}: OverviewStripProps) {
  const statuses = sortStatuses(analytics.statusCounts);

  return (
    <GlowPanel accent={DASHBOARD_SECTION_IDS.overview}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">{repoFullName}</h2>
          <p className="mt-1 text-sm text-white/60">
            Command-center snapshot — counts, funnel, and recent activity from
            your repo.
          </p>
        </div>
        <p className="text-xs tracking-wide text-white/40 uppercase">
          Read-only
        </p>
      </div>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Applications" value={String(analytics.total)} />
        <MetricCard label="Avg score" value={analytics.averageScore} />
        <MetricCard
          label="Active pipeline"
          value={String(analytics.activeCount)}
        />
        <MetricCard
          label="Top fit (≥ 4.0)"
          value={String(analytics.topFitCount)}
          hint={`${analytics.scoreBands.high} high · ${analytics.scoreBands.medium} medium · ${analytics.scoreBands.low} low`}
        />
      </dl>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className={cn(glassCardSurfaceClassName, "rounded-xl p-4")}>
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-white">Pipeline inbox</h3>
            <span className="text-xs text-white/50">
              {pipeline?.pendingCount ?? 0} pending ·{" "}
              {pipeline?.processedCount ?? 0} processed
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-white">
            {reportsCount}
          </p>
          <p className="text-xs text-white/50">
            evaluation reports in `reports/`
          </p>
        </div>

        <div className={cn(glassCardSurfaceClassName, "rounded-xl p-4")}>
          <h3 className="text-sm font-semibold text-white">Score bands</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <ScoreBandRow
              label="High fit ≥ 4.0"
              count={analytics.scoreBands.high}
              tone="high"
            />
            <ScoreBandRow
              label="Medium 3.0–3.9"
              count={analytics.scoreBands.medium}
              tone="medium"
            />
            <ScoreBandRow
              label="Low below 3.0"
              count={analytics.scoreBands.low}
              tone="low"
            />
          </ul>
        </div>
      </div>

      {statuses.length > 0 ? (
        <div className="mt-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-white/70">
              Status funnel
            </span>
            <Button
              type="button"
              variant="chip"
              className={getStatusChipClassName(
                "All",
                activeStatusFilter === null,
              )}
              onClick={() => onStatusFilterChange(null)}
            >
              All {analytics.total}
            </Button>
            {statuses.map((status) => (
              <Button
                key={status}
                type="button"
                variant="chip"
                className={getStatusChipClassName(
                  status,
                  activeStatusFilter === status,
                )}
                onClick={() =>
                  onStatusFilterChange(
                    activeStatusFilter === status ? null : status,
                  )
                }
              >
                {status} {analytics.statusCounts[status]}
              </Button>
            ))}
          </div>
        </div>
      ) : null}
    </GlowPanel>
  );
}

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className={cn(glassCardSurfaceClassName, "rounded-xl px-4 py-3")}>
      <dt className="text-xs tracking-wide text-white/50 uppercase">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold text-white">{value}</dd>
      {hint ? <p className="mt-1 text-xs text-white/45">{hint}</p> : null}
    </div>
  );
}

function ScoreBandRow({
  label,
  count,
  tone,
}: {
  label: string;
  count: number;
  tone: "high" | "medium" | "low";
}) {
  const barClassName =
    tone === "high"
      ? "bg-emerald-400"
      : tone === "medium"
        ? "bg-amber-400"
        : "bg-red-400";

  return (
    <li className="flex items-center justify-between gap-3 text-white/80">
      <span>{label}</span>
      <span className="inline-flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${barClassName}`} />
        <span className="font-medium text-white">{count}</span>
      </span>
    </li>
  );
}
