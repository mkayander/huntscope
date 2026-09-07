import "server-only";

import type { getSession } from "~/server/auth/session";
import { getInstallationConnection } from "~/server/github/installation-store";
import { readSelectedRepoForUser } from "~/server/github/resolve-selected-repo";
import { api } from "~/trpc/server";

type Session = Awaited<ReturnType<typeof getSession>>;

export async function prefetchGitHubSessionData(session: Session) {
  if (!session?.user) {
    return;
  }

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
