"use client";

import { useQuery } from "@tanstack/react-query";
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  useRepoDataQuery,
  useSelectedRepoQuery,
} from "~/hooks/use-career-ops-repo";
import {
  type CareerOpsDataSource,
  type CareerOpsDataSourcePreference,
  toGitHubDataSource,
  toLocalDataSource,
  writeDataSourcePreference,
} from "~/lib/career-ops/data-source";
import {
  GITHUB_CACHE_GC_TIME_MS,
  GITHUB_CACHE_STALE_TIME_MS,
} from "~/lib/cache/github-query-options";
import { authClient } from "~/lib/auth-client";
import { loadCareerOpsFromDirectory } from "~/lib/local-repo/load-career-ops-data";
import { useLocalRepo } from "~/lib/local-repo/use-local-repo";

function readDataSourcePreference(): CareerOpsDataSourcePreference | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.sessionStorage.getItem(
    "huntscope.data-source-preference",
  );

  if (value === "local" || value === "github") {
    return value;
  }

  return null;
}

export function useLocalCareerOpsData(
  directoryHandle: FileSystemDirectoryHandle | null,
  refreshToken?: string,
) {
  return useQuery({
    queryKey: ["local-career-ops", directoryHandle?.name, refreshToken],
    queryFn: async () => {
      if (!directoryHandle) {
        throw new Error("No local folder is connected.");
      }

      return loadCareerOpsFromDirectory(directoryHandle);
    },
    enabled: directoryHandle != null,
    staleTime: GITHUB_CACHE_STALE_TIME_MS,
    gcTime: GITHUB_CACHE_GC_TIME_MS,
    refetchOnWindowFocus: false,
  });
}

type CareerOpsDataSourceContextValue = ReturnType<
  typeof useCareerOpsDataSourceState
>;

const CareerOpsDataSourceContext =
  createContext<CareerOpsDataSourceContextValue | null>(null);

function useCareerOpsDataSourceState() {
  const { data: session } = authClient.useSession();
  const isSignedIn = Boolean(session?.user);
  const localRepo = useLocalRepo();
  const selectedRepoQuery = useSelectedRepoQuery(isSignedIn);
  const [preference, setPreference] =
    useState<CareerOpsDataSourcePreference | null>(() =>
      readDataSourcePreference(),
    );

  const localDirectoryHandle =
    localRepo.state.status === "connected" &&
    localRepo.state.preview.source === "directory"
      ? localRepo.directoryHandle
      : null;

  const localSource = useMemo(
    () =>
      localDirectoryHandle ? toLocalDataSource(localDirectoryHandle) : null,
    [localDirectoryHandle],
  );

  const githubSource = useMemo(
    () =>
      selectedRepoQuery.data
        ? toGitHubDataSource(selectedRepoQuery.data)
        : null,
    [selectedRepoQuery.data],
  );

  const activeSource = useMemo((): CareerOpsDataSource | null => {
    if (preference === "local" && localSource) {
      return localSource;
    }

    if (preference === "github" && githubSource) {
      return githubSource;
    }

    if (localSource) {
      return localSource;
    }

    if (githubSource) {
      return githubSource;
    }

    return null;
  }, [githubSource, localSource, preference]);

  const setActiveSource = (source: CareerOpsDataSource) => {
    writeDataSourcePreference(source.kind);
    setPreference(source.kind);
  };

  const localRefreshToken =
    localRepo.state.status === "connected"
      ? localRepo.state.preview.lastRefreshedAt
      : undefined;

  const localDataQuery = useLocalCareerOpsData(
    activeSource?.kind === "local" ? activeSource.directoryHandle : null,
    localRefreshToken,
  );

  return {
    localRepo,
    selectedRepoQuery,
    localSource,
    githubSource,
    activeSource,
    setActiveSource,
    localDataQuery,
    localRefreshToken,
    hasLocalSource: localSource != null,
    hasGitHubSource: githubSource != null,
    canShowDashboard: localSource != null || githubSource != null,
  };
}

export function CareerOpsDataSourceProvider({
  children,
}: {
  children: ReactNode;
}) {
  const value = useCareerOpsDataSourceState();

  return (
    <CareerOpsDataSourceContext.Provider value={value}>
      {children}
    </CareerOpsDataSourceContext.Provider>
  );
}

export function useCareerOpsDataSource() {
  const context = useContext(CareerOpsDataSourceContext);

  if (!context) {
    throw new Error(
      "useCareerOpsDataSource must be used within CareerOpsDataSourceProvider",
    );
  }

  return context;
}

export function useCareerOpsRawData(
  source: CareerOpsDataSource | null,
  localRefreshToken?: string,
) {
  const githubRepo = source?.kind === "github" ? source.repo : null;
  const localDirectoryHandle =
    source?.kind === "local" ? source.directoryHandle : null;

  const githubData = useRepoDataQuery(githubRepo);
  const localData = useLocalCareerOpsData(
    localDirectoryHandle,
    localRefreshToken,
  );

  if (!source) {
    return {
      raw: undefined,
      isLoading: false,
      error: null as Error | null,
    };
  }

  if (source.kind === "github") {
    return {
      raw: githubData.data,
      isLoading: githubData.isLoading,
      error: githubData.error,
    };
  }

  return {
    raw: localData.data,
    isLoading: localData.isLoading,
    error: localData.error,
  };
}
