import { NextResponse } from "next/server";

import { auth } from "~/server/auth";
import {
  listInstallationRepositories,
  verifyUserInstallationAccess,
} from "~/server/github/api";
import {
  isGitHubAppConfigured,
} from "~/server/github/config";
import {
  consumeInstallState,
  setInstallationConnection,
} from "~/server/github/installation-store";

function redirectWithMessage(request: Request, message: string) {
  const url = new URL("/", request.url);
  url.searchParams.set("github", message);
  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  if (!isGitHubAppConfigured()) {
    return redirectWithMessage(request, "not-configured");
  }

  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    return redirectWithMessage(request, "sign-in-required");
  }

  const url = new URL(request.url);
  const installationId = Number(url.searchParams.get("installation_id"));
  const setupAction = url.searchParams.get("setup_action");
  const stateNonce = url.searchParams.get("state");

  if (!installationId || Number.isNaN(installationId)) {
    return redirectWithMessage(request, "missing-installation");
  }

  if (!stateNonce) {
    return redirectWithMessage(request, "missing-state");
  }

  const installState = await consumeInstallState(session.user.id);

  if (installState?.nonce !== stateNonce) {
    return redirectWithMessage(request, "expired-state");
  }

  try {
    const accessToken = await auth.api.getAccessToken({
      headers: request.headers,
      body: {
        useAccountCookie: true,
      },
    });

    const userCanAccessInstallation = await verifyUserInstallationAccess(
      installationId,
      accessToken.accessToken,
    );

    if (!userCanAccessInstallation) {
      return redirectWithMessage(request, "installation-forbidden");
    }

    const repositories = await listInstallationRepositories(installationId);

    if (repositories.length === 0) {
      return redirectWithMessage(request, "no-repositories");
    }

    await setInstallationConnection({
      installationId,
      userId: session.user.id,
      repositories,
      connectedAt: new Date().toISOString(),
    });

    const action = setupAction === "update" ? "updated" : "connected";
    return redirectWithMessage(request, action);
  } catch (error) {
    console.error("GitHub installation callback failed:", error);
    return redirectWithMessage(request, "callback-failed");
  }
}
