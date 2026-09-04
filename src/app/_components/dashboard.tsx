"use client";

import { Suspense } from "react";

import { RepoDataView } from "~/app/_components/repo-data-view";
import { RepoSelector } from "~/app/_components/repo-selector";

function PanelFallback({ label }: { label: string }) {
  return (
    <section className="w-full max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-6">
      <p className="text-sm text-white/70">{label}</p>
    </section>
  );
}

export function Dashboard() {
  return (
    <div className="flex w-full max-w-5xl flex-col items-stretch gap-6">
      <Suspense fallback={<PanelFallback label="Loading your GitHub repositories…" />}>
        <RepoSelector />
      </Suspense>
      <Suspense fallback={<PanelFallback label="Loading saved repository…" />}>
        <RepoDataView />
      </Suspense>
    </div>
  );
}
