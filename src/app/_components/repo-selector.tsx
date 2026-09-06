"use client";

import { useMemo, useState, type ReactNode } from "react";

import { ButtonLoadingIcon } from "~/app/_components/button-loading-icon";
import { ErrorAlert } from "~/app/_components/error-alert";
import { FeedbackRegion } from "~/app/_components/feedback-region";
import { GitHubInstallButton } from "~/app/_components/github-install-button";
import { StableButtonLabel } from "~/app/_components/panel-content-slots";
import {
  GitHubInstallationHealthCheckError,
  useGitHubInstallationHealthCheck,
} from "~/hooks/use-github-installation-health-check";
import { PanelButtonSkeleton } from "~/app/_components/panel-loading-skeleton";
import { Button } from "~/components/ui/button";
import { GlowPanel } from "~/components/ui/glow-panel";
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
  useRepoDataQuery,
  useSelectedRepoQuery,
} from "~/hooks/use-career-ops-repo";
import { useCareerOpsDataSource } from "~/hooks/use-career-ops-data-source";
import { useHomeShell } from "~/hooks/use-home-shell";
import { useHasMounted } from "~/hooks/use-has-mounted";
import { toGitHubDataSource } from "~/lib/career-ops/data-source";
import { toSelectedRepo } from "~/lib/career-ops/selected-repo";
import type { GitHubRepoSummary } from "~/lib/career-ops/types";
import { DASHBOARD_SECTION_IDS } from "~/lib/dashboard/sections";
import {
  githubListReposQueryOptions,
  isGitHubRateLimitTrpcError,
  withClientOnlyQuery,
} from "~/lib/cache/github-query-options";
import { api } from "~/trpc/react";

const EMPTY_REPO_VALUE = "__huntscope_empty__";

function RepoSelectorCard({ children }: { children: ReactNode }) {
  return (
    <GlowPanel
      accent={DASHBOARD_SECTION_IDS.repository}
      className="w-full max-w-screen-2xl"
    >
      {children}
    </GlowPanel>
  );
}

function RepoSelectorLoadingContent() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-7 w-56 bg-white/10" />
        <Skeleton className="h-4 w-full max-w-xl bg-white/10" />
        <Skeleton className="h-4 w-full max-w-lg bg-white/10" />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-24 bg-white/10" />
          <Skeleton className="h-10 w-full bg-white/10" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <PanelButtonSkeleton variant="dashboard" />
        <Skeleton className="h-9 w-36 rounded-full bg-white/10" />
      </div>

      <div aria-hidden className="min-h-[4.75rem]" />
    </div>
  );
}

function RepoSelectorNoConnectionContent() {
  const { isChecking, errorMessage } = useGitHubInstallationHealthCheck({
    enabled: true,
  });

  if (isChecking) {
    return <RepoSelectorLoadingContent />;
  }

  return (
    <div className="flex flex-col gap-4">
      <GitHubInstallationHealthCheckError message={errorMessage} />
      <div className="flex flex-col gap-1.5">
        <h2 className="text-xl font-semibold text-white">
          Connect a repository
        </h2>
        <p className="text-sm text-white/60">
          Install the Huntscope GitHub App on the repository that contains your
          career-ops data.
        </p>
      </div>
      <GitHubInstallButton
        variant="brandSecondary"
        size="pill"
        className="w-fit"
      >
        Connect GitHub repository
      </GitHubInstallButton>
    </div>
  );
}

