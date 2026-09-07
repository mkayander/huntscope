"use client";

import { clickablePillClassName } from "~/components/ui/interaction";
import { GlowPanel } from "~/components/ui/glow-panel";
import { cn } from "~/lib/utils";
import { DASHBOARD_SECTION_IDS } from "~/lib/dashboard/sections";
import type { CareerOpsDataSource } from "~/lib/career-ops/data-source";
import type { RepoDataFile } from "~/lib/career-ops/types";
import { useArtifactViewer } from "~/hooks/use-artifact-viewer";

type DataFilesPanelProps = {
  dataSource: CareerOpsDataSource;
  defaultBranch: string | null;
  dataFiles: RepoDataFile[];
};

export function DataFilesPanel({
  dataFiles,
}: Pick<DataFilesPanelProps, "dataFiles">) {
  const { openArtifact } = useArtifactViewer();

  if (dataFiles.length === 0) {
    return null;
  }

  return (
    <GlowPanel accent={DASHBOARD_SECTION_IDS.dataFiles}>
      <div>
        <h3 className="text-lg font-semibold text-white">Data files</h3>
        <p className="mt-1 text-sm text-white/60">
          Files under `data/` — open markdown previews in-app.
        </p>
      </div>

      <ul className="mt-4 flex flex-wrap gap-2">
        {dataFiles.map((file) => {
          const isPreviewable =
            file.type === "file" &&
            (file.name.endsWith(".md") || file.name.endsWith(".txt"));

          if (isPreviewable) {
            return (
              <li key={file.path}>
                <button
                  type="button"
                  className={cn(
                    clickablePillClassName,
                    "rounded-full bg-black/30 px-3 py-1 text-xs text-white/80",
                  )}
                  onClick={() =>
                    openArtifact({
                      path: file.path,
                      label: file.name,
                    })
                  }
                >
                  {file.name}
                </button>
              </li>
            );
          }

          return (
            <li
              key={file.path}
              className="rounded-full bg-black/30 px-3 py-1 text-xs text-white/80"
            >
              {file.name}
              {file.type === "dir" ? "/" : ""}
            </li>
          );
        })}
      </ul>
    </GlowPanel>
  );
}
