import { headers } from "next/headers";

import { HomeContent } from "~/app/_components/home-content";
import { getSession } from "~/server/auth/session";
import { isGitHubConfigured } from "~/server/github/config";
import { getSelectedRepoFromCookies } from "~/server/github/selected-repo";
import { api, HydrateClient } from "~/trpc/server";

type HomeProps = {
  searchParams: Promise<{ github?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const requestHeaders = await headers();
  const session = await getSession(requestHeaders);
  const { github: githubStatus } = await searchParams;
  const githubConfigured = isGitHubConfigured();

  if (session?.user) {
    void api.github.getConnection.prefetch();
    void api.github.getSelectedRepo.prefetch();

    const selectedRepo = await getSelectedRepoFromCookies();
    if (selectedRepo) {
      void api.github.getRepoData.prefetch(selectedRepo);
    }
  }

  return (
    <HydrateClient>
      <HomeContent
        githubStatus={githubStatus}
        githubConfigured={githubConfigured}
      />
    </HydrateClient>
  );
}
