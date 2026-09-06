import { createPrivateKey } from "node:crypto";

import { SignJWT } from "jose";

import { env } from "~/env";

function getPrivateKey() {
  const pem = env.GITHUB_APP_PRIVATE_KEY.replace(/\\n/g, "\n");
  return createPrivateKey(pem);
}

export async function createGitHubAppJwt(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  return new SignJWT({})
    .setProtectedHeader({ alg: "RS256" })
    .setIssuedAt(now)
    .setExpirationTime(now + 9 * 60)
    .setIssuer(env.GITHUB_APP_ID)
    .sign(getPrivateKey());
}
