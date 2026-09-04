"use client";

import { useMemo, useState } from "react";

import type { GitHubRepoSummary } from "~/lib/career-ops/types";
import { api } from "~/trpc/react";

export function RepoSelector() {
  const [selectedFullName, setSelectedFullName] = useState("");
  const utils = api.useUtils();

  const [repos] = api.github.listRepos.useSuspenseQuery();
  const [selectedRepo] = api.github.getSelectedRepo.useSuspenseQuery();

  const selectRepo = api.github.selectRepo.useMutation({
    onSuccess: async () => {
      await utils.github.getSelectedRepo.invalidate();
      await utils.github.getRepoData.invalidate();
    },
  });

  const companionRepos = useMemo(
    () => repos.filter((repo) => repo.isCompanionRepo),
    [repos],
  );

  const activeFullName = selectedFullName || (selectedRepo?.fullName ?? "");

  const handleSelect = () => {
    const repo = repos.find((candidate) => candidate.fullName === activeFullName);
    if (!repo) {
      return;
    }

    selectRepo.mutate({
      owner: repo.owner,
      name: repo.name,
      fullName: repo.fullName,
    });
  };

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
          <p className="text-sm text-white/70">
            No repositories found on your GitHub account.
          </p>
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
                onChange={(event) => setSelectedFullName(event.target.value)}
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

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleSelect}
                disabled={!activeFullName || selectRepo.isPending}
                className="rounded-full bg-violet-500 px-6 py-2 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
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

            {selectRepo.error ? (
              <p className="rounded-lg bg-red-500/20 px-4 py-3 text-sm text-red-100">
                {selectRepo.error.message}
              </p>
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
