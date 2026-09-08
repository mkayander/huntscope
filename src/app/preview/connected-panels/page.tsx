import { notFound } from "next/navigation";

import { DataPreview } from "~/app/_components/data-preview";
import { OpenDashboardButton } from "~/app/_components/open-dashboard-button";
import { PanelSection } from "~/app/_components/panel-section";
import { Button } from "~/components/ui/button";

const SAMPLE_PREVIEW = `# Applications Tracker

**Apply shortlist (2026-04-16):** track follow-ups for this week.
Bulk Amazon targets are indexed in pipeline for review.`;

export default function ConnectedPanelsPreviewPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <main className="container mx-auto flex max-w-lg flex-col gap-8 px-4 py-16">
      <PanelSection variant="landing">
        <h2 className="text-lg font-semibold text-white">GitHub repository</h2>

        <div className="mx-auto flex w-full max-w-sm flex-col items-stretch gap-4">
          <div className="flex flex-col gap-1 text-center">
            <p className="text-xs text-white/50">Connected repository</p>
            <p className="truncate font-mono text-sm text-white/90">
              mkayander/career-ops-data
            </p>
          </div>

          <DataPreview
            filePath="data/applications.md"
            preview={SAMPLE_PREVIEW}
            sourceLabel="mkayander/career-ops-data"
            className="max-w-none"
          />

          <div className="flex flex-col gap-3">
            <OpenDashboardButton className="w-full min-w-0" />
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="brandSecondary"
                size="pill"
                className="w-full min-w-0"
              >
                Change repository
              </Button>
              <Button
                type="button"
                variant="brandSecondary"
                size="pill"
                className="w-full min-w-0"
              >
                Disconnect
              </Button>
            </div>
          </div>
        </div>
      </PanelSection>
    </main>
  );
}
