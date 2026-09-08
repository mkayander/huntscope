"use client";

import { glassInsetSurfaceClassName } from "~/components/ui/glass-surface";
import { cn } from "~/lib/utils";

type DataPreviewProps = {
  filePath: string;
  preview: string | null;
  sourceLabel: string;
  missingMessage?: string;
  className?: string;
};

function formatPreviewFileLabel(filePath: string): string {
  return filePath.replace(/^\.\//, "");
}

export function DataPreview({
  filePath,
  preview,
  sourceLabel,
  missingMessage,
  className,
}: DataPreviewProps) {
  const fileLabel = formatPreviewFileLabel(filePath);

  if (preview) {
    return (
      <div
        className={cn(
          glassInsetSurfaceClassName,
          "mx-auto w-full max-w-sm rounded-xl border border-white/10 p-4 text-left",
          className,
        )}
      >
        <div className="mb-3 flex items-start justify-between gap-3 border-b border-white/10 pb-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white/90">
              {fileLabel}
            </p>
            <p className="truncate text-xs text-white/50">{sourceLabel}</p>
          </div>
          <span className="shrink-0 rounded-full bg-white/8 px-2 py-0.5 text-[10px] font-medium tracking-wide text-white/60">
            Preview
          </span>
        </div>
        <p className="line-clamp-4 text-sm leading-relaxed break-words whitespace-pre-wrap text-white/70">
          {preview}
        </p>
      </div>
    );
  }

  return (
    <p
      className={cn(
        "mx-auto w-full max-w-sm text-center text-sm text-white/60",
        className,
      )}
    >
      {missingMessage ??
        `Connected to ${sourceLabel}. No ${fileLabel} found yet.`}
    </p>
  );
}
