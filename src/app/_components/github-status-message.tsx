import { ErrorAlert } from "~/app/_components/error-alert";
import { cn } from "~/lib/utils";

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

function getGitHubStatusTitle(status: string) {
  return githubStatusTitles[status] ?? "GitHub connection issue";
}

type GitHubStatusMessageProps = {
  status?: string;
  className?: string;
  onDismiss?: () => void;
};

export function GitHubStatusMessage({
  status,
  className,
  onDismiss,
}: GitHubStatusMessageProps) {
  if (!status) {
    return null;
  }

  const message = getGitHubStatusMessage(status);

  if (!message) {
    return null;
  }

  const dismissButton = onDismiss ? (
    <button
      type="button"
      onClick={onDismiss}
      className="text-sm text-white/60 underline-offset-4 transition-colors hover:text-white/85 hover:underline"
    >
      Dismiss
    </button>
  ) : null;

  if (isGitHubStatusError(status)) {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        <ErrorAlert title={getGitHubStatusTitle(status)} message={message} />
        {dismissButton}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <p className="text-center text-sm text-emerald-200">{message}</p>
      {dismissButton}
    </div>
  );
}
