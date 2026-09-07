"use client";

import { useMemo, useState } from "react";

import { ActivityHeatmapPanel } from "~/app/_components/activity-heatmap";
import { AnalyticsChartsPanel } from "~/app/_components/analytics-charts-panel";
import { DashboardFiltersBar } from "~/app/_components/dashboard-filters-bar";
import { DataFilesPanel } from "~/app/_components/data-files-panel";
import { OutputFilesPanel } from "~/app/_components/output-files-panel";
import { DashboardSection } from "~/app/_components/dashboard-section-nav";
import { ErrorAlert } from "~/app/_components/error-alert";
import { FunnelPanel } from "~/app/_components/funnel-panel";
import { OverviewStrip } from "~/app/_components/overview-strip";
import { PipelinePanel } from "~/app/_components/pipeline-panel";
import { RecentApplications } from "~/app/_components/recent-applications";
import { TrackerPanel } from "~/app/_components/tracker-panel";
import { GlowPanel } from "~/components/ui/glow-panel";
import {
  useCareerOpsDataSource,
  useCareerOpsRawData,
} from "~/hooks/use-career-ops-data-source";
import { useHomeShell } from "~/hooks/use-home-shell";
import { useHasMounted } from "~/hooks/use-has-mounted";
import { hasAnalyticsChartData } from "~/lib/career-ops/chart-data";
import { computeApplicationAnalytics } from "~/lib/career-ops/analytics";
import type { CareerOpsDataSource } from "~/lib/career-ops/data-source";
import { getDataSourceLabel } from "~/lib/career-ops/data-source";
import {
  DEFAULT_DASHBOARD_FILTERS,
  filterDashboardApplications,
  type DashboardFilters,
} from "~/lib/career-ops/dashboard-filters";
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
  const [dashboardFilters, setDashboardFilters] = useState<DashboardFilters>(
    DEFAULT_DASHBOARD_FILTERS,
  );
  const { raw, error, isLoading } = useCareerOpsRawData(activeSource);
  const { parsed, isParsing, parseError } = useParsedRepoData(raw);
  const filteredApplications = useMemo(
    () =>
      parsed
        ? filterDashboardApplications(parsed.applications, dashboardFilters)
        : [],
    [dashboardFilters, parsed],
  );
  const filteredAnalytics = useMemo(
    () => computeApplicationAnalytics(filteredApplications),
    [filteredApplications],
  );

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
  const canEditLocally =
    activeSource.kind === "local" &&
    activeSource.directoryHandle != null &&
    activeSource.fileHandle == null;
  const showAnalytics = hasAnalyticsChartData(
    filteredApplications,
    filteredAnalytics.statusCounts,
  );

  return (
    <section className="flex w-full max-w-screen-2xl min-w-0 flex-col gap-6">
      <DashboardSection
        id={DASHBOARD_SECTION_IDS.overview}
        label="Overview"
        order={10}
      >
        <OverviewStrip
          repoFullName={sourceLabel}
          analytics={filteredAnalytics}
          pipeline={parsed.pipeline}
          reportsCount={raw.reportsCount}
          canEditLocally={canEditLocally}
          hasAnalyticsSection={showAnalytics}
          hasPipelineSection={parsed.pipeline != null}
          dashboardFilters={dashboardFilters}
          onDashboardFiltersChange={setDashboardFilters}
        />
        <DashboardFiltersBar
          applications={parsed.applications}
          filters={dashboardFilters}
          resultCount={filteredApplications.length}
          onFiltersChange={setDashboardFilters}
        />
      </DashboardSection>

      {showAnalytics ? (
        <DashboardSection
          id={DASHBOARD_SECTION_IDS.analytics}
          label="Analytics"
          order={20}
        >
          <AnalyticsChartsPanel
            applications={filteredApplications}
            statusCounts={filteredAnalytics.statusCounts}
            dashboardFilters={dashboardFilters}
            onDashboardFiltersChange={setDashboardFilters}
          />
        </DashboardSection>
      ) : null}

      <DashboardSection
        id={DASHBOARD_SECTION_IDS.funnel}
        label="Funnel"
        order={25}
      >
        <FunnelPanel
          applications={filteredApplications}
          totalApplications={parsed.applications.length}
          dashboardFilters={dashboardFilters}
        />
      </DashboardSection>

      <DashboardSection
        id={DASHBOARD_SECTION_IDS.activity}
        label="Activity"
        order={30}
      >
        <ActivityHeatmapPanel
          applications={filteredApplications}
          periodWeeks={dashboardFilters.periodWeeks ?? 52}
        />
      </DashboardSection>

      {filteredAnalytics.recentApplications.length > 0 ? (
        <DashboardSection
          id={DASHBOARD_SECTION_IDS.recent}
          label="Recent"
          order={40}
        >
          <RecentApplications
            applications={filteredAnalytics.recentApplications}
          />
        </DashboardSection>
      ) : null}

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
          applications={filteredApplications}
          allApplications={parsed.applications}
          totalApplications={parsed.applications.length}
          reportFiles={raw.reportFiles}
          outputFiles={raw.outputFiles}
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
          applications={parsed.applications}
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
