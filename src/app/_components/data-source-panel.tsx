"use client";

import { GitHubRepoPanel } from "~/app/_components/github-repo-panel";
import { LocalRepoPanel } from "~/app/_components/local-repo-panel";

export function DataSourcePanel({
  githubStatus,
  githubConfigured,
}: {
  githubStatus?: string;
  githubConfigured: boolean;
}) {
  return (
    <div className="flex w-full max-w-3xl flex-col gap-6">
      <header className="flex flex-col gap-2 text-center">
        <h2 className="text-lg font-semibold text-white">
          Choose a data source
        </h2>
        <p className="text-sm text-white/70">
          Start with a local career-ops project — no account needed. GitHub
          sign-in is only required if you want to connect a companion repository
          in the cloud.
        </p>
      </header>

      <LocalRepoPanel variant="landing" />
      <GitHubRepoPanel
        githubStatus={githubStatus}
        githubConfigured={githubConfigured}
      />
    </div>
  );
}
