"use client";

import { useState } from "react";

import { ActivityHeatmapPanel } from "~/app/_components/activity-heatmap";
import { ErrorAlert } from "~/app/_components/error-alert";
import { OverviewStrip } from "~/app/_components/overview-strip";
import { PipelinePanel } from "~/app/_components/pipeline-panel";
import { RecentApplications } from "~/app/_components/recent-applications";
import { TrackerPanel } from "~/app/_components/tracker-panel";
import { useParsedRepoData } from "~/lib/career-ops/use-parsed-repo-data";
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
  const { data: raw, error, isLoading } = api.github.getRepoData.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const { parsed, isParsing, parseError } = useParsedRepoData(raw);

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

  if (parseError) {
    return (
      <section className="w-full max-w-5xl rounded-2xl border border-white/10 bg-white/5 p-6">
        <ErrorAlert title="Could not parse repository data" message={parseError} />
      </section>
    );
  }

  if (!raw || !parsed) {
    return (
      <section className="w-full max-w-5xl rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="text-sm text-white/70">
          {isParsing ? "Parsing repository data in the background…" : "No repository data available."}
        </p>
      </section>
    );
  }

  return (
    <section className="flex w-full max-w-5xl flex-col gap-6">
      <OverviewStrip
        repoFullName={raw.fullName}
        analytics={parsed.analytics}
        pipeline={parsed.pipeline}
        reportsCount={raw.reportsCount}
        activeStatusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <ActivityHeatmapPanel applications={parsed.applications} />

      <RecentApplications applications={parsed.analytics.recentApplications} />

      {parsed.pipeline ? <PipelinePanel pipeline={parsed.pipeline} /> : null}

      <TrackerPanel
        repoFullName={raw.fullName}
        applications={parsed.applications}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {raw.dataFiles.length > 0 ? (
        <details className="rounded-2xl border border-white/10 bg-white/5 p-6">
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
      ) : null}
    </section>
  );
}
