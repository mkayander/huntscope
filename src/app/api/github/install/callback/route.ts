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
import { DASHBOARD_PATH, LANDING_PATH } from "~/lib/routes";

function redirectWithMessage(
  request: Request,
  message: string,
  destination: string,
) {
  const url = new URL(destination, request.url);
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
    return redirectWithMessage(request, "not-configured", LANDING_PATH);
  }

  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    return redirectWithMessage(request, "sign-in-required", LANDING_PATH);
  }

  const url = new URL(request.url);
  const installationId = Number(url.searchParams.get("installation_id"));
  const setupAction = url.searchParams.get("setup_action");
  const stateNonce = url.searchParams.get("state");

  const accessToken = await getGitHubUserAccessToken(request.headers);

  if (!accessToken) {
    return redirectWithMessage(
      request,
      "github-account-required",
      LANDING_PATH,
    );
  }

  try {
    if (installationId && !Number.isNaN(installationId)) {
      if (!stateNonce) {
        return redirectWithMessage(request, "missing-state", LANDING_PATH);
      }

      const installState = await consumeInstallState(session.user.id);

      if (installState?.nonce !== stateNonce) {
        return redirectWithMessage(request, "expired-state", LANDING_PATH);
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
          LANDING_PATH,
        );
      }

      return redirectWithMessage(request, result.action, DASHBOARD_PATH);
    }

    const syncResult = await syncInstallationFromGitHub(
      session.user.id,
      accessToken,
    );

    if (!syncResult.ok) {
      return redirectWithMessage(
        request,
        statusFromConnectError(syncResult.code),
        LANDING_PATH,
      );
    }

    return redirectWithMessage(request, syncResult.action, DASHBOARD_PATH);
  } catch (error) {
    console.error("GitHub installation callback failed:", error);
    return redirectWithMessage(request, "callback-failed", LANDING_PATH);
  }
}
