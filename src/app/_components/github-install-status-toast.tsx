"use client";

import { XIcon } from "lucide-react";

import { useGitHubInstallStatus } from "~/hooks/use-github-install-status";
import {
  getGitHubStatusMessage,
  getGitHubStatusTitle,
  isGitHubStatusError,
} from "~/lib/github/install-status";
import { cn } from "~/lib/utils";

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
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-6">
      <div
        role={isError ? "alert" : "status"}
        aria-live={isError ? "assertive" : "polite"}
        className={cn(
          "animate-in fade-in-0 slide-in-from-bottom-4 pointer-events-auto flex w-full max-w-lg items-start gap-3 rounded-xl border p-4 shadow-2xl backdrop-blur-md duration-200",
          isError
            ? "border-destructive/40 bg-[#15162c]/95"
            : "border-emerald-400/30 bg-[#15162c]/95",
        )}
      >
        <div className="min-w-0 flex-1">
          {isError ? (
            <div className="flex flex-col gap-1 text-left">
              <p className="text-sm font-medium text-red-50">
                {getGitHubStatusTitle(status)}
              </p>
              <p className="text-sm text-red-100">{message}</p>
            </div>
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
