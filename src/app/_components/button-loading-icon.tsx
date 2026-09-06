import { Loader2 } from "lucide-react";

import { cn } from "~/lib/utils";

type ButtonLoadingIconProps = {
  isLoading: boolean;
  className?: string;
};

/** Reserves icon space so button width stays stable while loading. */
export function ButtonLoadingIcon({
  isLoading,
  className,
}: ButtonLoadingIconProps) {
  return (
    <Loader2
      className={cn(
        "size-4 shrink-0 animate-spin",
        !isLoading && "invisible",
        className,
      )}
      aria-hidden="true"
    />
  );
}
