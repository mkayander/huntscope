"use client";

import { useEffect, useState } from "react";

import type { ActivityHeatmap, ActivityHeatmapPeriod } from "~/lib/career-ops/activity-heatmap";
import type { ApplicationEntry } from "~/lib/career-ops/types";
import { useLocale } from "~/lib/i18n/locale-context";
import { buildHeatmapInWorker } from "~/lib/career-ops/worker-client";

type UseActivityHeatmapResult = {
  heatmap: ActivityHeatmap | null;
  isLoading: boolean;
  error: string | null;
};

export function useActivityHeatmap(
  applications: ApplicationEntry[],
  periodWeeks: ActivityHeatmapPeriod,
): UseActivityHeatmapResult {
  const locale = useLocale();
  const [heatmap, setHeatmap] = useState<ActivityHeatmap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    void buildHeatmapInWorker(applications, periodWeeks, locale)
      .then((result) => {
        if (cancelled) {
          return;
        }

        setHeatmap(result);
        setIsLoading(false);
      })
      .catch((workerError: unknown) => {
        if (cancelled) {
          return;
        }

        setHeatmap(null);
        setIsLoading(false);
        setError(
          workerError instanceof Error
            ? workerError.message
            : "Could not build activity heat map",
        );
      });

    return () => {
      cancelled = true;
    };
  }, [applications, locale, periodWeeks]);

  return {
    heatmap,
    isLoading,
    error,
  };
}
