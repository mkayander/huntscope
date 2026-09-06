import type { QueryClient } from "@tanstack/react-query";

import { authClient } from "~/lib/auth-client";
import { clearGitHubViewState } from "~/lib/auth/sign-out-cleanup";

type PerformSignOutOptions = {
  queryClient: QueryClient;
  clearGitHubInstallStatus?: () => void;
  /** When true, drop cached GitHub queries and persisted repo data. */
  clearGitHubCache?: boolean;
};

type PerformSignOutResult = { ok: true } | { ok: false; errorMessage: string };

/** Signs out and optionally clears client-side GitHub view state. */
export async function performSignOut({
  queryClient,
  clearGitHubInstallStatus,
  clearGitHubCache = false,
}: PerformSignOutOptions): Promise<PerformSignOutResult> {
  const { error } = await authClient.signOut();

  if (error) {
    return {
      ok: false,
      errorMessage: error.message ?? "Sign-out failed. Try again.",
    };
  }

  clearGitHubInstallStatus?.();

  if (clearGitHubCache) {
    try {
      await clearGitHubViewState(queryClient);
    } catch {
      // Sign-out already succeeded; avoid surfacing cleanup failures.
    }
  }

  return { ok: true };
}
