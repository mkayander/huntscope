"use client";

import { Suspense, type ReactNode } from "react";

import { GitHubInstallStatusToast } from "~/app/_components/github-install-status-toast";
import { CareerOpsDataSourceProvider } from "~/hooks/use-career-ops-data-source";
import { HomeShellProvider } from "~/hooks/use-home-shell";
import type { HomeInitialState } from "~/lib/home/initial-state";

type AppShellProps = {
  children: ReactNode;
  initialState: HomeInitialState;
};

export function AppShell({ children, initialState }: AppShellProps) {
  return (
    <HomeShellProvider initialState={initialState}>
      <CareerOpsDataSourceProvider>
        <Suspense fallback={null}>
          <GitHubInstallStatusToast />
        </Suspense>
        {children}
      </CareerOpsDataSourceProvider>
    </HomeShellProvider>
  );
}
