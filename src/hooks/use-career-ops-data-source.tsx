"use client";

import { useQuery } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  useRepoDataQuery,
  useSelectedRepoQuery,
} from "~/hooks/use-career-ops-repo";
import { useRestoreGitHubSelection } from "~/hooks/use-restore-github-selection";
import {
  type CareerOpsDataSource,
  type CareerOpsDataSourcePreference,
  readDataSourcePreference,
  toGitHubDataSource,
  toLocalDataSourceFromConnectedRepo,
  writeDataSourcePreference,
} from "~/lib/career-ops/data-source";
import {
  GITHUB_CACHE_GC_TIME_MS,
  GITHUB_CACHE_STALE_TIME_MS,
} from "~/lib/cache/github-query-options";
import { authClient } from "~/lib/auth-client";
import { loadCareerOpsFromLocalSource } from "~/lib/local-repo/load-career-ops-data";
import { useLocalRepo } from "~/lib/local-repo/use-local-repo";
import { useHomeShell } from "~/hooks/use-home-shell";
import { api } from "~/trpc/react";

export function useLocalCareerOpsData(source: CareerOpsDataSource | null) {
  const localSource = source?.kind === "local" ? source : null;

  return useQuery({
    queryKey: [
      "local-career-ops",
      localSource?.sessionId,
      localSource?.directoryName,
    ],
    queryFn: async () => {
      if (!localSource) {
        throw new Error("No local folder is connected.");
      }

      return loadCareerOpsFromLocalSource({
        directoryHandle: localSource.directoryHandle,
        fileHandle: localSource.fileHandle,
      });
    },
    enabled: localSource != null,
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
  const { isSignedIn: initialIsSignedIn } = useHomeShell();
  const { data: session } = authClient.useSession();
  const isSignedIn = Boolean(session?.user) || initialIsSignedIn;
  const [preference, setPreference] =
    useState<CareerOpsDataSourcePreference | null>(() =>
      readDataSourcePreference(),
    );

  const preferLocalSource = useCallback(() => {
    writeDataSourcePreference("local");
    setPreference("local");
  }, []);

  const localRepo = useLocalRepo({ onConnected: preferLocalSource });
  const connectionQuery = api.github.getConnection.useQuery(undefined, {
    enabled: isSignedIn,
    refetchOnWindowFocus: false,
  });
  const selectedRepoQuery = useSelectedRepoQuery(isSignedIn);

  const localSource = useMemo(() => {
    if (localRepo.state.status !== "connected" || !localRepo.sessionId) {
      return null;
    }

    return toLocalDataSourceFromConnectedRepo({
      preview: localRepo.state.preview,
      sessionId: localRepo.sessionId,
      directoryHandle: localRepo.directoryHandle,
      fileHandle: localRepo.launchedFileHandle,
    });
  }, [localRepo]);

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

  const setActiveSource = useCallback((source: CareerOpsDataSource) => {
    writeDataSourcePreference(source.kind);
    setPreference(source.kind);
  }, []);

  useRestoreGitHubSelection({
    enabled: isSignedIn,
    selectedRepo: selectedRepoQuery.data,
    connection: connectionQuery.data ?? undefined,
    preference,
    hasLocalSource: localSource != null,
    setActiveSource,
  });

  const localDataQuery = useLocalCareerOpsData(
    activeSource?.kind === "local" ? activeSource : null,
  );

  return {
    localRepo,
    connectionQuery,
    selectedRepoQuery,
    localSource,
    githubSource,
    activeSource,
    setActiveSource,
    localDataQuery,
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

export function useCareerOpsRawData(source: CareerOpsDataSource | null) {
  const githubRepo = source?.kind === "github" ? source.repo : null;
  const localSource = source?.kind === "local" ? source : null;

  const githubData = useRepoDataQuery(githubRepo);
  const localData = useLocalCareerOpsData(localSource);

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
