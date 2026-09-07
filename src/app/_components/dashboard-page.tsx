"use client";

import { Dashboard } from "~/app/_components/dashboard";
import { DashboardAmbientBackground } from "~/app/_components/dashboard-ambient-background";
import { usePageShellTheme } from "~/hooks/use-page-shell-theme";

export function DashboardPage() {
  usePageShellTheme("dashboard");

  return (
    <main className="relative isolate flex min-h-screen flex-col text-white">
      <DashboardAmbientBackground />

      <div className="relative z-10 w-full">
        <Dashboard />
      </div>
    </main>
  );
}
