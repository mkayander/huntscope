"use client";

import { Loader2 } from "lucide-react";

import { ActionButtonRow } from "~/app/_components/action-button-row";
import { InstallPwaButton } from "~/app/_components/install-pwa-button";
import { DataPreview } from "~/app/_components/data-preview";
import {
  PanelSection,
  panelTitleClassName,
} from "~/app/_components/panel-section";
import { Button } from "~/components/ui/button";
import { useCareerOpsDataSource } from "~/hooks/use-career-ops-data-source";

type LocalRepoPanelProps = {
  variant?: "landing" | "dashboard";
};

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

  const titleClassName = panelTitleClassName(variant);
  const isLanding = variant === "landing";
  const primaryButtonSize = isLanding ? "cta" : "pill";

  if (state.status === "loading") {
    return (
      <PanelSection variant={variant}>
        <p className="text-sm text-white/70">Loading local repository…</p>
      </PanelSection>
    );
  }

  if (state.status === "unsupported") {
    return (
      <PanelSection variant={variant}>
        <h2 className={titleClassName}>Local career-ops project</h2>
        <p className="text-sm text-white/70">
          Folder picking is not supported in this browser. Use Chrome or Edge on
          desktop to open a local career-ops project from disk.
        </p>
      </PanelSection>
    );
  }

  if (state.status === "connected") {
    return (
      <PanelSection variant={variant}>
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

        {isLanding ? (
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

        <ActionButtonRow centered={isLanding}>
          <Button
            type="button"
            variant="brandSecondary"
            size="pill"
            disabled={isRefreshing}
            onClick={() => void refresh()}
          >
            {isRefreshing ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : null}
            <span>{isRefreshing ? "Refreshing…" : "Refresh"}</span>
          </Button>
          <Button
            type="button"
            variant="brandSecondary"
            size="pill"
            onClick={() => void pickDirectory()}
          >
            Change folder
          </Button>
          <Button
            type="button"
            variant="brandSecondary"
            size="pill"
            onClick={() => void disconnect()}
          >
            Disconnect
          </Button>
        </ActionButtonRow>
      </PanelSection>
    );
  }

  return (
    <PanelSection variant={variant}>
      <h2 className={titleClassName}>Local career-ops project</h2>
      <p className="text-sm text-white/70">
        Open your career-ops project root — the folder that contains `data/`,
        `reports/`, and the rest of your job-search files. Huntscope reads
        directly from disk and refreshes when the folder changes. GitHub sign-in
        is optional.
      </p>

      {isLanding ? <InstallPwaButton /> : null}

      {state.status === "permission-required" ? (
        <p className="text-sm text-amber-200">
          Permission is required to read {state.directoryName} again. Click open
          folder to re-authorize.
        </p>
      ) : null}

      {state.status === "error" ? (
        <p className="text-sm text-red-200">{state.message}</p>
      ) : null}

      <Button
        type="button"
        variant="brand"
        size={primaryButtonSize}
        className={isLanding ? "min-w-[15.5rem]" : undefined}
        onClick={() => void pickDirectory()}
      >
        Open local folder
      </Button>
    </PanelSection>
  );
}
