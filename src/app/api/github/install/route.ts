import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

import { env } from "~/env";
import { auth } from "~/server/auth";
import { setInstallState } from "~/server/github/installation-store";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  await setInstallState({
    userId: session.user.id,
    nonce: randomUUID(),
  });

  const installUrl = new URL(
    `https://github.com/apps/${env.GITHUB_APP_SLUG}/installations/new`,
  );
  installUrl.searchParams.set("state", session.user.id);

  return NextResponse.redirect(installUrl);
}
