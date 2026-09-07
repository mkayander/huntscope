"use client";

import { ArtifactPreviewSheet } from "~/app/_components/artifact-preview-sheet";
import { DashboardHeader } from "~/app/_components/dashboard-header";
import { DashboardShortcuts } from "~/app/_components/dashboard-shortcuts";
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
        <DashboardHeader />
        <div className="mx-auto flex w-full max-w-screen-2xl flex-col px-4 py-6 sm:px-6 lg:px-8">
          <DashboardShortcuts />
          <div className="flex w-full min-w-0 items-start gap-5">
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
        </div>
        <ArtifactPreviewSheet />
      </DashboardSectionProvider>
    </ArtifactViewerProvider>
  );
}
