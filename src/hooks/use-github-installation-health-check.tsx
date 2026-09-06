"use client";

import { useEffect, useRef } from "react";

import { ErrorAlert } from "~/app/_components/error-alert";
import { useGitHubInstallStatus } from "~/hooks/use-github-install-status";
import { api } from "~/trpc/react";

type UseGitHubInstallationHealthCheckOptions = {
  enabled: boolean;
};

export function useGitHubInstallationHealthCheck({
  enabled,
}: UseGitHubInstallationHealthCheckOptions) {
  const { status: githubStatus } = useGitHubInstallStatus();
  const utils = api.useUtils();
  const hasAttemptedRef = useRef(false);

  const { mutate, isPending, error } = api.github.syncInstallation.useMutation({
    onSuccess: async (result) => {
      await utils.github.getConnection.invalidate();
      void utils.github.listRepos.invalidate();

      const selectedRepo =
        result.selectedRepo ?? (await utils.github.getSelectedRepo.fetch());

      utils.github.getSelectedRepo.setData(undefined, selectedRepo);

      if (selectedRepo) {
        await utils.github.getRepoData.prefetch(selectedRepo);
      }
    },
  });

  useEffect(() => {
    if (!enabled) {
      hasAttemptedRef.current = false;
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled || githubStatus || hasAttemptedRef.current) {
      return;
    }

    hasAttemptedRef.current = true;
    mutate();
  }, [enabled, githubStatus, mutate]);

  const errorMessage =
    error?.data?.code === "NOT_FOUND" ? null : (error?.message ?? null);

  return {
    isChecking: isPending,
    errorMessage,
  };
}

export function GitHubInstallationHealthCheckError({
  message,
}: {
  message: string | null;
}) {
  if (!message) {
    return null;
  }

  return (
    <ErrorAlert title="Could not link GitHub installation" message={message} />
  );
}
