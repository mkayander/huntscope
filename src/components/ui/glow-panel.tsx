"use client";

import {
  useCallback,
  useRef,
  type ComponentProps,
  type CSSProperties,
  type PointerEvent,
} from "react";

import type { DashboardSectionId } from "~/lib/dashboard/sections";
import { getSectionPanelAccent } from "~/lib/dashboard/section-backgrounds";
import { cn } from "~/lib/utils";

const GLOW_PANEL_STYLE = {
  "--glow-x": "50%",
  "--glow-y": "42%",
} as CSSProperties;

type GlowPanelProps = ComponentProps<"section"> & {
  interactive?: boolean;
  variant?: "default" | "dashed";
  contentClassName?: string;
  accent?: DashboardSectionId;
};

export function GlowPanel({
  children,
  className,
  contentClassName,
  interactive = true,
  variant = "default",
  accent,
  onPointerEnter,
  onPointerMove,
  style,
  ...props
}: GlowPanelProps) {
  const rootRef = useRef<HTMLElement>(null);
  const accentConfig = accent ? getSectionPanelAccent(accent) : null;

  const updateGlowPosition = useCallback((event: PointerEvent<HTMLElement>) => {
    const element = rootRef.current;
    if (!element) {
      return;
    }

    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      return;
    }

    const pointerXPct = ((event.clientX - rect.left) / rect.width) * 100;
    const pointerYPct = ((event.clientY - rect.top) / rect.height) * 100;
    element.style.setProperty("--glow-x", `${pointerXPct}%`);
    element.style.setProperty("--glow-y", `${pointerYPct}%`);
  }, []);

  const handlePointerEnter = (event: PointerEvent<HTMLElement>) => {
    updateGlowPosition(event);
    onPointerEnter?.(event);
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    updateGlowPosition(event);
    onPointerMove?.(event);
  };

  return (
    <section
      ref={rootRef}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      className={cn(
        "group/glow-panel relative overflow-hidden rounded-2xl border bg-white/5 p-6",
        variant === "dashed" ? "border-dashed border-white/15" : "border-white/10",
        interactive &&
          "motion-safe:transition-[border-color,box-shadow] motion-safe:duration-300 motion-safe:hover:border-white/16 motion-safe:hover:shadow-[0_0_0_1px_rgba(167,139,250,0.08)_inset]",
        className,
      )}
      style={{ ...GLOW_PANEL_STYLE, ...style }}
      {...props}
    >
      {accentConfig ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit]"
        >
          {accentConfig.wash ? (
            <div className="absolute inset-0" style={{ background: accentConfig.wash }} />
          ) : null}
          {accentConfig.orbs.map((orb) => (
            <div key={orb.className} className={orb.className} />
          ))}
        </div>
      ) : null}

      {interactive ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] opacity-0 transition-opacity duration-500 motion-reduce:opacity-0 motion-safe:group-hover/glow-panel:opacity-70"
          style={{
            background:
              "radial-gradient(380px circle at var(--glow-x) var(--glow-y), rgba(139, 92, 246, 0.07) 0%, rgba(124, 58, 237, 0.03) 40%, transparent 62%)",
          }}
        />
      ) : null}

      <div className={cn("relative z-[1] min-w-0", contentClassName)}>{children}</div>

      {interactive ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[2] rounded-[inherit] p-px opacity-0 transition-opacity duration-500 motion-reduce:opacity-0 motion-safe:group-hover/glow-panel:opacity-55"
          style={{
            background:
              "radial-gradient(320px circle at var(--glow-x) var(--glow-y), rgba(167, 139, 250, 0.28) 0%, rgba(139, 92, 246, 0.1) 36%, transparent 66%)",
            WebkitMask:
              "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
          }}
        />
      ) : null}
    </section>
  );
}
