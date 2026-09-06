"use client";

import { useState } from "react";

import { ActivityHeatmapPanel } from "~/app/_components/activity-heatmap";
import { AnalyticsChartsPanel } from "~/app/_components/analytics-charts-panel";
import { DashboardSection } from "~/app/_components/dashboard-section-nav";
import { ErrorAlert } from "~/app/_components/error-alert";
import { OverviewStrip } from "~/app/_components/overview-strip";
import { PipelinePanel } from "~/app/_components/pipeline-panel";
import { RecentApplications } from "~/app/_components/recent-applications";
import { TrackerPanel } from "~/app/_components/tracker-panel";
import { GlowPanel } from "~/components/ui/glow-panel";
import {
  useCareerOpsDataSource,
  useCareerOpsRawData,
} from "~/hooks/use-career-ops-data-source";
import { useHasMounted } from "~/hooks/use-has-mounted";
import { hasAnalyticsChartData } from "~/lib/career-ops/chart-data";
import type { CareerOpsDataSource } from "~/lib/career-ops/data-source";
import { getDataSourceLabel } from "~/lib/career-ops/data-source";
import { DASHBOARD_SECTION_IDS } from "~/lib/dashboard/sections";
import { useParsedRepoData } from "~/lib/career-ops/use-parsed-repo-data";

export function RepoDataView() {
  const hasMounted = useHasMounted();
  const { activeSource, localRefreshToken, hasLocalSource, hasGitHubSource } =
    useCareerOpsDataSource();

  if (!hasMounted) {
    return (
      <GlowPanel className="w-full max-w-screen-2xl min-w-0">
        <p className="text-sm text-white/70">Loading dashboard…</p>
      </GlowPanel>
    );
  }

  if (!activeSource) {
    return (
      <GlowPanel
        className="w-full max-w-screen-2xl min-w-0 text-center"
        variant="dashed"
      >
        <p className="text-white/70">
          {hasLocalSource || hasGitHubSource
            ? "Choose an active data source above to load tracker and pipeline data."
            : "Open a local career-ops project or connect a companion repository to load tracker and pipeline data."}
        </p>
      </GlowPanel>
    );
  }

  return (
    <RepoDataContent
      activeSource={activeSource}
      localRefreshToken={localRefreshToken}
    />
  );
}

function RepoDataContent({
  activeSource,
  localRefreshToken,
}: {
  activeSource: CareerOpsDataSource;
  localRefreshToken?: string;
}) {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const { raw, error, isLoading } = useCareerOpsRawData(
    activeSource,
    localRefreshToken,
  );
  const { parsed, isParsing, parseError } = useParsedRepoData(raw);

  if (isLoading && !raw) {
    return (
      <GlowPanel className="w-full max-w-screen-2xl min-w-0">
        <p className="text-sm text-white/70">Loading repository data…</p>
      </GlowPanel>
    );
  }

  if (error) {
    return (
      <GlowPanel className="w-full max-w-screen-2xl min-w-0">
        <ErrorAlert
          title="Could not load repository data"
          message={error.message}
        />
      </GlowPanel>
    );
  }

  if (parseError) {
    return (
      <GlowPanel className="w-full max-w-screen-2xl min-w-0">
        <ErrorAlert
          title="Could not parse repository data"
          message={parseError}
        />
      </GlowPanel>
    );
  }

  if (!raw || !parsed) {
    return (
      <GlowPanel className="w-full max-w-screen-2xl min-w-0">
        <p className="text-sm text-white/70">
          {isParsing
            ? "Parsing repository data…"
            : "No repository data available."}
        </p>
      </GlowPanel>
    );
  }

  const sourceLabel = getDataSourceLabel(activeSource);

  return (
    <section className="flex w-full max-w-screen-2xl min-w-0 flex-col gap-6">
      <DashboardSection
        id={DASHBOARD_SECTION_IDS.overview}
        label="Overview"
        order={10}
      >
        <OverviewStrip
          repoFullName={sourceLabel}
          analytics={parsed.analytics}
          pipeline={parsed.pipeline}
          reportsCount={raw.reportsCount}
          activeStatusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />
      </DashboardSection>

      {hasAnalyticsChartData(
        parsed.applications,
        parsed.analytics.statusCounts,
      ) ? (
        <DashboardSection
          id={DASHBOARD_SECTION_IDS.analytics}
          label="Analytics"
          order={20}
        >
          <AnalyticsChartsPanel
            applications={parsed.applications}
            statusCounts={parsed.analytics.statusCounts}
            activeStatusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
        </DashboardSection>
      ) : null}

      <DashboardSection
        id={DASHBOARD_SECTION_IDS.activity}
        label="Activity"
        order={30}
      >
        <ActivityHeatmapPanel applications={parsed.applications} />
      </DashboardSection>

      {parsed.analytics.recentApplications.length > 0 ? (
        <DashboardSection
          id={DASHBOARD_SECTION_IDS.recent}
          label="Recent"
          order={40}
        >
          <RecentApplications
            applications={parsed.analytics.recentApplications}
          />
        </DashboardSection>
      ) : null}

      {parsed.pipeline ? (
        <DashboardSection
          id={DASHBOARD_SECTION_IDS.pipeline}
          label="Pipeline"
          order={50}
        >
          <PipelinePanel pipeline={parsed.pipeline} />
        </DashboardSection>
      ) : null}

      <DashboardSection
        id={DASHBOARD_SECTION_IDS.tracker}
        label="Tracker"
        order={60}
      >
        <TrackerPanel
          dataSource={activeSource}
          applications={parsed.applications}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />
      </DashboardSection>

      {raw.dataFiles.length > 0 ? (
        <DashboardSection
          id={DASHBOARD_SECTION_IDS.dataFiles}
          label="Data files"
          order={70}
        >
          <GlowPanel accent={DASHBOARD_SECTION_IDS.dataFiles}>
            <details>
              <summary className="cursor-pointer text-sm font-medium text-white/80">
                Data files in `data/`
              </summary>
              <ul className="mt-3 flex flex-wrap gap-2">
                {raw.dataFiles.map((file) => (
                  <li
                    key={file.path}
                    className="rounded-full bg-black/30 px-3 py-1 text-xs text-white/80"
                  >
                    {file.name}
                    {file.type === "dir" ? "/" : ""}
                  </li>
                ))}
              </ul>
            </details>
          </GlowPanel>
        </DashboardSection>
      ) : null}
    </section>
  );
}
