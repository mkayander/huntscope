import { headers } from "next/headers";

import { AppShell } from "~/app/_components/app-shell";
import { DashboardPage } from "~/app/_components/dashboard-page";
import { getSession } from "~/server/auth/session";
import { getHomeInitialState } from "~/server/home/initial-state";
import { prefetchGitHubSessionData } from "~/server/home/prefetch-github-session-data";
import { HydrateClient } from "~/trpc/server";

export default async function DashboardRoute() {
  const requestHeaders = await headers();
  const session = await getSession(requestHeaders);
  const initialState = await getHomeInitialState(requestHeaders);

  await prefetchGitHubSessionData(session);

  return (
    <HydrateClient>
      <AppShell initialState={initialState}>
        <DashboardPage />
      </AppShell>
    </HydrateClient>
  );
}
