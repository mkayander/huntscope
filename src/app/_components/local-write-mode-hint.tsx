"use client";

import type { CareerOpsDataSource } from "~/lib/career-ops/data-source";
import { getLocalWriteAvailability } from "~/lib/career-ops/local-write";
import { cn } from "~/lib/utils";

type LocalWriteModeHintProps = {
  dataSource: CareerOpsDataSource;
  className?: string;
};

export function LocalWriteModeHint({
  dataSource,
  className,
}: LocalWriteModeHintProps) {
  const availability = getLocalWriteAvailability(dataSource);

  if (!availability) {
    return null;
  }

  return (
    <p
      className={cn(
        "text-xs",
        availability.mode === "editable"
          ? "text-emerald-200/80"
          : "text-white/50",
        className,
      )}
    >
      {availability.hint}
    </p>
  );
}
