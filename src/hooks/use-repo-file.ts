"use client";

import { useQuery } from "@tanstack/react-query";

import type { CareerOpsDataSource } from "~/lib/career-ops/data-source";
import {
  readLocalRepoFile,
  type RepoFilePayload,
} from "~/lib/local-repo/repo-file-access";
import {
  GITHUB_CACHE_GC_TIME_MS,
  GITHUB_CACHE_STALE_TIME_MS,
} from "~/lib/cache/github-query-options";
import { api } from "~/trpc/react";

export function useRepoFile(
  dataSource: CareerOpsDataSource | null,
  path: string | null,
) {
  const githubRepo = dataSource?.kind === "github" ? dataSource.repo : null;
  const localDirectoryHandle =
    dataSource?.kind === "local" ? dataSource.directoryHandle : null;

  const githubQuery = api.github.getRepoFile.useQuery(
    {
      repo: githubRepo ?? { owner: "", name: "", fullName: "" },
      path: path ?? "",
    },
    {
      enabled: githubRepo != null && Boolean(path),
      staleTime: GITHUB_CACHE_STALE_TIME_MS,
      gcTime: GITHUB_CACHE_GC_TIME_MS,
      refetchOnWindowFocus: false,
    },
  );

  const localQuery = useQuery({
    queryKey: ["local-repo-file", localDirectoryHandle?.name, path],
    queryFn: async (): Promise<RepoFilePayload> => {
      if (!localDirectoryHandle || !path) {
        throw new Error("Local file is not available.");
      }

      const payload = await readLocalRepoFile(localDirectoryHandle, path);

      if (!payload) {
        throw new Error(`Could not read ${path}.`);
      }

      return payload;
    },
    enabled: localDirectoryHandle != null && Boolean(path),
    staleTime: GITHUB_CACHE_STALE_TIME_MS,
    gcTime: GITHUB_CACHE_GC_TIME_MS,
    refetchOnWindowFocus: false,
  });

  if (!dataSource || !path) {
    return {
      data: undefined,
      isLoading: false,
      error: null as Error | null,
    };
  }

  if (dataSource.kind === "github") {
    return {
      data: githubQuery.data,
      isLoading: githubQuery.isLoading,
      error: githubQuery.error,
    };
  }

  return {
    data: localQuery.data,
    isLoading: localQuery.isLoading,
    error: localQuery.error,
  };
}
