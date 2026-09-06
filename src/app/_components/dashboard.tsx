"use client";

import { RepoDataView } from "~/app/_components/repo-data-view";
import { RepoSelector } from "~/app/_components/repo-selector";
import {
  DashboardSection,
  DashboardSectionProvider,
} from "~/app/_components/dashboard-section-nav";
import { PageSectionNav } from "~/app/_components/page-section-nav";
import { DASHBOARD_SECTION_IDS } from "~/lib/dashboard/sections";

export function Dashboard() {
  return (
    <DashboardSectionProvider>
      <div className="flex w-full min-w-0 max-w-screen-2xl items-start gap-5">
        <div className="flex min-w-0 flex-1 flex-col items-stretch gap-6">
          <DashboardSection
            id={DASHBOARD_SECTION_IDS.repository}
            label="Repository"
            order={0}
          >
            <RepoSelector />
          </DashboardSection>
          <RepoDataView />
        </div>
        <PageSectionNav />
      </div>
    </DashboardSectionProvider>
  );
}
