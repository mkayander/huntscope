"use client";

import { useEffect, useRef } from "react";

import {
  toGitHubDataSource,
  type CareerOpsDataSource,
  type CareerOpsDataSourcePreference,
} from "~/lib/career-ops/data-source";
import type { SelectedRepo } from "~/lib/career-ops/types";
import { api } from "~/trpc/react";

type GitHubConnection = {
  repositories: Array<{ fullName: string }>;
};

type UseRestoreGitHubSelectionOptions = {
  enabled: boolean;
  selectedRepo: SelectedRepo | null | undefined;
  connection: GitHubConnection | null | undefined;
  preference: CareerOpsDataSourcePreference | null;
  hasLocalSource: boolean;
  setActiveSource: (source: CareerOpsDataSource) => void;
};

export function useRestoreGitHubSelection({
  enabled,
  selectedRepo,
  connection,
  preference,
  hasLocalSource,
  setActiveSource,
}: UseRestoreGitHubSelectionOptions) {
  const utils = api.useUtils();
  const restoredRepoRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      restoredRepoRef.current = null;
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !selectedRepo || !connection) {
      return;
    }

    const isAccessible = connection.repositories.some(
      (repository) => repository.fullName === selectedRepo.fullName,
    );

    if (!isAccessible) {
      return;
    }

    if (restoredRepoRef.current === selectedRepo.fullName) {
      return;
    }

    restoredRepoRef.current = selectedRepo.fullName;

    if (preference === "local" && hasLocalSource) {
      void utils.github.getRepoData.prefetch(selectedRepo);
      return;
    }

    setActiveSource(toGitHubDataSource(selectedRepo));
    void utils.github.getRepoData.prefetch(selectedRepo);
  }, [
    connection,
    enabled,
    hasLocalSource,
    preference,
    selectedRepo,
    setActiveSource,
    utils,
  ]);
}
