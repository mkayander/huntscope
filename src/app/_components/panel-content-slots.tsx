import type { ReactNode } from "react";

import { cn } from "~/lib/utils";

/** ~4–5 lines of `text-sm` copy on the landing panels. */
export const LANDING_PANEL_DESCRIPTION_MIN_H = "min-h-24";

/** Fits either the install hint paragraph or the pill button. */
export const LANDING_PANEL_INSTALL_MIN_H = "min-h-12";

/** Matches `Button` `size="cta"` (`h-12`). */
export const LANDING_PANEL_CTA_MIN_H = "min-h-12";

type PanelDescriptionSlotProps = {
  children: ReactNode;
  variant?: "landing" | "dashboard";
  className?: string;
};

export function PanelDescriptionSlot({
  children,
  variant = "landing",
  className,
}: PanelDescriptionSlotProps) {
  return (
    <div
      className={cn(
        "w-full",
        variant === "landing"
          ? cn("text-center", LANDING_PANEL_DESCRIPTION_MIN_H)
          : "min-h-10",
        className,
      )}
    >
      {children}
    </div>
  );
}

type PanelInstallHintSlotProps = {
  children: ReactNode;
  className?: string;
};

export function PanelInstallHintSlot({
  children,
  className,
}: PanelInstallHintSlotProps) {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-center",
        LANDING_PANEL_INSTALL_MIN_H,
        className,
      )}
    >
      {children}
    </div>
  );
}

type PanelPrimaryActionSlotProps = {
  children: ReactNode;
  centered?: boolean;
  className?: string;
};

export function PanelPrimaryActionSlot({
  children,
  centered = false,
  className,
}: PanelPrimaryActionSlotProps) {
  return (
    <div
      className={cn(
        "flex w-full items-center",
        LANDING_PANEL_CTA_MIN_H,
        centered && "justify-center",
        className,
      )}
    >
      {children}
    </div>
  );
}

type StableButtonLabelProps = {
  children: ReactNode;
  placeholder: string;
  className?: string;
};

/** Keeps async button labels from changing the button width. */
export function StableButtonLabel({
  children,
  placeholder,
  className,
}: StableButtonLabelProps) {
  return (
    <span
      className={cn(
        "grid text-center [&>*]:col-start-1 [&>*]:row-start-1",
        className,
      )}
    >
      <span aria-hidden className="invisible">
        {placeholder}
      </span>
      <span>{children}</span>
    </span>
  );
}
