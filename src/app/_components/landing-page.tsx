"use client";

import { AuthButton } from "~/app/_components/auth-button";
import { DataSourcePanel } from "~/app/_components/data-source-panel";
import {
  LandingBackgroundCanvas,
  LandingBackgroundProvider,
} from "~/app/_components/landing-background/landing-background-shell";
import { HuntscopeWordmark } from "~/components/brand/huntscope-wordmark";
import { usePageShellTheme } from "~/hooks/use-page-shell-theme";

type LandingPageProps = {
  githubConfigured: boolean;
};

export function LandingPage({ githubConfigured }: LandingPageProps) {
  usePageShellTheme("landing");

  return (
    <LandingBackgroundProvider>
      <LandingBackgroundCanvas />

      <main className="relative isolate flex min-h-screen flex-col items-center text-white">
        <div className="container flex flex-col items-center gap-10 px-4 py-16 pb-28">
          <div className="flex flex-col items-center gap-4 text-center">
            <HuntscopeWordmark />

            <p className="max-w-2xl text-lg text-white/80">
              Analytics for your job-search data repository. Open a local
              career-ops project from disk — no sign-in required — or optionally
              connect a companion repository on GitHub.
            </p>

            <p className="text-sm text-white/50">
              Local folders stay on your machine. GitHub access is optional and
              scoped to repositories you select.
            </p>
          </div>

          <DataSourcePanel githubConfigured={githubConfigured} />

          <AuthButton />
        </div>
      </main>
    </LandingBackgroundProvider>
  );
}
