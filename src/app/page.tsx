import { headers } from "next/headers";

import { AuthButton } from "~/app/_components/auth-button";
import { Dashboard } from "~/app/_components/dashboard";
import { getSession } from "~/server/auth/session";
import { getSelectedRepoFromCookies } from "~/server/github/selected-repo";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  const requestHeaders = await headers();
  const session = await getSession(requestHeaders);

  if (session?.user) {
    void api.github.listRepos.prefetch();
    void api.github.getSelectedRepo.prefetch();

    const selectedRepo = await getSelectedRepoFromCookies();
    if (selectedRepo) {
      void api.github.getRepoData.prefetch();
    }
  }

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center gap-10 px-4 py-16">
          <div className="flex flex-col items-center gap-4 text-center">
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
              Hunt<span className="text-[hsl(280,100%,70%)]">scope</span>
            </h1>
            <p className="max-w-xl text-lg text-white/80">
              Analytics for your private job-search repo on GitHub. Connect a
              companion data repository and explore your pipeline, tracker, and
              reports — read-only, repo-first.
            </p>
            <p className="text-sm text-white/50">
              Stateless auth — sessions and GitHub tokens live in encrypted
              cookies; no database required.
            </p>
          </div>

          <AuthButton />

          {session?.user ? <Dashboard /> : null}
        </div>
      </main>
    </HydrateClient>
  );
}
