"use client";

import { useState } from "react";

import { ActivityHeatmapPanel } from "~/app/_components/activity-heatmap";
import { AnalyticsChartsPanel } from "~/app/_components/analytics-charts-panel";
import {
  DataFilesPanel,
  OutputFilesPanel,
} from "~/app/_components/data-files-panel";
import { DashboardSection } from "~/app/_components/dashboard-section-nav";
import { ErrorAlert } from "~/app/_components/error-alert";
import { FunnelPanel } from "~/app/_components/funnel-panel";
import { OverviewStrip } from "~/app/_components/overview-strip";
import { PipelinePanel } from "~/app/_components/pipeline-panel";
import { RecentApplications } from "~/app/_components/recent-applications";
import {
  LatestReportCard,
  ReportsPanel,
} from "~/app/_components/reports-panel";
import { TrackerPanel } from "~/app/_components/tracker-panel";
import { GlowPanel } from "~/components/ui/glow-panel";
import {
  useCareerOpsDataSource,
  useCareerOpsRawData,
} from "~/hooks/use-career-ops-data-source";
import { useHomeShell } from "~/hooks/use-home-shell";
import { useHasMounted } from "~/hooks/use-has-mounted";
import { hasAnalyticsChartData } from "~/lib/career-ops/chart-data";
import type { CareerOpsDataSource } from "~/lib/career-ops/data-source";
import { getDataSourceLabel } from "~/lib/career-ops/data-source";
import { DASHBOARD_SECTION_IDS } from "~/lib/dashboard/sections";
import { useParsedRepoData } from "~/lib/career-ops/use-parsed-repo-data";

export function RepoDataView() {
  const hasMounted = useHasMounted();
  const { showDashboard: initialShowDashboard } = useHomeShell();
  const { activeSource, hasLocalSource, hasGitHubSource } =
    useCareerOpsDataSource();

  if (!hasMounted && !initialShowDashboard) {
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

  return <RepoDataContent activeSource={activeSource} />;
}

function RepoDataContent({
  activeSource,
}: {
  activeSource: CareerOpsDataSource;
}) {
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const { raw, error, isLoading } = useCareerOpsRawData(activeSource);
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
          activeStatusFilters={statusFilters}
          onStatusFiltersChange={setStatusFilters}
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
            activeStatusFilters={statusFilters}
            onStatusFiltersChange={setStatusFilters}
          />
        </DashboardSection>
      ) : null}

      <DashboardSection
        id={DASHBOARD_SECTION_IDS.funnel}
        label="Funnel"
        order={25}
      >
        <FunnelPanel applications={parsed.applications} />
      </DashboardSection>

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

      <DashboardSection
        id={DASHBOARD_SECTION_IDS.reports}
        label="Reports"
        order={45}
      >
        <LatestReportCard
          dataSource={activeSource}
          defaultBranch={raw.defaultBranch}
          reportFiles={raw.reportFiles}
        />
        <div className="mt-6">
          <ReportsPanel reportFiles={raw.reportFiles} />
        </div>
      </DashboardSection>

      {parsed.pipeline ? (
        <DashboardSection
          id={DASHBOARD_SECTION_IDS.pipeline}
          label="Pipeline"
          order={50}
        >
          <PipelinePanel
            pipeline={parsed.pipeline}
            pipelineMarkdown={raw.pipelineMarkdown}
          />
        </DashboardSection>
      ) : null}

      <DashboardSection
        id={DASHBOARD_SECTION_IDS.tracker}
        label="Tracker"
        order={60}
      >
        <TrackerPanel
          dataSource={activeSource}
          defaultBranch={raw.defaultBranch}
          applications={parsed.applications}
          statusFilters={statusFilters}
          onStatusFiltersChange={setStatusFilters}
        />
      </DashboardSection>

      <DashboardSection
        id={DASHBOARD_SECTION_IDS.outputs}
        label="Outputs"
        order={65}
      >
        <OutputFilesPanel
          dataSource={activeSource}
          defaultBranch={raw.defaultBranch}
          outputFiles={raw.outputFiles}
        />
      </DashboardSection>

      {raw.dataFiles.length > 0 ? (
        <DashboardSection
          id={DASHBOARD_SECTION_IDS.dataFiles}
          label="Data files"
          order={70}
        >
          <DataFilesPanel dataFiles={raw.dataFiles} />
        </DashboardSection>
      ) : null}
    </section>
  );
}
