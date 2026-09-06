import { NextResponse } from "next/server";

import { auth } from "~/server/auth";
import {
  connectInstallationForUser,
  syncInstallationFromGitHub,
} from "~/server/github/connect-installation";
import { isGitHubAppConfigured } from "~/server/github/config";
import { consumeInstallState } from "~/server/github/installation-store";
import { getGitHubUserAccessToken } from "~/server/github/user-access-token";
import type { ConnectInstallationErrorCode } from "~/server/github/connect-installation";

function redirectWithMessage(request: Request, message: string) {
  const url = new URL("/", request.url);
  url.searchParams.set("github", message);
  return NextResponse.redirect(url);
}

function statusFromConnectError(code: ConnectInstallationErrorCode): string {
  switch (code) {
    case "github-account-required":
      return "github-account-required";
    case "installation-forbidden":
      return "installation-forbidden";
    case "no-repositories":
      return "no-repositories";
    case "no-installation":
      return "no-installation";
  }
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

  const accessToken = await getGitHubUserAccessToken(request.headers);

  if (!accessToken) {
    return redirectWithMessage(request, "github-account-required");
  }

  try {
    if (installationId && !Number.isNaN(installationId)) {
      if (!stateNonce) {
        return redirectWithMessage(request, "missing-state");
      }

      const installState = await consumeInstallState(session.user.id);

      if (installState?.nonce !== stateNonce) {
        return redirectWithMessage(request, "expired-state");
      }

      const result = await connectInstallationForUser(
        session.user.id,
        installationId,
        accessToken,
        setupAction === "update" ? "updated" : "connected",
      );

      if (!result.ok) {
        return redirectWithMessage(
          request,
          statusFromConnectError(result.code),
        );
      }

      return redirectWithMessage(request, result.action);
    }

    const syncResult = await syncInstallationFromGitHub(
      session.user.id,
      accessToken,
    );

    if (!syncResult.ok) {
      return redirectWithMessage(
        request,
        statusFromConnectError(syncResult.code),
      );
    }

    return redirectWithMessage(request, syncResult.action);
  } catch (error) {
    console.error("GitHub installation callback failed:", error);
    return redirectWithMessage(request, "callback-failed");
  }
}
