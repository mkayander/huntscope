"use client";

import { useMemo } from "react";

import { ArtifactLinkButton } from "~/app/_components/artifact-link-button";
import { GlowPanel } from "~/components/ui/glow-panel";
import { DASHBOARD_SECTION_IDS } from "~/lib/dashboard/sections";
import type { CareerOpsDataSource } from "~/lib/career-ops/data-source";
import { sortReportFilesByName } from "~/lib/career-ops/parse-report";
import type { RepoDataFile } from "~/lib/career-ops/types";
import { useArtifactViewer } from "~/hooks/use-artifact-viewer";

type ReportsPanelProps = {
  dataSource: CareerOpsDataSource;
  defaultBranch: string | null;
  reportFiles: RepoDataFile[];
};

export function ReportsPanel({
  reportFiles,
}: Omit<ReportsPanelProps, "dataSource" | "defaultBranch">) {
  const { openArtifact } = useArtifactViewer();
  const files = useMemo(
    () =>
      sortReportFilesByName(
        reportFiles.filter(
          (file) => file.type === "file" && file.name.endsWith(".md"),
        ),
      ),
    [reportFiles],
  );

  if (files.length === 0) {
    return null;
  }

  return (
    <GlowPanel accent={DASHBOARD_SECTION_IDS.reports}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Evaluation reports
          </h3>
          <p className="mt-1 text-sm text-white/60">
            Browse reports from `reports/` and open them in-app.
          </p>
        </div>
        <span className="text-sm text-white/50">{files.length} files</span>
      </div>

      <ul className="mt-4 space-y-2">
        {files.map((file) => (
          <li key={file.path}>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-left transition hover:border-violet-400/30 hover:bg-violet-500/5"
              onClick={() =>
                openArtifact({
                  path: file.path,
                  label: file.name,
                })
              }
            >
              <span className="truncate text-sm font-medium text-white">
                {file.name}
              </span>
              <span className="text-xs text-violet-300">Open</span>
            </button>
          </li>
        ))}
      </ul>
    </GlowPanel>
  );
}

type LatestReportCardProps = {
  dataSource: CareerOpsDataSource;
  defaultBranch: string | null;
  reportFiles: RepoDataFile[];
};

export function LatestReportCard({
  dataSource,
  defaultBranch,
  reportFiles,
}: LatestReportCardProps) {
  const latest = useMemo(
    () =>
      sortReportFilesByName(
        reportFiles.filter(
          (file) => file.type === "file" && file.name.endsWith(".md"),
        ),
      )[0] ?? null,
    [reportFiles],
  );

  if (!latest) {
    return null;
  }

  return (
    <GlowPanel accent={DASHBOARD_SECTION_IDS.reports}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Latest report</h3>
          <p className="mt-1 text-sm text-white/60">{latest.name}</p>
        </div>
        <ArtifactLinkButton
          dataSource={dataSource}
          defaultBranch={defaultBranch}
          value={latest.path}
          className="rounded-full bg-violet-500/15 px-3 py-1 text-xs font-medium text-violet-200 ring-1 ring-violet-400/30 hover:bg-violet-500/25"
        />
      </div>
    </GlowPanel>
  );
}
