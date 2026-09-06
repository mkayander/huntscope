import {
  LANDING_PANEL_CTA_MIN_H,
  LANDING_PANEL_DESCRIPTION_MIN_H,
  LANDING_PANEL_INSTALL_MIN_H,
} from "~/app/_components/panel-content-slots";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";

/** Matches landing CTA buttons (`AuthButton`, primary panel actions). */
export const LANDING_CTA_BUTTON_CLASS =
  "min-h-12 min-w-[15.5rem] justify-center px-8";

/** Widest auth button label so width stays stable while loading. */
export const AUTH_BUTTON_LABEL_PLACEHOLDER = "Redirecting to GitHub";

type PanelDescriptionSkeletonProps = {
  centered?: boolean;
  className?: string;
};

export function PanelDescriptionSkeleton({
  centered = false,
  className,
}: PanelDescriptionSkeletonProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col justify-center gap-2",
        LANDING_PANEL_DESCRIPTION_MIN_H,
        centered && "items-center",
        className,
      )}
    >
      <Skeleton
        className={cn("h-4 w-full max-w-lg bg-white/10", centered && "mx-auto")}
      />
      <Skeleton
        className={cn("h-4 w-full max-w-lg bg-white/10", centered && "mx-auto")}
      />
      <Skeleton
        className={cn("h-4 w-3/4 max-w-sm bg-white/10", centered && "mx-auto")}
      />
    </div>
  );
}

type PanelButtonSkeletonProps = {
  variant?: "landing" | "dashboard";
  centered?: boolean;
  className?: string;
};

export function PanelButtonSkeleton({
  variant = "landing",
  centered = false,
  className,
}: PanelButtonSkeletonProps) {
  return (
    <Skeleton
      aria-hidden
      className={cn(
        "bg-white/10",
        variant === "landing"
          ? cn("h-12 w-[15.5rem] rounded-full", LANDING_PANEL_CTA_MIN_H)
          : "h-9 w-28 rounded-full",
        centered && "mx-auto",
        className,
      )}
    />
  );
}

type PanelInstallHintSkeletonProps = {
  centered?: boolean;
  className?: string;
};

export function PanelInstallHintSkeleton({
  centered = false,
  className,
}: PanelInstallHintSkeletonProps) {
  return (
    <div
      className={cn(
        "flex w-full items-center",
        LANDING_PANEL_INSTALL_MIN_H,
        centered && "justify-center",
        className,
      )}
    >
      <Skeleton
        aria-hidden
        className={cn("h-4 w-full max-w-sm bg-white/10", centered && "mx-auto")}
      />
    </div>
  );
}

type PanelIdleLoadingSkeletonProps = {
  variant?: "landing" | "dashboard";
  showInstallHint?: boolean;
  showPrimaryAction?: boolean;
};

/** Skeleton layout for idle panels that end with a primary CTA. */
export function PanelIdleLoadingSkeleton({
  variant = "landing",
  showInstallHint = false,
  showPrimaryAction = true,
}: PanelIdleLoadingSkeletonProps) {
  const centered = variant === "landing";

  return (
    <>
      <PanelDescriptionSkeleton centered={centered} />
      {showInstallHint ? (
        <PanelInstallHintSkeleton centered={centered} />
      ) : null}
      {showPrimaryAction ? (
        <PanelButtonSkeleton variant={variant} centered={centered} />
      ) : null}
    </>
  );
}
