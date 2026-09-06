"use client";

import { glassInsetSurfaceClassName } from "~/components/ui/glass-surface";
import { cn } from "~/lib/utils";

type DataPreviewProps = {
  filePath: string;
  preview: string | null;
  sourceLabel: string;
  missingMessage?: string;
};

export function DataPreview({
  filePath,
  preview,
  sourceLabel,
  missingMessage,
}: DataPreviewProps) {
  if (preview) {
    return (
      <div
        className={cn(
          glassInsetSurfaceClassName,
          "w-full rounded-xl p-4 text-left",
        )}
      >
        <p className="mb-2 text-xs tracking-wide text-white/50 uppercase">
          Preview: {filePath} · {sourceLabel}
        </p>
        <pre className="overflow-x-auto text-sm text-emerald-100">
          {preview}
        </pre>
      </div>
    );
  }

  return (
    <p className="text-center text-sm text-white/60">
      {missingMessage ??
        `Connected to ${sourceLabel}. No ${filePath} found yet.`}
    </p>
  );
}
