"use client";

import { useState } from "react";

import { LocalDataWriteAlert } from "~/app/_components/local-data-write-alert";
import { LocalWriteModeHint } from "~/app/_components/local-write-mode-hint";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { GlowPanel } from "~/components/ui/glow-panel";
import { DASHBOARD_SECTION_IDS } from "~/lib/dashboard/sections";
import { glassCardSurfaceClassName } from "~/components/ui/glass-surface";
import type { CareerOpsDataSource } from "~/lib/career-ops/data-source";
import type { PipelineSummary } from "~/lib/career-ops/types";
import { appendPendingPipelineUrl } from "~/lib/career-ops/serialize-pipeline";
import { cn } from "~/lib/utils";
import { useLocalRepoMutations } from "~/hooks/use-local-repo-mutations";

type PipelinePanelProps = {
  dataSource: CareerOpsDataSource;
  pipeline: PipelineSummary;
  pipelineMarkdown: string | null;
};

export function PipelinePanel({
  dataSource,
  pipeline,
  pipelineMarkdown,
}: PipelinePanelProps) {
  const {
    canWrite,
    isSavingPipeline,
    error,
    isRefreshing,
    clearError,
    refreshLoadedData,
    writePipelineMarkdown,
  } = useLocalRepoMutations();
  const [url, setUrl] = useState("");

  const handleAddUrl = async () => {
    const trimmed = url.trim();

    if (!trimmed) {
      return;
    }

    clearError();

    try {
      const nextContent = appendPendingPipelineUrl(pipelineMarkdown, trimmed);
      await writePipelineMarkdown(nextContent);
      setUrl("");
    } catch {
      // useLocalRepoMutations stores the error message for display.
    }
  };

  return (
    <GlowPanel accent={DASHBOARD_SECTION_IDS.pipeline}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-white">Pipeline inbox</h3>
        <div className="flex gap-2 text-xs">
          <span className="rounded-full bg-amber-500/15 px-3 py-1 font-medium text-amber-100 ring-1 ring-amber-400/30">
            {pipeline.pendingCount} pending
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1 font-medium text-white/70 ring-1 ring-white/15">
            {pipeline.processedCount} processed
          </span>
        </div>
      </div>

      <LocalWriteModeHint dataSource={dataSource} className="mt-2" />

      {canWrite ? (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="Paste a job URL to add to Pending"
            className="border-white/15 bg-[#15162c] text-white placeholder:text-white/40"
          />
          <Button
            type="button"
            variant="brand"
            size="pill"
            disabled={isSavingPipeline || url.trim().length === 0}
            onClick={() => void handleAddUrl()}
          >
            Add URL
          </Button>
        </div>
      ) : null}

      <LocalDataWriteAlert
        error={error}
        isRefreshing={isRefreshing}
        onRefresh={() => void refreshLoadedData()}
        onDismiss={clearError}
      />

      {pipeline.pendingPreview.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {pipeline.pendingPreview.map((entry) => (
            <li
              key={entry}
              className={cn(
                glassCardSurfaceClassName,
                "rounded-lg px-3 py-2 text-sm text-white/85",
              )}
            >
              <span className="block overflow-hidden text-ellipsis whitespace-nowrap">
                {entry}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-white/50">
          No pending URLs in the pipeline inbox.
        </p>
      )}
    </GlowPanel>
  );
}
