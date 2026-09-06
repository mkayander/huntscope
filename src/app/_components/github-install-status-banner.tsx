"use client";

import { GitHubStatusMessage } from "~/app/_components/github-status-message";
import { useGitHubInstallStatus } from "~/hooks/use-github-install-status";
import { cn } from "~/lib/utils";

type GitHubInstallStatusBannerProps = {
  className?: string;
};

export function GitHubInstallStatusBanner({
  className,
}: GitHubInstallStatusBannerProps) {
  const { status, clearGitHubInstallStatus } = useGitHubInstallStatus();

  if (!status) {
    return null;
  }

  return (
    <GitHubStatusMessage
      status={status}
      className={className}
      onDismiss={clearGitHubInstallStatus}
    />
  );
}
