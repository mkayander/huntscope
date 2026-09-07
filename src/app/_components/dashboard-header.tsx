"use client";

import { useEffect, useRef } from "react";

import { AuthButton } from "~/app/_components/auth-button";
import { MobileSectionNav } from "~/app/_components/mobile-section-nav";
import { useCareerOpsDataSource } from "~/hooks/use-career-ops-data-source";
import { getDataSourceLabel } from "~/lib/career-ops/data-source";
import { setDashboardHeaderHeight } from "~/lib/dashboard/header-height";
import { DASHBOARD_SHELL_CLASS } from "~/lib/dashboard/shell";
import { cn } from "~/lib/utils";

type DashboardHeaderProps = {
  className?: string;
};

export function DashboardHeader({ className }: DashboardHeaderProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const { activeSource } = useCareerOpsDataSource();
  const sourceLabel = activeSource ? getDataSourceLabel(activeSource) : null;

  useEffect(() => {
    const element = headerRef.current;
    if (!element) {
      return;
    }

    const updateHeight = () => {
      setDashboardHeaderHeight(element);
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <header
      ref={headerRef}
      className={cn(
        "sticky top-0 z-40 w-full border-b border-white/10 bg-[#0b0c1c]/85 backdrop-blur-md",
        className,
      )}
    >
      <div className={DASHBOARD_SHELL_CLASS}>
        <div className="flex min-h-11 items-center justify-between gap-3 py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <p className="shrink-0 text-base leading-none font-bold tracking-tight text-white">
              Hunt<span className="text-[hsl(280,100%,70%)]">scope</span>
            </p>
            {sourceLabel ? (
              <>
                <span aria-hidden className="text-white/25">
                  ·
                </span>
                <p className="min-w-0 truncate text-xs leading-none text-white/55">
                  {sourceLabel}
                </p>
              </>
            ) : (
              <p className="truncate text-xs leading-none text-white/45">
                Connect a local folder or GitHub repo
              </p>
            )}
          </div>

          <AuthButton variant="compact" />
        </div>

        <MobileSectionNav />
      </div>
    </header>
  );
}
