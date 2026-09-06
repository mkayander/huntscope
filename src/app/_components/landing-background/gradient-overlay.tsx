import { PAGE_SHELL_HERO_OVERLAY } from "~/lib/page-shell-background";

export function GradientOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[1]"
      style={{ background: PAGE_SHELL_HERO_OVERLAY }}
    />
  );
}
