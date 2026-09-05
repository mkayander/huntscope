"use client";

import { Loader2 } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import { ErrorAlert } from "~/app/_components/error-alert";
import { FeedbackRegion } from "~/app/_components/feedback-region";
import { Button } from "~/components/ui/button";
import { GlowPanel } from "~/components/ui/glow-panel";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Skeleton } from "~/components/ui/skeleton";
import {
  usePersistSelectedRepo,
  useSelectedRepoQuery,
} from "~/hooks/use-career-ops-repo";
import { useHasMounted } from "~/hooks/use-has-mounted";
import type { GitHubRepoSummary } from "~/lib/career-ops/types";
import { filterRepos, hasActiveRepoFilter } from "~/lib/career-ops/repo-list";
import { DASHBOARD_SECTION_IDS } from "~/lib/dashboard/sections";
import { githubListReposQueryOptions, isGitHubRateLimitTrpcError, withClientOnlyQuery } from "~/lib/cache/github-query-options";
import { api } from "~/trpc/react";

const EMPTY_REPO_VALUE = "__huntscope_empty__";

function RepoSelectorCard({ children }: { children: ReactNode }) {
  return (
    <GlowPanel accent={DASHBOARD_SECTION_IDS.repository} className="w-full max-w-screen-2xl">
      {children}
    </GlowPanel>
  );
}

