"use client";

import { GitHubInstallStatusBanner } from "~/app/_components/github-install-status-banner";
import { AuthButton } from "~/app/_components/auth-button";
import { useCareerOpsDataSource } from "~/hooks/use-career-ops-data-source";
import { getDataSourceLabel } from "~/lib/career-ops/data-source";
import { cn } from "~/lib/utils";

type DashboardChromeProps = {
  className?: string;
};

export function DashboardChrome({ className }: DashboardChromeProps) {
  const { activeSource } = useCareerOpsDataSource();
  const sourceLabel = activeSource ? getDataSourceLabel(activeSource) : null;

  return (
    <div
      className={cn(
        "sticky top-0 z-40 w-full border-b border-white/10 bg-[#0b0c1c]/80 backdrop-blur-md",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-2 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-lg font-bold tracking-tight text-white">
              Hunt<span className="text-[hsl(280,100%,70%)]">scope</span>
            </p>
            {sourceLabel ? (
              <p className="truncate text-xs text-white/55">{sourceLabel}</p>
            ) : (
              <p className="text-xs text-white/45">
                Connect a local folder or GitHub repo
              </p>
            )}
          </div>

          <div className="shrink-0">
            <AuthButton variant="compact" />
          </div>
        </div>

        <GitHubInstallStatusBanner />
      </div>
    </div>
  );
}
