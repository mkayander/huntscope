"use client";

import { InstallPwaButton } from "~/app/_components/install-pwa-button";
import { DataPreview } from "~/app/_components/data-preview";
import { GlowPanel } from "~/components/ui/glow-panel";
import { useCareerOpsDataSource } from "~/hooks/use-career-ops-data-source";
import { DASHBOARD_SECTION_IDS } from "~/lib/dashboard/sections";

type LocalRepoPanelProps = {
  variant?: "landing" | "dashboard";
};

function PanelShell({
  variant,
  children,
}: {
  variant: "landing" | "dashboard";
  children: React.ReactNode;
}) {
  if (variant === "dashboard") {
    return (
      <GlowPanel
        accent={DASHBOARD_SECTION_IDS.repository}
        className="flex flex-col gap-4"
      >
        {children}
      </GlowPanel>
    );
  }

  return (
    <section className="flex w-full flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-6">
      {children}
    </section>
  );
}

export function LocalRepoPanel({ variant = "landing" }: LocalRepoPanelProps) {
  const { localRepo } = useCareerOpsDataSource();
  const {
    state,
    isRefreshing,
    watchingDisk,
    installedPwa,
    pickDirectory,
    refresh,
    disconnect,
  } = localRepo;

  const titleClassName =
    variant === "dashboard"
      ? "text-xl font-semibold text-white"
      : "text-lg font-semibold text-white";

  if (state.status === "loading") {
    return (
      <PanelShell variant={variant}>
        <p className="text-sm text-white/70">Loading local repository…</p>
      </PanelShell>
    );
  }

  if (state.status === "unsupported") {
    return (
      <PanelShell variant={variant}>
        <h2 className={titleClassName}>Local career-ops project</h2>
        <p className="text-sm text-white/70">
          Folder picking is not supported in this browser. Use Chrome or Edge on
          desktop to open a local career-ops project from disk.
        </p>
      </PanelShell>
    );
  }

  if (state.status === "connected") {
    return (
      <PanelShell variant={variant}>
        <div className="flex flex-col gap-2">
          <h2 className={titleClassName}>Local career-ops project</h2>
          <p className="font-mono text-sm text-white/80">
            {state.preview.directoryName}
          </p>
          <p className="text-xs text-white/50">
            Last refreshed{" "}
            {new Date(state.preview.lastRefreshedAt).toLocaleString()}
            {state.preview.source === "directory" && watchingDisk
              ? " · watching for disk changes"
              : ""}
            {state.preview.source === "launched-file"
              ? " · opened from the OS"
              : ""}
            {installedPwa ? " · installed app mode" : ""}
          </p>
        </div>

        {variant === "landing" ? (
          <>
            <InstallPwaButton />
            <DataPreview
              filePath={state.preview.filePath}
              preview={state.preview.preview}
              sourceLabel="local disk"
            />
          </>
        ) : (
          <p className="text-sm text-white/60">
            Reading `data/applications.md`, `data/pipeline.md`, and `reports/`
            from your career-ops project root. No GitHub sign-in is required.
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={isRefreshing}
            className="rounded-full bg-white/10 px-6 py-2 text-sm font-semibold transition hover:bg-white/20 disabled:opacity-50"
          >
            {isRefreshing ? "Refreshing…" : "Refresh"}
          </button>
          <button
            type="button"
            onClick={() => void pickDirectory()}
            className="rounded-full bg-white/10 px-6 py-2 text-sm font-semibold transition hover:bg-white/20"
          >
            Change folder
          </button>
          <button
            type="button"
            onClick={() => void disconnect()}
            className="rounded-full bg-white/10 px-6 py-2 text-sm font-semibold transition hover:bg-white/20"
          >
            Disconnect
          </button>
        </div>
      </PanelShell>
    );
  }

  return (
    <PanelShell variant={variant}>
      <h2 className={titleClassName}>Local career-ops project</h2>
      <p className="text-sm text-white/70">
        Open your career-ops project root — the folder that contains `data/`,
        `reports/`, and the rest of your job-search files. Huntscope reads
        directly from disk and refreshes when the folder changes. GitHub sign-in
        is optional.
      </p>

      {variant === "landing" ? <InstallPwaButton /> : null}

      {state.status === "permission-required" ? (
        <p className="text-sm text-amber-200">
          Permission is required to read {state.directoryName} again. Click open
          folder to re-authorize.
        </p>
      ) : null}

      {state.status === "error" ? (
        <p className="text-sm text-red-200">{state.message}</p>
      ) : null}

      <button
        type="button"
        onClick={() => void pickDirectory()}
        className="rounded-full bg-[hsl(280,100%,70%)] px-8 py-3 font-semibold text-[#15162c] transition hover:opacity-90"
      >
        Open local folder
      </button>
    </PanelShell>
  );
}