export function RepoSelector() {
  const hasMounted = useHasMounted();
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [repoFilterQuery, setRepoFilterQuery] = useState("");
  const utils = api.useUtils();

  const reposQuery = api.github.listRepos.useQuery(
    undefined,
    withClientOnlyQuery(githubListReposQueryOptions, hasMounted),
  );
  const selectedRepoQuery = useSelectedRepoQuery();
  const { selectRepo, persistRepo } = usePersistSelectedRepo();

  const repos = reposQuery.data ?? [];
  const selectedRepo = selectedRepoQuery.data;

  const activeFullName = selectedRepo?.fullName ?? "";
  const isRepoChosen = activeFullName.length > 0;
  const filteredRepos = useMemo(
    () =>
      filterRepos(repos, repoFilterQuery, {
        alwaysIncludeFullName: activeFullName,
      }),
    [activeFullName, repoFilterQuery, repos],
  );
  const isRepoFilterActive = hasActiveRepoFilter(repoFilterQuery);
  const isRepoListRateLimited =
    reposQuery.error != null && isGitHubRateLimitTrpcError(reposQuery.error);

  const feedbackHint =
    selectRepo.isPending
      ? "Saving repository selection and loading data…"
      : isRepoListRateLimited
        ? "Showing cached repositories while GitHub rate limit resets."
        : !isRepoChosen
          ? "Choose a career-ops repository to load your dashboard."
          : null;

  const feedbackErrorTitle = selectRepo.error
    ? "Could not save repository selection"
    : selectionError
      ? "Repository not selected"
      : null;
  const feedbackErrorMessage = selectRepo.error?.message ?? selectionError;

  const handleRepoChange = (value: string) => {
    const fullName = value === EMPTY_REPO_VALUE ? "" : value;
    setSelectionError(null);

    if (!fullName) {
      return;
    }

    const repo = repos.find((candidate) => candidate.fullName === fullName);
    if (!repo) {
      setSelectionError("That repository is no longer available. Refresh and try again.");
      return;
    }

    persistRepo(repo);
  };

  const handleReload = () => {
    if (!selectedRepo) {
      setSelectionError("Choose a repository from the list before continuing.");
      return;
    }

    setSelectionError(null);
    void utils.github.getRepoData.invalidate(selectedRepo);
  };

  if (!hasMounted || reposQuery.isLoading || selectedRepoQuery.isLoading) {
    return (
      <RepoSelectorCard>
        <div className="flex flex-col gap-3">
          <Skeleton className="h-6 w-56 bg-white/10" />
          <Skeleton className="h-4 w-full max-w-xl bg-white/10" />
          <Skeleton className="mt-2 h-10 w-full bg-white/10" />
        </div>
      </RepoSelectorCard>
    );
  }

  if (reposQuery.error && repos.length === 0) {
    const isRateLimited = isGitHubRateLimitTrpcError(reposQuery.error);

    return (
      <RepoSelectorCard>
        <ErrorAlert
          title={
            isRateLimited
              ? "GitHub rate limit reached"
              : "Could not load your GitHub repositories"
          }
          message={
            isRateLimited
              ? "Huntscope made too many GitHub API requests. Wait a few minutes, then reload this page. Your saved repository selection is still intact."
              : reposQuery.error.message
          }
        />
      </RepoSelectorCard>
    );
  }

  if (selectedRepoQuery.error) {
    return (
      <RepoSelectorCard>
        <ErrorAlert
          title="Could not read your saved repository"
          message={selectedRepoQuery.error.message}
        />
      </RepoSelectorCard>
    );
  }

  return (
    <GlowPanel
      accent={DASHBOARD_SECTION_IDS.repository}
      className="flex w-full max-w-screen-2xl flex-col gap-4"
    >
      <div className="flex flex-col gap-1.5">
        <h2 className="text-xl font-semibold text-white">Career-ops data repo</h2>
        <p className="text-sm text-white/60">
          Choose a GitHub repository with career-ops data files such as{" "}
          <code className="rounded bg-black/30 px-1.5 py-0.5 text-xs">
            data/applications.md
          </code>{" "}
          and{" "}
          <code className="rounded bg-black/30 px-1.5 py-0.5 text-xs">
            data/pipeline.md
          </code>
          . Your choice is remembered and data loads automatically.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {repos.length === 0 ? (
          <ErrorAlert
            title="No repositories found"
            message="Your GitHub account has no owned repositories, or Huntscope cannot access them with the current OAuth scopes."
          />
        ) : (
          <>
            <div className="min-h-[1.25rem]">
              <p className="text-sm text-white/60">
                Pick the repository that contains your career-ops data. Huntscope only
                fetches files from the repo you select.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5 text-left">
                <Label htmlFor="repo-filter" className="text-white/80">
                  Filter repositories
                </Label>
                <Input
                  id="repo-filter"
                  value={repoFilterQuery}
                  onChange={(event) => {
                    setRepoFilterQuery(event.target.value);
                  }}
                  placeholder="Search by owner, name, or description…"
                  className="border-white/15 bg-[#15162c] text-white placeholder:text-white/40"
                />
                <p className="text-xs text-white/50" id="repo-filter-results">
                  {isRepoFilterActive
                    ? `Showing ${filteredRepos.length} of ${repos.length} repositories`
                    : `${repos.length} repositories`}
                </p>
              </div>

              <div className="flex flex-col gap-2 text-left">
                <Label htmlFor="repo-select" className="text-white/80">
                  Repository
                </Label>
                {filteredRepos.length === 0 ? (
                  <p className="rounded-lg border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-sm text-amber-100">
                    No repositories match &ldquo;{repoFilterQuery.trim()}&rdquo;. Try a
                    different search.
                  </p>
                ) : (
                  <Select
                    value={activeFullName || EMPTY_REPO_VALUE}
                    onValueChange={handleRepoChange}
                  >
                    <SelectTrigger
                      id="repo-select"
                      className="w-full border-white/15 bg-[#15162c]"
                      aria-describedby="repo-filter-results"
                    >
                      <SelectValue placeholder="Select a repository…" />
                    </SelectTrigger>
                    <SelectContent className="border-white/15 bg-[#15162c] text-white">
                      <SelectItem value={EMPTY_REPO_VALUE}>Select a repository…</SelectItem>
                      {filteredRepos.map((repo) => (
                        <SelectItem key={repo.id} value={repo.fullName}>
                          {formatRepoOption(repo)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  variant="brandSecondary"
                  size="pill"
                  disabled={!selectedRepo || selectRepo.isPending}
                  onClick={handleReload}
                >
                  {selectRepo.isPending ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  ) : null}
                  Reload data
                </Button>

                <p className="min-w-[12rem] text-sm text-white/70">
                  {selectedRepo ? (
                    <>
                      Active repo:{" "}
                      <span className="font-medium text-white">{selectedRepo.fullName}</span>
                      {selectRepo.isPending ? (
                        <span className="ml-2 text-white/50">· saving…</span>
                      ) : null}
                    </>
                  ) : (
                    <span className="text-white/50">No repository saved yet.</span>
                  )}
                </p>
              </div>

              <FeedbackRegion
                hint={feedbackHint}
                errorTitle={feedbackErrorTitle}
                errorMessage={feedbackErrorMessage}
              />
            </div>
          </>
        )}
      </div>
    </GlowPanel>
  );
}

function formatRepoOption(repo: GitHubRepoSummary): string {
  const privacy = repo.private ? "private" : "public";
  return `${repo.fullName} (${privacy})`;
}
