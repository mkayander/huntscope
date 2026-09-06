"use client";

import { Suspense } from "react";

import { AuthButton } from "~/app/_components/auth-button";
import { Dashboard } from "~/app/_components/dashboard";
import { DashboardAmbientBackground } from "~/app/_components/dashboard-ambient-background";
import { DataSourcePanel } from "~/app/_components/data-source-panel";
import { GitHubInstallStatusToast } from "~/app/_components/github-install-status-toast";
import {
  LandingBackgroundCanvas,
  LandingBackgroundProvider,
} from "~/app/_components/landing-background/landing-background-shell";
import { HuntscopeWordmark } from "~/components/brand/huntscope-wordmark";

import {
  CareerOpsDataSourceProvider,
  useCareerOpsDataSource,
} from "~/hooks/use-career-ops-data-source";

import { HomeShellProvider, useHomeShell } from "~/hooks/use-home-shell";

import { useHasMounted } from "~/hooks/use-has-mounted";

import type { HomeInitialState } from "~/lib/home/initial-state";

import { authClient } from "~/lib/auth-client";

type HomeContentProps = {
  githubConfigured: boolean;

  initialState: HomeInitialState;
};

export function HomeContent({
  githubConfigured,
  initialState,
}: HomeContentProps) {
  return (
    <HomeShellProvider initialState={initialState}>
      <CareerOpsDataSourceProvider>
        <Suspense fallback={null}>
          <GitHubInstallStatusToast />
        </Suspense>
        <Suspense
          fallback={
            <HomeContentFallback
              githubConfigured={githubConfigured}

              initialState={initialState}
            />
          }
        >
          <HomeContentBody githubConfigured={githubConfigured} />
        </Suspense>
      </CareerOpsDataSourceProvider>
    </HomeShellProvider>
  );
}

function HomeContentFallback({
  githubConfigured,

  initialState,
}: HomeContentProps) {
  if (initialState.showDashboard) {
    return (
      <main className="relative isolate flex min-h-screen flex-col items-center text-white">
        <DashboardAmbientBackground />

        <div className="relative z-10 mx-auto flex w-full max-w-screen-2xl flex-col items-center gap-10 px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <HuntscopeWordmark />

            <p className="max-w-xl text-lg text-white/80">
              Analytics for your career-ops project or companion repository.
            </p>
          </div>

          {initialState.isSignedIn && initialState.userLabel ? (
            <div className="flex min-h-10 w-full max-w-md items-center justify-center text-center text-2xl text-white">
              <p>Logged in as {initialState.userLabel}</p>
            </div>
          ) : null}

          <Dashboard />
        </div>
      </main>
    );
  }

  return (
    <LandingBackgroundProvider>
      <LandingBackgroundCanvas />

      <main className="relative isolate flex min-h-screen flex-col items-center text-white">
        <div className="container flex flex-col items-center gap-10 px-4 py-16 pb-28">
          <DataSourcePanel githubConfigured={githubConfigured} />

          <AuthButton />
        </div>
      </main>
    </LandingBackgroundProvider>
  );
}

function HomeContentBody({
  githubConfigured,
}: Pick<HomeContentProps, "githubConfigured">) {
  const hasMounted = useHasMounted();

  const { showDashboard: initialShowDashboard } = useHomeShell();

  const { data: session } = authClient.useSession();

  const isSignedIn = Boolean(session?.user);

  const { canShowDashboard, hasLocalSource } = useCareerOpsDataSource();

  const showDashboard = hasMounted
    ? canShowDashboard || isSignedIn
    : initialShowDashboard;

  if (!showDashboard) {
    return (
      <LandingBackgroundProvider>
        <LandingBackgroundCanvas />

        <main className="relative isolate flex min-h-screen flex-col items-center text-white">
          <div className="container flex flex-col items-center gap-10 px-4 py-16 pb-28">
            <div className="flex flex-col items-center gap-4 text-center">
              <HuntscopeWordmark />

              <p className="max-w-2xl text-lg text-white/80">
                Analytics for your job-search data repository. Open a local
                career-ops project from disk — no sign-in required — or
                optionally connect a companion repository on GitHub.
              </p>

              <p className="text-sm text-white/50">
                Local folders stay on your machine. GitHub access is optional
                and scoped to repositories you select.
              </p>
            </div>

            <DataSourcePanel githubConfigured={githubConfigured} />

            <AuthButton />
          </div>
        </main>
      </LandingBackgroundProvider>
    );
  }

  return (
    <main className="relative isolate flex min-h-screen flex-col items-center text-white">
      <DashboardAmbientBackground />

      <div className="relative z-10 mx-auto flex w-full max-w-screen-2xl flex-col items-center gap-10 px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <HuntscopeWordmark />

          <p className="max-w-xl text-lg text-white/80">
            {hasLocalSource
              ? "Viewing your local career-ops project. GitHub sign-in remains optional for companion repositories."
              : "Analytics for your career-ops project or companion repository."}
          </p>
        </div>

        <AuthButton />

        <Dashboard />
      </div>
    </main>
  );
}
