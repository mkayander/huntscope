import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

import { auth } from "~/server/auth";
import { syncInstallationFromGitHub } from "~/server/github/connect-installation";
import {
  isGitHubAppConfigured,
  requireGitHubAppConfig,
} from "~/server/github/config";
import {
  getInstallationConnection,
  setInstallState,
} from "~/server/github/installation-store";
import { getGitHubUserAccessToken } from "~/server/github/user-access-token";

function redirectHome(request: Request, githubStatus?: string) {
  const url = new URL("/", request.url);
  if (githubStatus) {
    url.searchParams.set("github", githubStatus);
  }
  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  if (!isGitHubAppConfigured()) {
    return redirectHome(request, "not-configured");
  }

  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    return redirectHome(request);
  }

  const existingConnection = await getInstallationConnection(session.user.id);

  // Only auto-sync when there is no stored connection (e.g. user installed the
  // app before signing in). Existing connections use the GitHub install flow to
  // add/remove repositories or recreate the installation.
  if (!existingConnection) {
    const accessToken = await getGitHubUserAccessToken(request.headers);

    if (accessToken) {
      try {
        const syncResult = await syncInstallationFromGitHub(
          session.user.id,
          accessToken,
        );

        if (syncResult.ok) {
          return redirectHome(request, syncResult.action);
        }
      } catch (error) {
        console.error("GitHub installation sync failed:", error);
      }
    }
  }

  const { slug } = requireGitHubAppConfig();
  const nonce = randomUUID();

  await setInstallState({
    userId: session.user.id,
    nonce,
  });

  const installUrl = new URL(
    `https://github.com/apps/${slug}/installations/new`,
  );
  installUrl.searchParams.set("state", nonce);

  return NextResponse.redirect(installUrl);
}
