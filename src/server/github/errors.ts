import { TRPCError } from "@trpc/server";

import { isGitHubRateLimitError } from "~/server/github/client";

export function throwIfGitHubRateLimited(error: unknown): void {
  if (isGitHubRateLimitError(error)) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message:
        error instanceof Error
          ? error.message
          : "GitHub API rate limit reached. Please wait a few minutes and try again.",
    });
  }
}
