"use client";

import { GlowPanel } from "~/components/ui/glow-panel";
import { DASHBOARD_SECTION_IDS } from "~/lib/dashboard/sections";
import { computeFunnelMetrics } from "~/lib/career-ops/funnel";
import type { ApplicationEntry } from "~/lib/career-ops/types";
import { glassCardSurfaceClassName } from "~/components/ui/glass-surface";
import { cn } from "~/lib/utils";

type FunnelPanelProps = {
  applications: ApplicationEntry[];
};

export function FunnelPanel({ applications }: FunnelPanelProps) {
  const metrics = computeFunnelMetrics(applications);

  if (applications.length === 0) {
    return null;
  }

  return (
    <GlowPanel accent={DASHBOARD_SECTION_IDS.funnel}>
      <div>
        <h3 className="text-lg font-semibold text-white">Funnel & velocity</h3>
        <p className="mt-1 text-sm text-white/60">
          Conversion rates across your application pipeline.
        </p>
      </div>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Response rate" value={metrics.responseRate} />
        <MetricCard label="Interview rate" value={metrics.interviewRate} />
        <MetricCard label="Offer rate" value={metrics.offerRate} />
        <MetricCard
          label="Active pipeline"
          value={String(metrics.activeCount)}
        />
      </dl>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className={cn(glassCardSurfaceClassName, "rounded-xl p-4")}>
          <h4 className="text-sm font-semibold text-white">Stage counts</h4>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            <li className="flex justify-between gap-3">
              <span>Interviews</span>
              <span className="font-medium text-white">
                {metrics.interviewCount}
              </span>
            </li>
            <li className="flex justify-between gap-3">
              <span>Offers</span>
              <span className="font-medium text-white">
                {metrics.offerCount}
              </span>
            </li>
            <li className="flex justify-between gap-3">
              <span>Rejected / discarded</span>
              <span className="font-medium text-white">
                {metrics.rejectedCount}
              </span>
            </li>
            <li className="flex justify-between gap-3">
              <span>Terminal total</span>
              <span className="font-medium text-white">
                {metrics.terminalCount}
              </span>
            </li>
          </ul>
        </div>

        <div className={cn(glassCardSurfaceClassName, "rounded-xl p-4")}>
          <h4 className="text-sm font-semibold text-white">Score quality</h4>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            <li className="flex justify-between gap-3">
              <span>Avg score (applied+)</span>
              <span className="font-medium text-white">
                {metrics.averageScoreApplied}
              </span>
            </li>
            <li className="flex justify-between gap-3">
              <span>Avg score (interviews)</span>
              <span className="font-medium text-white">
                {metrics.averageScoreInterview}
              </span>
            </li>
            <li className="flex justify-between gap-3">
              <span>Rejections ≥ 4.0</span>
              <span className="font-medium text-white">
                {metrics.rejectionByScoreBand.high}
              </span>
            </li>
            <li className="flex justify-between gap-3">
              <span>Rejections 3.0–3.9</span>
              <span className="font-medium text-white">
                {metrics.rejectionByScoreBand.medium}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </GlowPanel>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className={cn(glassCardSurfaceClassName, "rounded-xl px-4 py-3")}>
      <dt className="text-xs tracking-wide text-white/50 uppercase">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold text-white">{value}</dd>
    </div>
  );
}
