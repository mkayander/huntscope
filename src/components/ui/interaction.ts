import { cn } from "~/lib/utils";

export const focusRingClassName =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:ring-offset-0";

export const clickableSurfaceClassName = cn(
  "cursor-pointer transition-colors",
  focusRingClassName,
);

export const clickableCardClassName = cn(
  clickableSurfaceClassName,
  "hover:bg-white/5",
);

export const clickableRowClassName = cn(
  clickableSurfaceClassName,
  "hover:bg-white/5",
);

export const clickablePillClassName = cn(
  clickableSurfaceClassName,
  "hover:bg-violet-500/15 hover:text-violet-100",
);

export const clickableLinkClassName =
  "cursor-pointer font-medium text-violet-300 underline-offset-2 transition-colors hover:text-violet-200 hover:underline";
