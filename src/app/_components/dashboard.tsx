"use client";

import { ArtifactPreviewSheet } from "~/app/_components/artifact-preview-sheet";
import { DataSourceSelector } from "~/app/_components/data-source-selector";
import { RepoDataView } from "~/app/_components/repo-data-view";
import {
  DashboardSection,
  DashboardSectionProvider,
} from "~/app/_components/dashboard-section-nav";
import { PageSectionNav } from "~/app/_components/page-section-nav";
import { DASHBOARD_SECTION_IDS } from "~/lib/dashboard/sections";
import { ArtifactViewerProvider } from "~/hooks/use-artifact-viewer";

export function Dashboard() {
  return (
    <ArtifactViewerProvider>
      <DashboardSectionProvider>
        <div className="flex w-full max-w-screen-2xl min-w-0 items-start gap-5">
          <div className="flex min-w-0 flex-1 flex-col items-stretch gap-6">
            <DashboardSection
              id={DASHBOARD_SECTION_IDS.repository}
              label="Data source"
              order={0}
            >
              <DataSourceSelector />
            </DashboardSection>
            <RepoDataView />
          </div>
          <PageSectionNav />
        </div>
        <ArtifactPreviewSheet />
      </DashboardSectionProvider>
    </ArtifactViewerProvider>
  );
}
