import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

import { auth } from "~/server/auth";
import {
  isGitHubAppConfigured,
  requireGitHubAppConfig,
} from "~/server/github/config";
import { setInstallState } from "~/server/github/installation-store";

export async function GET(request: Request) {
  if (!isGitHubAppConfigured()) {
    return NextResponse.redirect(new URL("/?github=not-configured", request.url));
  }

  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    return NextResponse.redirect(new URL("/", request.url));
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
