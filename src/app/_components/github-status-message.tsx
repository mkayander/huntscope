const githubStatusMessages: Record<string, string> = {
  connected:
    "Repository connected. Huntscope can now read only the repo you selected.",
  updated: "Repository access updated.",
  "sign-in-required": "Sign in before connecting a repository.",
  "missing-installation": "GitHub did not return an installation ID.",
  "missing-state": "GitHub did not return install state.",
  "expired-state": "The install link expired. Try connecting again.",
  "installation-forbidden":
    "That GitHub App installation is not accessible with your signed-in account.",
  "no-repositories":
    "No repositories were selected. Pick one repo during install.",
  "callback-failed": "Could not verify the GitHub App installation.",
  "github-account-required":
    "Sign in with GitHub before installing the Huntscope GitHub App.",
  "not-configured": "GitHub cloud sync is not configured on this deployment.",
};

export function getGitHubStatusMessage(status?: string) {
  if (!status) {
    return undefined;
  }

  return githubStatusMessages[status];
}

type GitHubStatusMessageProps = {
  status?: string;
  className?: string;
};

export function GitHubStatusMessage({
  status,
  className = "text-center text-sm text-emerald-200",
}: GitHubStatusMessageProps) {
  const message = getGitHubStatusMessage(status);

  if (!message) {
    return null;
  }

  return <p className={className}>{message}</p>;
}
