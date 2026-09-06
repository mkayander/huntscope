import { headers } from "next/headers";

import { HomeContent } from "~/app/_components/home-content";
import { getSession } from "~/server/auth/session";
import { getHomeInitialState } from "~/server/home/initial-state";
import { isGitHubConfigured } from "~/server/github/config";
import { getInstallationConnection } from "~/server/github/installation-store";
import { readSelectedRepoForUser } from "~/server/github/resolve-selected-repo";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  const requestHeaders = await headers();
  const session = await getSession(requestHeaders);
  const initialState = await getHomeInitialState(requestHeaders);
  const githubConfigured = isGitHubConfigured();

  if (session?.user) {
    void api.github.getConnection.prefetch();
    void api.github.getSelectedRepo.prefetch();

    const [selectedRepo, connection] = await Promise.all([
      readSelectedRepoForUser(session.user.id),
      getInstallationConnection(session.user.id),
    ]);

    if (connection) {
      void api.github.listRepos.prefetch();
    }

    if (selectedRepo) {
      void api.github.getRepoData.prefetch(selectedRepo);
    }
  }

  return (
    <HydrateClient>
      <HomeContent
        githubConfigured={githubConfigured}
        initialState={initialState}
      />
    </HydrateClient>
  );
}
