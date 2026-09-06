import type { ReactNode } from "react";

import { cn } from "~/lib/utils";

type ActionButtonRowProps = {
  children: ReactNode;
  className?: string;
  centered?: boolean;
};

export function ActionButtonRow({
  children,
  className,
  centered = false,
}: ActionButtonRowProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3",
        centered && "justify-center",
        className,
      )}
    >
      {children}
    </div>
  );
}
