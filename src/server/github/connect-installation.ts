import "server-only";

import {
  getAppInstallationForUser,
  getGitHubUserProfile,
  listInstallationRepositories,
  verifyUserCanAccessInstallation,
} from "~/server/github/api";

import { requireGitHubAppConfig } from "~/server/github/config";

import { setInstallationConnection } from "~/server/github/installation-store";

import type { ConnectedRepository } from "~/server/github/types";

export type ConnectInstallationErrorCode =
  | "github-account-required"
  | "installation-forbidden"
  | "no-installation"
  | "no-repositories";

export type ConnectInstallationResult =
  | {
      ok: true;

      installationId: number;

      repositories: ConnectedRepository[];

      action: "connected" | "updated";
    }
  | {
      ok: false;

      code: ConnectInstallationErrorCode;
    };

export async function connectInstallationForUser(
  userId: string,

  installationId: number,

  accessToken: string,

  action: "connected" | "updated" = "connected",
): Promise<ConnectInstallationResult> {
  const profile = await getGitHubUserProfile(accessToken);

  const userCanAccessInstallation = await verifyUserCanAccessInstallation(
    installationId,

    profile.login,

    accessToken,
  );

  if (!userCanAccessInstallation) {
    return { ok: false, code: "installation-forbidden" };
  }

  const repositories = await listInstallationRepositories(installationId);

  if (repositories.length === 0) {
    return { ok: false, code: "no-repositories" };
  }

  await setInstallationConnection({
    installationId,

    userId,

    repositories,

    connectedAt: new Date().toISOString(),
  });

  return {
    ok: true,

    installationId,

    repositories,

    action,
  };
}

export async function syncInstallationFromGitHub(
  userId: string,

  accessToken: string,
): Promise<ConnectInstallationResult> {
  const { appId } = requireGitHubAppConfig();

  const profile = await getGitHubUserProfile(accessToken);

  const installation = await getAppInstallationForUser(profile.login);

  if (!installation || String(installation.app_id) !== appId) {
    return { ok: false, code: "no-installation" };
  }

  return connectInstallationForUser(
    userId,

    installation.id,

    accessToken,

    "connected",
  );
}
