import type { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "~/server/api/root";

export const GITHUB_CACHE_STALE_TIME_MS = 30 * 60 * 1000;
export const GITHUB_CACHE_GC_TIME_MS = 24 * 60 * 60 * 1000;

type TrpcError = TRPCClientErrorLike<AppRouter>;

export function isGitHubRateLimitTrpcError(error: TrpcError): boolean {
  return error.data?.code === "TOO_MANY_REQUESTS";
}

function isRateLimitError(error: TrpcError): boolean {
  return isGitHubRateLimitTrpcError(error);
}

const githubQuerySharedOptions = {
  staleTime: GITHUB_CACHE_STALE_TIME_MS,
  gcTime: GITHUB_CACHE_GC_TIME_MS,
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
  placeholderData: <T,>(previousData: T | undefined) => previousData,
  retry: (failureCount: number, error: TrpcError) => {
    if (isRateLimitError(error)) {
      return false;
    }

    return failureCount < 1;
  },
};

export const githubListReposQueryOptions = {
  ...githubQuerySharedOptions,
};

export function withClientOnlyQuery<T extends Record<string, unknown>>(
  options: T,
  enabled: boolean,
): T & { enabled: boolean } {
  return {
    ...options,
    enabled,
  };
}

export const githubRepoDataQueryOptions = {
  ...githubQuerySharedOptions,
};
