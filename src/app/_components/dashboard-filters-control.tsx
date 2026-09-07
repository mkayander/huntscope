"use client";

import { SlidersHorizontalIcon, XIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { DashboardFiltersForm } from "~/app/_components/dashboard-filters-form";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { glassCardSurfaceClassName } from "~/components/ui/glass-surface";
import { useBodyScrollLock } from "~/hooks/use-body-scroll-lock";
import {
  countActiveDashboardFilters,
  DASHBOARD_FILTERS_OPEN_EVENT,
  type DashboardFilters,
} from "~/lib/career-ops/dashboard-filters";
import { cn } from "~/lib/utils";
import type { ApplicationEntry } from "~/lib/career-ops/types";

const PANEL_ANIMATION_MS = 250;

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
  const [isClosing, setIsClosing] = useState(false);
  const [focusSearchOnOpen, setFocusSearchOnOpen] = useState(false);
  const activeFilterCount = countActiveDashboardFilters(filters);

  const handleClose = useCallback(() => {
    if (isClosing) {
      return;
    }

    setIsClosing(true);
    window.setTimeout(() => {
      setOpen(false);
      setIsClosing(false);
      setFocusSearchOnOpen(false);
    }, PANEL_ANIMATION_MS);
  }, [isClosing]);

  const handleOpen = useCallback((options?: { focusSearch?: boolean }) => {
    setOpen(true);
    setIsClosing(false);
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
    if (!open || isClosing) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleClose, isClosing, open]);

  useBodyScrollLock(open && !isClosing);

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-end px-4 sm:bottom-6 sm:px-6">
        <Button
          type="button"
          variant="brand"
          size="pill"
          className="pointer-events-auto shadow-lg shadow-violet-950/40"
          aria-expanded={open}
          aria-controls="dashboard-filters-panel"
          onClick={() => {
            if (open) {
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

      {open ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close filters"
            className={cn(
              "absolute inset-0 cursor-pointer bg-black/60 backdrop-blur-sm motion-reduce:animate-none",
              isClosing
                ? "animate-out fade-out-0 duration-200"
                : "animate-in fade-in-0 duration-200",
            )}
            onClick={handleClose}
          />

          <aside
            id="dashboard-filters-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Dashboard filters"
            className={cn(
              glassCardSurfaceClassName,
              "absolute flex max-h-[min(85dvh,42rem)] w-full flex-col overflow-hidden border border-white/10 bg-[#0f1024] shadow-2xl motion-reduce:animate-none",
              "inset-x-0 bottom-0 rounded-t-2xl border-b-0",
              "sm:inset-x-auto sm:right-6 sm:bottom-24 sm:w-[min(24rem,calc(100vw-3rem))] sm:rounded-2xl sm:border-b",
              isClosing
                ? "animate-out fade-out-0 slide-out-to-bottom sm:slide-out-to-bottom-0 sm:zoom-out-95 duration-250"
                : "animate-in fade-in-0 slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-250",
            )}
            onMouseDown={(event) => event.stopPropagation()}
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
                  Applies to overview, charts, funnel, heatmap, and tracker.
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
        </div>
      ) : null}
    </>
  );
}
