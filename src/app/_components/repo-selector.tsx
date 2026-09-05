"use client";

import { useMemo, useState } from "react";

import { buttonPrimaryClassName } from "~/app/_components/button-styles";
import { ErrorAlert } from "~/app/_components/error-alert";
import type { GitHubRepoSummary } from "~/lib/career-ops/types";
import { api } from "~/trpc/react";

export function RepoSelector() {
  const [selectedFullName, setSelectedFullName] = useState("");
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const utils = api.useUtils();

  const reposQuery = api.github.listRepos.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const selectedRepoQuery = api.github.getSelectedRepo.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const selectRepo = api.github.selectRepo.useMutation({
    onSuccess: async () => {
      setSelectionError(null);
      await utils.github.getSelectedRepo.invalidate();
      await utils.github.getRepoData.invalidate();
    },
  });

  const repos = reposQuery.data ?? [];
  const selectedRepo = selectedRepoQuery.data;

  const companionRepos = useMemo(
    () => (reposQuery.data ?? []).filter((repo) => repo.isCompanionRepo),
    [reposQuery.data],
  );

  const activeFullName = selectedFullName || (selectedRepo?.fullName ?? "");
  const isRepoChosen = activeFullName.length > 0;

  const handleSelect = () => {
    if (!isRepoChosen) {
      setSelectionError("Choose a repository from the list before continuing.");
      return;
    }

    const repo = repos.find((candidate) => candidate.fullName === activeFullName);
    if (!repo) {
      setSelectionError("That repository is no longer available. Refresh and try again.");
      return;
    }

    setSelectionError(null);
    selectRepo.mutate({
      owner: repo.owner,
      name: repo.name,
      fullName: repo.fullName,
    });
  };

  if (reposQuery.isLoading || selectedRepoQuery.isLoading) {
    return (
      <section className="w-full max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="text-sm text-white/70">Loading your GitHub repositories…</p>
      </section>
    );
  }

  if (reposQuery.error) {
    return (
      <section className="w-full max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-6">
        <ErrorAlert
          title="Could not load your GitHub repositories"
          message={reposQuery.error.message}
        />
      </section>
    );
  }

  if (selectedRepoQuery.error) {
    return (
      <section className="w-full max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-6">
        <ErrorAlert
          title="Could not read your saved repository"
          message={selectedRepoQuery.error.message}
        />
      </section>
    );
  }

  return (
    <section className="w-full max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Career-ops data repo</h2>
          <p className="mt-1 text-sm text-white/60">
            Choose a GitHub repository with career-ops data files such as{" "}
            <code className="rounded bg-black/30 px-1.5 py-0.5 text-xs">
              data/applications.md
            </code>{" "}
            and{" "}
            <code className="rounded bg-black/30 px-1.5 py-0.5 text-xs">
              data/pipeline.md
            </code>
            .
          </p>
        </div>

        {repos.length === 0 ? (
          <ErrorAlert
            title="No repositories found"
            message="Your GitHub account has no owned repositories, or Huntscope cannot access them with the current OAuth scopes."
          />
        ) : (
          <>
            {companionRepos.length > 0 ? (
              <p className="text-sm text-emerald-200">
                Found {companionRepos.length} repo
                {companionRepos.length === 1 ? "" : "s"} with career-ops data files.
              </p>
            ) : (
              <p className="text-sm text-amber-200">
                No repos with career-ops data files were detected yet. You can still
                pick any repository to inspect it.
              </p>
            )}

            <label className="flex flex-col gap-2 text-left">
              <span className="text-sm font-medium text-white/80">Repository</span>
              <select
                value={activeFullName}
                onChange={(event) => {
                  setSelectionError(null);
                  setSelectedFullName(event.target.value);
                }}
                className="rounded-lg border border-white/15 bg-[#15162c] px-3 py-2 text-sm text-white outline-none focus:border-violet-400"
              >
                <option value="">Select a repository…</option>
                {repos.map((repo) => (
                  <option key={repo.id} value={repo.fullName}>
                    {formatRepoOption(repo)}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleSelect}
                  disabled={selectRepo.isPending}
                  aria-disabled={!isRepoChosen || selectRepo.isPending}
                  className={buttonPrimaryClassName}
                >
                  {selectRepo.isPending ? "Saving…" : "Use this repository"}
                </button>

                {selectedRepo ? (
                  <p className="text-sm text-white/70">
                    Active repo:{" "}
                    <span className="font-medium text-white">{selectedRepo.fullName}</span>
                  </p>
                ) : (
                  <p className="text-sm text-white/50">No repository selected yet.</p>
                )}
              </div>

              {!isRepoChosen ? (
                <p className="text-sm text-amber-200">
                  Select a repository above to enable this button.
                </p>
              ) : null}
            </div>

            {selectionError ? (
              <ErrorAlert title="Repository not selected" message={selectionError} />
            ) : null}

            {selectRepo.error ? (
              <ErrorAlert
                title="Could not save repository selection"
                message={selectRepo.error.message}
              />
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}

function formatRepoOption(repo: GitHubRepoSummary): string {
  const privacy = repo.private ? "private" : "public";
  const marker = repo.isCompanionRepo ? "★ career-ops" : privacy;
  return `${repo.fullName} (${marker})`;
}
