import { headers } from "next/headers";

import { AuthButton } from "~/app/_components/auth-button";
import { Dashboard } from "~/app/_components/dashboard";
import { DashboardAmbientBackground } from "~/app/_components/dashboard-ambient-background";
import {
  LandingBackgroundCanvas,
  LandingBackgroundProvider,
} from "~/app/_components/landing-background/landing-background-shell";
import { getSession } from "~/server/auth/session";
import { getSelectedRepoFromCookies } from "~/server/github/selected-repo";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  const requestHeaders = await headers();
  const session = await getSession(requestHeaders);

  if (session?.user) {
    await api.github.getSelectedRepo.prefetch();

    const selectedRepo = await getSelectedRepoFromCookies();
    if (selectedRepo) {
      await api.github.getRepoData.prefetch(selectedRepo);
    }
  }

  return (
    <HydrateClient>
      {!session?.user ? (
        <LandingBackgroundProvider>
          <LandingBackgroundCanvas />
          <main className="relative z-10 flex min-h-screen flex-col items-center text-white">
            <div className="container flex flex-col items-center gap-10 px-4 py-16 pb-28">
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
            </div>
          </main>
        </LandingBackgroundProvider>
      ) : (
        <main className="relative z-10 flex min-h-screen flex-col items-center text-white">
          <DashboardAmbientBackground />
          <div className="relative z-10 mx-auto flex w-full max-w-screen-2xl flex-col items-center gap-10 px-4 py-16 sm:px-6 lg:px-8">
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

            <Dashboard />
          </div>
        </main>
      )}
    </HydrateClient>
  );
}
