const githubSuccessStatuses = new Set(["connected", "updated"]);

const githubStatusMessages: Record<string, string> = {
  connected:
    "Repository connected. Huntscope can now read only the repo you selected.",
  updated: "Repository access updated.",
  "already-connected":
    "This GitHub App installation is already linked to Huntscope.",
  "no-installation":
    "No Huntscope GitHub App installation was found on your GitHub account. Install the app first.",
  "sign-in-required": "Sign in before connecting a repository.",
  "missing-installation": "GitHub did not return an installation ID.",
  "missing-state": "GitHub did not return install state.",
  "expired-state": "The install link expired. Try connecting again.",
  "installation-forbidden":
    "The GitHub account you signed in with cannot access that app installation. Sign in with the same GitHub account you used during install, then connect again.",
  "no-repositories":
    "No repositories were selected. Pick one repo during install.",
  "callback-failed":
    "Could not verify the GitHub App installation. Try connecting again.",
  "github-account-required":
    "Sign in with GitHub before installing the Huntscope GitHub App.",
  "not-configured": "GitHub cloud sync is not configured on this deployment.",
};

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

export function isGitHubStatusError(status: string) {
  return !githubSuccessStatuses.has(status);
}

export function getGitHubStatusMessage(status?: string) {
  if (!status) {
    return undefined;
  }

  return githubStatusMessages[status];
}

export function getGitHubStatusTitle(status: string) {
  return githubStatusTitles[status] ?? "GitHub connection issue";
}
