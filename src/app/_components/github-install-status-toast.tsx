"use client";

import { XIcon } from "lucide-react";

import {
  getGitHubStatusMessage,
  isGitHubStatusError,
} from "~/app/_components/github-status-message";
import { ErrorAlert } from "~/app/_components/error-alert";
import { useGitHubInstallStatus } from "~/hooks/use-github-install-status";
import { cn } from "~/lib/utils";

const githubStatusTitles: Record<string, string> = {
  connected: "GitHub repository connected",
  updated: "GitHub repository updated",
  "already-connected": "GitHub already linked",
  "no-installation": "GitHub App not installed",
  "sign-in-required": "Sign in required",
  "missing-installation": "GitHub install incomplete",
  "missing-state": "GitHub install incomplete",
  "expired-state": "Install link expired",
  "installation-forbidden": "GitHub installation not accessible",
  "no-repositories": "No repository selected",
  "callback-failed": "GitHub install failed",
  "github-account-required": "GitHub sign-in required",
  "not-configured": "GitHub not configured",
};

function getGitHubStatusTitle(status: string) {
  return githubStatusTitles[status] ?? "GitHub connection issue";
}

/**
 * Fixed bottom toast for GitHub install / connection status. Does not affect
 * page layout (unlike the previous inline banner).
 */
export function GitHubInstallStatusToast() {
  const { status, clearGitHubInstallStatus } = useGitHubInstallStatus();

  if (!status) {
    return null;
  }

  const message = getGitHubStatusMessage(status);

  if (!message) {
    return null;
  }

  const isError = isGitHubStatusError(status);

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center p-4 sm:p-6"
    >
      <div
        className={cn(
          "animate-in fade-in-0 slide-in-from-bottom-4 pointer-events-auto flex w-full max-w-lg items-start gap-3 rounded-xl border p-4 shadow-2xl backdrop-blur-md duration-200",
          isError
            ? "border-destructive/40 bg-[#15162c]/95"
            : "border-emerald-400/30 bg-[#15162c]/95",
        )}
      >
        <div className="min-w-0 flex-1">
          {isError ? (
            <ErrorAlert
              title={getGitHubStatusTitle(status)}
              message={message}
            />
          ) : (
            <div className="flex flex-col gap-1 text-left">
              <p className="text-sm font-medium text-emerald-100">
                {getGitHubStatusTitle(status)}
              </p>
              <p className="text-sm text-emerald-200/90">{message}</p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={clearGitHubInstallStatus}
          className="shrink-0 rounded-md p-1 text-white/50 transition-colors hover:bg-white/10 hover:text-white/85"
          aria-label="Dismiss"
        >
          <XIcon className="size-4" />
        </button>
      </div>
    </div>
  );
}
