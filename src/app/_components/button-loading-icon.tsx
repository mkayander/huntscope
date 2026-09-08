import { Loader2 } from "lucide-react";

import { cn } from "~/lib/utils";

type ButtonLoadingIconProps = {
  isLoading: boolean;
  className?: string;
};

/** Spinner for async buttons; always reserves icon space to avoid layout shift. */
export function ButtonLoadingIcon({
  isLoading,
  className,
}: ButtonLoadingIconProps) {
  return (
    <Loader2
      className={cn(
        "size-4 shrink-0",
        isLoading
          ? "animate-spin opacity-100"
          : "pointer-events-none opacity-0",
        className,
      )}
      aria-hidden
    />
  );
}
