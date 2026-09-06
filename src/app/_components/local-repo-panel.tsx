"use client";

import { useLocalRepo } from "~/lib/local-repo/use-local-repo";
import { DataPreview } from "~/app/_components/data-preview";

export function LocalRepoPanel() {
  const {
    state,
    isRefreshing,
    watchingDisk,
    pickDirectory,
    refresh,
    disconnect,
  } = useLocalRepo();

  if (state.status === "loading") {
    return (
      <section className="flex w-full flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="text-sm text-white/70">Loading local repository…</p>
      </section>
    );
  }

  if (state.status === "unsupported") {
    return (
      <section className="flex w-full flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold text-white">Local repository</h2>
        <p className="text-center text-sm text-white/70">
          Folder picking is not supported in this browser. Use Chrome or Edge on
          desktop to open a local job-search repo from disk.
        </p>
      </section>
    );
  }

  if (state.status === "connected") {
    return (
      <section className="flex w-full flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-lg font-semibold text-white">Local repository</h2>
          <p className="font-mono text-sm text-white/80">
            {state.preview.directoryName}
          </p>
          <p className="text-xs text-white/50">
            Last refreshed {new Date(state.preview.lastRefreshedAt).toLocaleString()}
            {watchingDisk ? " · watching for disk changes" : ""}
          </p>
        </div>

        <DataPreview
          filePath={state.preview.filePath}
          preview={state.preview.preview}
          sourceLabel="local disk"
        />

        <div className="flex flex-wrap items-center justify-center gap-3">
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
      </section>
    );
  }

  return (
    <section className="flex w-full flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-6">
      <h2 className="text-lg font-semibold text-white">Local repository</h2>
      <p className="text-center text-sm text-white/70">
        Open a job-search data folder from your computer. Huntscope reads files
        directly from disk and can refresh when the folder changes.
      </p>

      {state.status === "permission-required" ? (
        <p className="text-center text-sm text-amber-200">
          Permission is required to read {state.directoryName} again. Click open
          folder to re-authorize.
        </p>
      ) : null}

      {state.status === "error" ? (
        <p className="text-center text-sm text-red-200">{state.message}</p>
      ) : null}

      <button
        type="button"
        onClick={() => void pickDirectory()}
        className="rounded-full bg-[hsl(280,100%,70%)] px-8 py-3 font-semibold text-[#15162c] transition hover:opacity-90"
      >
        Open local folder
      </button>
    </section>
  );
}
