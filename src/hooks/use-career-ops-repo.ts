"use client";

import { skipToken } from "@tanstack/react-query";
import { useCallback } from "react";

import { isSameSelectedRepo, toSelectedRepo } from "~/lib/career-ops/selected-repo";
import type { GitHubRepoSummary, SelectedRepo } from "~/lib/career-ops/types";
import { githubRepoDataQueryOptions } from "~/lib/cache/github-query-options";
import { api } from "~/trpc/react";

export function useSelectedRepoQuery() {
  return api.github.getSelectedRepo.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
}

export function usePersistSelectedRepo() {
  const utils = api.useUtils();

  const selectRepo = api.github.selectRepo.useMutation({
    onSuccess: async (selectedRepo) => {
      utils.github.getSelectedRepo.setData(undefined, selectedRepo);
      await utils.github.getRepoData.prefetch(selectedRepo);
    },
  });

  const persistRepo = useCallback(
    (repo: GitHubRepoSummary | SelectedRepo) => {
      const selectedRepo = "id" in repo ? toSelectedRepo(repo) : repo;

      if (isSameSelectedRepo(utils.github.getSelectedRepo.getData(), selectedRepo)) {
        void utils.github.getRepoData.prefetch(selectedRepo);
        return;
      }

      selectRepo.mutate(selectedRepo);
    },
    [selectRepo, utils],
  );

  return {
    selectRepo,
    persistRepo,
  };
}

export function useRepoDataQuery(selectedRepo: SelectedRepo | null | undefined) {
  return api.github.getRepoData.useQuery(selectedRepo ?? skipToken, githubRepoDataQueryOptions);
}