export function RepoSelector() {
  const hasMounted = useHasMounted();
  const { isSignedIn: initialIsSignedIn } = useHomeShell();
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const utils = api.useUtils();

  const connectionQuery = api.github.getConnection.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const reposQuery = api.github.listRepos.useQuery(
    undefined,
    withClientOnlyQuery(
      githubListReposQueryOptions,
      connectionQuery.data != null,
    ),
  );
  const selectedRepoQuery = useSelectedRepoQuery();
  const repoDataQuery = useRepoDataQuery(selectedRepoQuery.data);
  const { selectRepo, persistRepo } = usePersistSelectedRepo();
  const { setActiveSource } = useCareerOpsDataSource();

  const repos = useMemo(() => reposQuery.data ?? [], [reposQuery.data]);
  const selectedRepo = selectedRepoQuery.data;

  const activeFullName = selectedRepo?.fullName ?? "";
  const isRepoChosen = activeFullName.length > 0;
  const isRepoListRateLimited =
    reposQuery.error != null && isGitHubRateLimitTrpcError(reposQuery.error);

  const isReloading = repoDataQuery.isRefetching && !selectRepo.isPending;

  const feedbackHint = selectRepo.isPending
    ? "Saving repository selection and loading data…"
    : isReloading
      ? "Reloading repository data…"
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
      setSelectionError(
        "That repository is no longer available. Refresh and try again.",
      );
      return;
    }

    persistRepo(repo);
    setActiveSource(toGitHubDataSource(toSelectedRepo(repo)));
  };

  const handleReload = () => {
    if (!selectedRepo) {
      setSelectionError("Choose a repository from the list before continuing.");
      return;
    }

    setSelectionError(null);
    void utils.github.getRepoData.invalidate(selectedRepo);
  };

  const deferUntilMounted = !hasMounted && !initialIsSignedIn;

  if (deferUntilMounted || connectionQuery.isLoading) {
    return (
      <RepoSelectorCard>
        <RepoSelectorLoadingContent />
      </RepoSelectorCard>
    );
  }

  if (connectionQuery.error) {
    return (
      <RepoSelectorCard>
        <ErrorAlert
          title="Could not check GitHub connection"
          message={connectionQuery.error.message}
        />
      </RepoSelectorCard>
    );
  }

  if (!connectionQuery.data) {
    return (
      <RepoSelectorCard>
        <RepoSelectorNoConnectionContent />
      </RepoSelectorCard>
    );
  }

  if (reposQuery.isLoading || selectedRepoQuery.isLoading) {
    return (
      <RepoSelectorCard>
        <RepoSelectorLoadingContent />
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
        <h2 className="text-xl font-semibold text-white">
          Career-ops data repo
        </h2>
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
            message="No repositories are available from your GitHub App installation. Reinstall the app and select a companion repository with career-ops data files."
          />
        ) : (
          <>
            <div className="min-h-[1.25rem]">
              <p className="text-sm text-white/60">
                Pick the repository that contains your career-ops data.
                Huntscope only fetches files from the repo you select.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2 text-left">
                <Label htmlFor="repo-select" className="text-white/80">
                  Repository
                </Label>
                <Select
                  variant="dashboard"
                  value={activeFullName || EMPTY_REPO_VALUE}
                  onValueChange={handleRepoChange}
                >
                  <SelectTrigger id="repo-select" className="w-full">
                    <SelectValue placeholder="Select a repository…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={EMPTY_REPO_VALUE}>
                      Select a repository…
                    </SelectItem>
                    {repos.map((repo) => (
                      <SelectItem key={repo.id} value={repo.fullName}>
                        {formatRepoOption(repo)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  variant="brandSecondary"
                  size="pill"
                  disabled={
                    !selectedRepo || selectRepo.isPending || isReloading
                  }
                  onClick={handleReload}
                >
                  <ButtonLoadingIcon
                    isLoading={selectRepo.isPending || isReloading}
                  />
                  <StableButtonLabel placeholder="Reload data">
                    Reload data
                  </StableButtonLabel>
                </Button>

                <GitHubInstallButton
                  variant="outline"
                  size="pill"
                  loadingLabel="Opening GitHub…"
                  labelPlaceholder="Opening GitHub…"
                >
                  Change installation
                </GitHubInstallButton>

                <p className="min-w-[12rem] text-sm text-white/70">
                  {selectedRepo ? (
                    <>
                      Active repo:{" "}
                      <span className="font-medium text-white">
                        {selectedRepo.fullName}
                      </span>
                      {selectRepo.isPending ? (
                        <span className="ml-2 text-white/50">· saving…</span>
                      ) : null}
                    </>
                  ) : (
                    <span className="text-white/50">
                      No repository saved yet.
                    </span>
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
  const layout = repo.hasCareerOpsLayout ? "career-ops" : "unknown layout";
  return `${repo.fullName} (${privacy}, ${layout})`;
}
