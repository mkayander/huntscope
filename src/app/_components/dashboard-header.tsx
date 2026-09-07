"use client";

import { useEffect, useRef } from "react";

import { DashboardChrome } from "~/app/_components/dashboard-chrome";
import { MobileSectionNav } from "~/app/_components/mobile-section-nav";
import { setDashboardHeaderHeight } from "~/lib/dashboard/header-height";
import { cn } from "~/lib/utils";

type DashboardHeaderProps = {
  className?: string;
};

export function DashboardHeader({ className }: DashboardHeaderProps) {
  const headerRef = useRef<HTMLDivElement>(null);

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
    <div ref={headerRef} className={cn("sticky top-0 z-40 w-full", className)}>
      <DashboardChrome />
      <MobileSectionNav />
    </div>
  );
}
