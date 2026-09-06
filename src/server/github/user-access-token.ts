import "server-only";

import { auth } from "~/server/auth";

export async function getGitHubUserAccessToken(
  headers: Headers,
): Promise<string | null> {
  const { accessToken } = await auth.api.getAccessToken({
    headers,
    body: {
      useAccountCookie: true,
    },
  });

  return accessToken ?? null;
}
