import "server-only";

import { getSession } from "~/server/auth/session";
import type { HomeInitialState } from "~/lib/home/initial-state";

export async function getHomeInitialState(
  headers: Headers,
): Promise<HomeInitialState> {
  const session = await getSession(headers);
  const isSignedIn = Boolean(session?.user);

  return {
    isSignedIn,
    userLabel: session?.user?.name ?? session?.user?.email ?? null,
    showDashboard: isSignedIn,
  };
}
