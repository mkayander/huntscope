import { headers } from "next/headers";

import { AuthButton } from "~/app/_components/auth-button";
import { Dashboard } from "~/app/_components/dashboard";
import { DashboardAmbientBackground } from "~/app/_components/dashboard-ambient-background";
import { DataSourcePanel } from "~/app/_components/data-source-panel";
import {
  LandingBackgroundCanvas,
  LandingBackgroundProvider,
} from "~/app/_components/landing-background/landing-background-shell";
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
      {!session?.user ? (
        <LandingBackgroundProvider>
          <LandingBackgroundCanvas />
          <main className="relative z-10 flex min-h-screen flex-col items-center text-white">
            <div className="container flex flex-col items-center gap-10 px-4 py-16 pb-28">
              <div className="flex flex-col items-center gap-4 text-center">
                <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
                  Hunt<span className="text-[hsl(280,100%,70%)]">scope</span>
                </h1>
                <p className="max-w-2xl text-lg text-white/80">
                  Analytics for your job-search data repository. Open a local
                  folder from disk or optionally connect a private GitHub repo —
                  read-only, repo-first.
                </p>
                <p className="text-sm text-white/50">
                  Local folders stay on your machine. GitHub access is optional
                  and scoped to repositories you select.
                </p>
              </div>

              <AuthButton />
              <DataSourcePanel
                githubStatus={githubStatus}
                githubConfigured={githubConfigured}
              />
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
                Analytics for your job-search data repository. Connect through
                the GitHub App or open a local folder — read-only, repo-first.
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
