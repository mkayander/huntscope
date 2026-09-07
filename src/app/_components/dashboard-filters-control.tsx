"use client";

import { SlidersHorizontalIcon, XIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { DashboardFiltersForm } from "~/app/_components/dashboard-filters-form";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { glassCardSurfaceClassName } from "~/components/ui/glass-surface";
import {
  animatedExitClassName,
  useAnimatedPresence,
} from "~/hooks/use-animated-presence";
import {
  countActiveDashboardFilters,
  DASHBOARD_FILTERS_OPEN_EVENT,
  type DashboardFilters,
} from "~/lib/career-ops/dashboard-filters";
import { cn } from "~/lib/utils";
import type { ApplicationEntry } from "~/lib/career-ops/types";

const PANEL_ANIMATION_MS = 250;

const filtersPanelShadowClassName =
  "shadow-[0_24px_64px_-16px_rgba(7,8,20,0.9),0_0_0_1px_rgba(255,255,255,0.1),0_16px_48px_-12px_rgba(124,58,237,0.35)]";

type DashboardFiltersControlProps = {
  applications: ApplicationEntry[];
  filters: DashboardFilters;
  resultCount: number;
  onFiltersChange: (filters: DashboardFilters) => void;
};

export function DashboardFiltersControl({
  applications,
  filters,
  resultCount,
  onFiltersChange,
}: DashboardFiltersControlProps) {
  const [open, setOpen] = useState(false);
  const [focusSearchOnOpen, setFocusSearchOnOpen] = useState(false);
  const { isRendered, isClosing } = useAnimatedPresence(open, {
    durationMs: PANEL_ANIMATION_MS,
  });
  const activeFilterCount = countActiveDashboardFilters(filters);

  const handleClose = useCallback(() => {
    if (isClosing || !open) {
      return;
    }

    setOpen(false);
    setFocusSearchOnOpen(false);
  }, [isClosing, open]);

  const handleOpen = useCallback((options?: { focusSearch?: boolean }) => {
    setOpen(true);
    setFocusSearchOnOpen(options?.focusSearch ?? false);
  }, []);

  useEffect(() => {
    const handleOpenEvent = () => {
      handleOpen({ focusSearch: true });
    };

    window.addEventListener(DASHBOARD_FILTERS_OPEN_EVENT, handleOpenEvent);
    return () => {
      window.removeEventListener(DASHBOARD_FILTERS_OPEN_EVENT, handleOpenEvent);
    };
  }, [handleOpen]);

  useEffect(() => {
    if (!open || isClosing || !focusSearchOnOpen) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      document.getElementById("dashboard-search")?.focus();
      setFocusSearchOnOpen(false);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [focusSearchOnOpen, isClosing, open]);

  useEffect(() => {
    if (!isRendered || isClosing) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleClose, isClosing, isRendered]);

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-end px-4 sm:bottom-6 sm:px-6">
        <Button
          type="button"
          variant="brand"
          size="pill"
          className="pointer-events-auto shadow-lg shadow-violet-950/40"
          aria-expanded={isRendered}
          aria-controls="dashboard-filters-panel"
          onClick={() => {
            if (isRendered) {
              handleClose();
            } else {
              handleOpen();
            }
          }}
        >
          <SlidersHorizontalIcon className="size-4" aria-hidden="true" />
          Filters
          {activeFilterCount > 0 ? (
            <Badge className="ml-1 bg-white/15 text-white">
              {activeFilterCount}
            </Badge>
          ) : null}
        </Button>
      </div>

      {isRendered ? (
        <aside
          id="dashboard-filters-panel"
          role="dialog"
          aria-modal="false"
          aria-label="Dashboard filters"
          className={cn(
            glassCardSurfaceClassName,
            filtersPanelShadowClassName,
            "fixed z-50 flex max-h-[min(85dvh,42rem)] w-full flex-col overflow-hidden border border-white/10 bg-[#0f1024]",
            "inset-x-4 bottom-20 max-w-none",
            "sm:inset-x-auto sm:right-6 sm:bottom-24 sm:w-[min(24rem,calc(100vw-3rem))]",
            "rounded-2xl",
            isClosing
              ? cn(
                  animatedExitClassName,
                  "animate-out fade-out-0 slide-out-to-bottom-2 sm:slide-out-to-bottom-0 sm:zoom-out-95 duration-250",
                )
              : "animate-in fade-in-0 slide-in-from-bottom-2 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-250 motion-reduce:animate-none",
          )}
        >
          <div className="flex items-start justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-5">
            <div>
              <p className="text-xs tracking-wide text-white/45 uppercase">
                Global filters
              </p>
              <h2 className="mt-1 text-lg font-semibold text-white">
                Scope dashboard
              </h2>
              <p className="mt-1 text-sm text-white/55">
                Adjust filters while watching the dashboard update live behind
                this panel.
              </p>
            </div>
            <Button
              type="button"
              variant="brandSecondary"
              size="pillSm"
              aria-label="Close filters"
              onClick={handleClose}
            >
              <XIcon className="size-4" aria-hidden="true" />
            </Button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
            <DashboardFiltersForm
              applications={applications}
              filters={filters}
              resultCount={resultCount}
              onFiltersChange={onFiltersChange}
            />
          </div>
        </aside>
      ) : null}
    </>
  );
}
