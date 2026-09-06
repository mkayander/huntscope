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
      <div className="text-center">
        <p className="text-lg text-white">Choose a data source</p>
        <p className="mt-2 text-sm text-white/70">
          Open a local folder from disk, or optionally connect a private GitHub
          repository. GitHub sign-in is only required for the cloud option.
        </p>
      </div>

      <LocalRepoPanel />
      <GitHubRepoPanel
        githubStatus={githubStatus}
        githubConfigured={githubConfigured}
      />
    </div>
  );
}
