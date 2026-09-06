import type { ComponentProps } from "react";

import { cn } from "~/lib/utils";

/** Outer panels (GlowPanel shell) — light translucent fill */
export const glassPanelSurfaceClassName =
  "border border-white/10 bg-white/5 backdrop-blur-md";

/** Nested cards inside panels — darker translucent fill */
export const glassCardSurfaceClassName =
  "border border-white/10 bg-black/20 backdrop-blur-md";

/** Inset blocks such as code previews */
export const glassInsetSurfaceClassName = "bg-black/30 backdrop-blur-sm";

type GlassSurfaceProps = ComponentProps<"div"> & {
  variant?: "panel" | "card" | "inset";
};

export function GlassSurface({
  variant = "card",
  className,
  ...props
}: GlassSurfaceProps) {
  const variantClassName =
    variant === "panel"
      ? glassPanelSurfaceClassName
      : variant === "inset"
        ? glassInsetSurfaceClassName
        : glassCardSurfaceClassName;

  return <div className={cn(variantClassName, className)} {...props} />;
}
