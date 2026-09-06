import { Loader2 } from "lucide-react";

import { cn } from "~/lib/utils";

type ButtonLoadingIconProps = {
  isLoading: boolean;
  className?: string;
};

/** Spinner for async buttons; omitted when idle so label text stays centered. */
export function ButtonLoadingIcon({
  isLoading,
  className,
}: ButtonLoadingIconProps) {
  if (!isLoading) {
    return null;
  }

  return (
    <Loader2
      className={cn("size-4 shrink-0 animate-spin", className)}
      aria-hidden="true"
    />
  );
}
