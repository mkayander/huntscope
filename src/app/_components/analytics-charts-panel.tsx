"use client";

import { useMemo } from "react";

import { ApplicationPaceChart } from "~/app/_components/analytics-charts/application-pace-chart";
import { ScoreHistogramChart } from "~/app/_components/analytics-charts/score-histogram-chart";
import { ScoreScatterChart } from "~/app/_components/analytics-charts/score-scatter-chart";
import { StatusRadialChart } from "~/app/_components/analytics-charts/status-radial-chart";
import { GlowPanel } from "~/components/ui/glow-panel";
import { DASHBOARD_SECTION_IDS } from "~/lib/dashboard/sections";
import {
  buildScoreHistogramData,
  buildScoreScatterData,
  buildStatusChartData,
  buildTimelineData,
} from "~/lib/career-ops/chart-data";
import type { ApplicationEntry } from "~/lib/career-ops/types";

type AnalyticsChartsPanelProps = {
  applications: ApplicationEntry[];
  statusCounts: Record<string, number>;
  activeStatusFilter: string | null;
  onStatusFilterChange: (status: string | null) => void;
};

export function AnalyticsChartsPanel({
  applications,
  statusCounts,
  activeStatusFilter,
  onStatusFilterChange,
}: AnalyticsChartsPanelProps) {
  const statusData = useMemo(() => buildStatusChartData(statusCounts), [statusCounts]);
  const scatterData = useMemo(() => buildScoreScatterData(applications), [applications]);
  const timelineData = useMemo(() => buildTimelineData(applications), [applications]);
  const histogramData = useMemo(() => buildScoreHistogramData(applications), [applications]);

  const hasChartData =
    statusData.length > 0 ||
    scatterData.length > 0 ||
    timelineData.length > 0 ||
    histogramData.some((bin) => bin.count > 0);

  if (!hasChartData) {
    return null;
  }

  return (
    <GlowPanel accent={DASHBOARD_SECTION_IDS.analytics}>
      <div>
        <h3 className="text-lg font-semibold text-white">Analytics insights</h3>
        <p className="mt-1 text-sm text-white/60">
          Interactive D3 views of your search data — click chart elements to filter the tracker.
        </p>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <div className="xl:col-span-2">
          <ScoreScatterChart
            data={scatterData}
            activeStatusFilter={activeStatusFilter}
            onStatusFilterChange={onStatusFilterChange}
          />
        </div>

        <StatusRadialChart
          data={statusData}
          activeStatusFilter={activeStatusFilter}
          onStatusFilterChange={onStatusFilterChange}
        />

        <ApplicationPaceChart data={timelineData} />

        <div className="xl:col-span-2">
          <ScoreHistogramChart data={histogramData} />
        </div>
      </div>
    </GlowPanel>
  );
}
