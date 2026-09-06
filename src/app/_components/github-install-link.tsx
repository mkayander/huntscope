"use client";

import { type ComponentProps } from "react";

import { useGitHubInstallStatus } from "~/hooks/use-github-install-status";

type GitHubInstallLinkProps = ComponentProps<"a"> & {
  href?: string;
};

/**
 * Full-page link to the GitHub App install route. Uses a native anchor so the
 * browser follows the server redirect to github.com instead of Next.js RSC
 * fetch (which fails CORS on external redirects).
 */
export function GitHubInstallLink({
  href = "/api/github/install",
  onClick,
  ...props
}: GitHubInstallLinkProps) {
  const { clearGitHubInstallStatus } = useGitHubInstallStatus();

  return (
    <a
      href={href}
      onClick={(event) => {
        clearGitHubInstallStatus();
        onClick?.(event);
      }}
      {...props}
    />
  );
}
