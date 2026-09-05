"use client";

import { useMemo, useState } from "react";

import { ActivityHeatmapPanel } from "~/app/_components/activity-heatmap";
import { ErrorAlert } from "~/app/_components/error-alert";
import { OverviewStrip } from "~/app/_components/overview-strip";
import { PipelinePanel } from "~/app/_components/pipeline-panel";
import { RecentApplications } from "~/app/_components/recent-applications";
import { TrackerPanel } from "~/app/_components/tracker-panel";
import { computeApplicationAnalytics } from "~/lib/career-ops/analytics";
import { api } from "~/trpc/react";

export function RepoDataView() {
  const selectedRepoQuery = api.github.getSelectedRepo.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  if (selectedRepoQuery.isLoading) {
    return (
      <section className="w-full max-w-5xl rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="text-sm text-white/70">Loading saved repository…</p>
      </section>
    );
  }

  if (selectedRepoQuery.error) {
    return (
      <section className="w-full max-w-5xl rounded-2xl border border-white/10 bg-white/5 p-6">
        <ErrorAlert
          title="Could not read your saved repository"
          message={selectedRepoQuery.error.message}
        />
      </section>
    );
  }

  if (!selectedRepoQuery.data) {
    return (
      <section className="w-full max-w-5xl rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-center">
        <p className="text-white/70">
          Select a career-ops data repository above to load tracker and pipeline
          data.
        </p>
      </section>
    );
  }

  return <RepoDataContent />;
}

function RepoDataContent() {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const { data, error, isLoading } = api.github.getRepoData.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const analytics = useMemo(
    () => (data ? computeApplicationAnalytics(data.applications) : null),
    [data],
  );

  if (isLoading) {
    return (
      <section className="w-full max-w-5xl rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="text-sm text-white/70">Loading repository data…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full max-w-5xl rounded-2xl border border-white/10 bg-white/5 p-6">
        <ErrorAlert title="Could not load repository data" message={error.message} />
      </section>
    );
  }

  if (!data || !analytics) {
    return null;
  }

  return (
    <section className="flex w-full max-w-5xl flex-col gap-6">
      <OverviewStrip
        repoFullName={data.fullName}
        analytics={analytics}
        pipeline={data.pipeline}
        reportsCount={data.reportsCount}
        activeStatusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <ActivityHeatmapPanel applications={data.applications} />

      <RecentApplications applications={analytics.recentApplications} />

      {data.pipeline ? <PipelinePanel pipeline={data.pipeline} /> : null}

      <TrackerPanel
        repoFullName={data.fullName}
        applications={data.applications}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {data.dataFiles.length > 0 ? (
        <details className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <summary className="cursor-pointer text-sm font-medium text-white/80">
            Data files in `data/`
          </summary>
          <ul className="mt-3 flex flex-wrap gap-2">
            {data.dataFiles.map((file) => (
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
      ) : null}
    </section>
  );
}
