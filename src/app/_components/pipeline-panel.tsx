import type { PipelineSummary } from "~/lib/career-ops/types";
import { glassCardSurfaceClassName } from "~/components/ui/glass-surface";
import { GlowPanel } from "~/components/ui/glow-panel";
import { DASHBOARD_SECTION_IDS } from "~/lib/dashboard/sections";
import { cn } from "~/lib/utils";

type PipelinePanelProps = {
  pipeline: PipelineSummary;
};

export function PipelinePanel({ pipeline }: PipelinePanelProps) {
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
