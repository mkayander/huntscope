import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";

/** Matches landing CTA buttons (`AuthButton`, primary panel actions). */
export const LANDING_CTA_BUTTON_CLASS =
  "min-h-12 min-w-[15.5rem] justify-center px-8";

type PanelDescriptionSkeletonProps = {
  lines?: number;
  centered?: boolean;
  className?: string;
};

export function PanelDescriptionSkeleton({
  lines = 2,
  centered = false,
  className,
}: PanelDescriptionSkeletonProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-2",
        centered && "items-center",
        className,
      )}
    >
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          className={cn(
            "h-4 bg-white/10",
            centered && "mx-auto",
            index === lines - 1 ? "w-3/4 max-w-sm" : "w-full max-w-lg",
          )}
        />
      ))}
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
          ? "h-12 w-[15.5rem] rounded-full"
          : "h-9 w-28 rounded-full",
        centered && "mx-auto",
        className,
      )}
    />
  );
}

type PanelIdleLoadingSkeletonProps = {
  variant?: "landing" | "dashboard";
  descriptionLines?: number;
  showInstallHint?: boolean;
};

/** Skeleton layout for idle panels that end with a primary CTA. */
export function PanelIdleLoadingSkeleton({
  variant = "landing",
  descriptionLines = 3,
  showInstallHint = false,
}: PanelIdleLoadingSkeletonProps) {
  const centered = variant === "landing";

  return (
    <>
      <PanelDescriptionSkeleton lines={descriptionLines} centered={centered} />
      {showInstallHint ? (
        <Skeleton
          aria-hidden
          className={cn(
            "h-4 max-w-sm bg-white/10",
            centered ? "mx-auto w-full" : "w-3/4",
          )}
        />
      ) : null}
      <PanelButtonSkeleton variant={variant} centered={centered} />
    </>
  );
}
