"use client";

import { RepoDataView } from "~/app/_components/repo-data-view";
import { RepoSelector } from "~/app/_components/repo-selector";

export function Dashboard() {
  return (
    <div className="flex w-full max-w-5xl flex-col items-stretch gap-6">
      <RepoSelector />
      <RepoDataView />
    </div>
  );
}
