/** Hero overlay — keep in sync with landing `GradientOverlay`. */
export const PAGE_SHELL_HERO_OVERLAY = [
  "radial-gradient(ellipse 90% 60% at 50% 28%, rgba(21, 22, 44, 0.55) 0%, rgba(21, 22, 44, 0.85) 55%, rgba(21, 22, 44, 0.95) 100%)",
  "linear-gradient(to bottom, rgba(46, 2, 109, 0.35) 0%, rgba(21, 22, 44, 0.2) 35%, rgba(21, 22, 44, 0.75) 100%)",
].join(", ");

export const PAGE_SHELL_BASE_GRADIENT =
  "linear-gradient(180deg, #2e026d 0%, #15162c 100%)";

/** Paints the scrollbar gutter to match the landing hero stack. */
export const PAGE_SHELL_LANDING_BACKGROUND = [
  PAGE_SHELL_HERO_OVERLAY,
  PAGE_SHELL_BASE_GRADIENT,
].join(", ");
