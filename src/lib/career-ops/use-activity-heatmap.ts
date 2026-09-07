"use client";

import { useEffect, useMemo, useState } from "react";

import type { ActivityHeatmap } from "~/lib/career-ops/activity-heatmap";
import { getActivityHeatmapWindow } from "~/lib/career-ops/dashboard-period";
import type { DashboardPeriod } from "~/lib/career-ops/dashboard-period";
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
  period: DashboardPeriod,
): UseActivityHeatmapResult {
  const locale = useLocale();
  const window = useMemo(() => getActivityHeatmapWindow(period), [period]);
  const [heatmap, setHeatmap] = useState<ActivityHeatmap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    void buildHeatmapInWorker(applications, window, locale)
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
  }, [applications, locale, window]);

  return {
    heatmap,
    isLoading,
    error,
  };
}
