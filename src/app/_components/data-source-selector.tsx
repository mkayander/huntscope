"use client";

import { authClient } from "~/lib/auth-client";
import { LocalRepoPanel } from "~/app/_components/local-repo-panel";
import { RepoSelector } from "~/app/_components/repo-selector";
import { Button } from "~/components/ui/button";
import { GlowPanel } from "~/components/ui/glow-panel";
import { useCareerOpsDataSource } from "~/hooks/use-career-ops-data-source";
import { getDataSourceLabel } from "~/lib/career-ops/data-source";
import { DASHBOARD_SECTION_IDS } from "~/lib/dashboard/sections";

export function DataSourceSelector() {
  const { data: session } = authClient.useSession();
  const isSignedIn = Boolean(session?.user);
  const {
    localSource,
    githubSource,
    activeSource,
    setActiveSource,
    hasLocalSource,
    hasGitHubSource,
  } = useCareerOpsDataSource();

  const showSourceSwitcher = hasLocalSource && hasGitHubSource;

  return (
    <div className="flex w-full max-w-screen-2xl flex-col gap-4">
      {showSourceSwitcher ? (
        <GlowPanel
          accent={DASHBOARD_SECTION_IDS.repository}
          className="flex flex-col gap-3"
        >
          <div className="flex flex-col gap-1.5">
            <h2 className="text-xl font-semibold text-white">
              Active data source
            </h2>
            <p className="text-sm text-white/60">
              Switch between your local career-ops project and a connected
              companion repository on GitHub.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {localSource ? (
              <Button
                type="button"
                variant={
                  activeSource?.kind === "local" ? "brandSecondary" : "outline"
                }
                size="pill"
                onClick={() => {
                  setActiveSource(localSource);
                }}
              >
                Local: {getDataSourceLabel(localSource)}
              </Button>
            ) : null}
            {githubSource ? (
              <Button
                type="button"
                variant={
                  activeSource?.kind === "github" ? "brandSecondary" : "outline"
                }
                size="pill"
                onClick={() => {
                  setActiveSource(githubSource);
                }}
              >
                GitHub: {getDataSourceLabel(githubSource)}
              </Button>
            ) : null}
          </div>
          {activeSource ? (
            <p className="text-sm text-white/70">
              Viewing{" "}
              <span className="font-medium text-white">
                {getDataSourceLabel(activeSource)}
              </span>
            </p>
          ) : null}
        </GlowPanel>
      ) : null}

      {!hasLocalSource ||
      activeSource?.kind === "local" ||
      showSourceSwitcher ? (
        <LocalRepoPanel variant="dashboard" />
      ) : null}

      {isSignedIn &&
      (!hasGitHubSource ||
        activeSource?.kind === "github" ||
        showSourceSwitcher) ? (
        <RepoSelector />
      ) : null}

      {!hasLocalSource && !hasGitHubSource ? (
        <GlowPanel accent={DASHBOARD_SECTION_IDS.repository} variant="dashed">
          <p className="text-sm text-white/70">
            Open a local career-ops project folder or connect a companion
            repository on GitHub to load your tracker and pipeline data.
          </p>
        </GlowPanel>
      ) : null}
    </div>
  );
}
