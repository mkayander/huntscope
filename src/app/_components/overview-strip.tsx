"use client";

import type { ApplicationAnalytics } from "~/lib/career-ops/analytics";
import type { DashboardFilters } from "~/lib/career-ops/dashboard-filters";
import type { PipelineSummary } from "~/lib/career-ops/types";
import {
  getStatusChipClassName,
  sortStatuses,
} from "~/lib/career-ops/status-meta";
import { toggleStatusFilter } from "~/lib/career-ops/status-filters";
import { useDashboardSections } from "~/app/_components/dashboard-section-nav";
import { Button } from "~/components/ui/button";
import { clickableCardClassName } from "~/components/ui/interaction";
import { glassCardSurfaceClassName } from "~/components/ui/glass-surface";
import { GlowPanel } from "~/components/ui/glow-panel";
import { DASHBOARD_SECTION_IDS } from "~/lib/dashboard/sections";
import { cn } from "~/lib/utils";

type OverviewStripProps = {
  repoFullName: string;
  analytics: ApplicationAnalytics;
  pipeline: PipelineSummary | null;
  reportsCount: number;
  canEditLocally: boolean;
  hasAnalyticsSection: boolean;
  hasPipelineSection: boolean;
  dashboardFilters: DashboardFilters;
  onDashboardFiltersChange: (filters: DashboardFilters) => void;
};

export function OverviewStrip({
  repoFullName,
  analytics,
  pipeline,
  reportsCount,
  canEditLocally,
  hasAnalyticsSection,
  hasPipelineSection,
  dashboardFilters,
  onDashboardFiltersChange,
}: OverviewStripProps) {
  const { scrollToSection } = useDashboardSections();
  const statuses = sortStatuses(analytics.statusCounts);

  const scrollTo = (sectionId: string) => {
    scrollToSection(sectionId);
  };

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
        <span
          className={cn(
            "inline-flex shrink-0 items-center self-start rounded-full px-2.5 py-1 text-xs font-medium tracking-wide uppercase",
            canEditLocally
              ? "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/30"
              : "bg-white/5 text-white/45 ring-1 ring-white/10",
          )}
        >
          {canEditLocally ? "Local editing" : "Read-only"}
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Applications"
          value={String(analytics.total)}
          onClick={() => scrollTo(DASHBOARD_SECTION_IDS.tracker)}
        />
        <MetricCard
          label="Avg score"
          value={analytics.averageScore}
          onClick={() =>
            scrollTo(
              hasAnalyticsSection
                ? DASHBOARD_SECTION_IDS.analytics
                : DASHBOARD_SECTION_IDS.funnel,
            )
          }
        />
        <MetricCard
          label="Active pipeline"
          value={String(analytics.activeCount)}
          onClick={() =>
            scrollTo(
              hasPipelineSection
                ? DASHBOARD_SECTION_IDS.pipeline
                : DASHBOARD_SECTION_IDS.funnel,
            )
          }
        />
        <MetricCard
          label="Top fit (≥ 4.0)"
          value={String(analytics.topFitCount)}
          hint={`${analytics.scoreBands.high} high · ${analytics.scoreBands.medium} medium · ${analytics.scoreBands.low} low`}
          onClick={() => scrollTo(DASHBOARD_SECTION_IDS.funnel)}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <button
          type="button"
          onClick={() => scrollTo(DASHBOARD_SECTION_IDS.tracker)}
          className={cn(
            glassCardSurfaceClassName,
            clickableCardClassName,
            "rounded-xl p-4 text-left",
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-white">
              Evaluation reports
            </h3>
            <span className="text-xs text-white/50">
              {pipeline?.pendingCount ?? 0} pending ·{" "}
              {pipeline?.processedCount ?? 0} processed
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-white">
            {reportsCount}
          </p>
          <p className="text-xs text-white/50">
            in `reports/` — open per job from Application tracker
          </p>
        </button>

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
                dashboardFilters.statusFilters.length === 0,
              )}
              onClick={() =>
                onDashboardFiltersChange({
                  ...dashboardFilters,
                  statusFilters: [],
                })
              }
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
                  dashboardFilters.statusFilters.includes(status),
                )}
                onClick={() =>
                  onDashboardFiltersChange({
                    ...dashboardFilters,
                    statusFilters: toggleStatusFilter(
                      dashboardFilters.statusFilters,
                      status,
                    ),
                  })
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
  onClick,
}: {
  label: string;
  value: string;
  hint?: string;
  onClick?: () => void;
}) {
  const content = (
    <>
      <p className="text-xs tracking-wide text-white/50 uppercase">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
      {hint ? <p className="mt-1 text-xs text-white/45">{hint}</p> : null}
    </>
  );

  if (!onClick) {
    return (
      <div className={cn(glassCardSurfaceClassName, "rounded-xl px-4 py-3")}>
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        glassCardSurfaceClassName,
        clickableCardClassName,
        "rounded-xl px-4 py-3 text-left",
      )}
    >
      {content}
    </button>
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
