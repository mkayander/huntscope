import { createPrivateKey } from "node:crypto";

import { SignJWT } from "jose";

import { requireGitHubAppConfig } from "~/server/github/config";

function getPrivateKey() {
  const { privateKey } = requireGitHubAppConfig();
  const pem = privateKey.replace(/\\n/g, "\n");
  return createPrivateKey(pem);
}

export async function createGitHubAppJwt(): Promise<string> {
  const { appId } = requireGitHubAppConfig();
  const now = Math.floor(Date.now() / 1000);

  return new SignJWT({})
    .setProtectedHeader({ alg: "RS256" })
    .setIssuedAt(now)
    .setExpirationTime(now + 9 * 60)
    .setIssuer(appId)
    .sign(getPrivateKey());
}
