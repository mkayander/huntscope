"use client";

import type { ReactNode } from "react";

import { GlowPanel } from "~/components/ui/glow-panel";
import {
  DASHBOARD_SECTION_IDS,
  type DashboardSectionId,
} from "~/lib/dashboard/sections";
import { cn } from "~/lib/utils";

type PanelSectionProps = {
  variant?: "landing" | "dashboard";
  accent?: DashboardSectionId;
  glowVariant?: "default" | "dashed";
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function panelTitleClassName(variant: "landing" | "dashboard") {
  return cn(
    "font-semibold text-white",
    variant === "landing" ? "text-lg" : "text-xl",
  );
}

export function PanelSection({
  variant = "landing",
  accent = DASHBOARD_SECTION_IDS.repository,
  glowVariant = "default",
  children,
  className,
  contentClassName,
}: PanelSectionProps) {
  const isLanding = variant === "landing";

  return (
    <GlowPanel
      accent={accent}
      variant={glowVariant}
      interactive={isLanding}
      className={cn("w-full", className)}
      contentClassName={cn(
        "flex flex-col gap-4",
        isLanding && "items-center text-center",
        contentClassName,
      )}
    >
      {children}
    </GlowPanel>
  );
}
