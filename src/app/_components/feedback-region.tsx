import { ErrorAlert } from "~/app/_components/error-alert";
import { cn } from "~/lib/utils";

type FeedbackRegionProps = {
  hint?: string | null;
  errorTitle?: string | null;
  errorMessage?: string | null;
  className?: string;
};

export function FeedbackRegion({
  hint,
  errorTitle,
  errorMessage,
  className,
}: FeedbackRegionProps) {
  const hasError = Boolean(errorTitle && errorMessage);
  const hasHint = Boolean(hint);
  const isVisible = hasError || hasHint;

  return (
    <div
      aria-live="polite"
      className={cn("min-h-[4.75rem] w-full", className)}
    >
      <div
        className={cn(
          "transition-opacity duration-200",
          isVisible ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        {hasError ? (
          <ErrorAlert title={errorTitle ?? "Something went wrong"} message={errorMessage ?? ""} />
        ) : (
          <p className="text-sm text-amber-200">{hint}</p>
        )}
      </div>
    </div>
  );
}
