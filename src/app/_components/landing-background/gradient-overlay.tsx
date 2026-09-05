import type { LandingBackgroundEffect } from "~/app/_components/landing-background/types";

type GradientOverlayProps = {
  effect: LandingBackgroundEffect;
};

export function GradientOverlay({ effect }: GradientOverlayProps) {
  const isStarField = effect === "three";
  const isGraphGrid = effect === "graph-grid";
  const light3d = isStarField || isGraphGrid;

  const background = light3d
    ? isStarField
      ? [
          "radial-gradient(ellipse 75% 48% at 50% 20%, rgba(21, 22, 44, 0.38) 0%, rgba(21, 22, 44, 0.08) 52%, rgba(21, 22, 44, 0.28) 100%)",
          "linear-gradient(to bottom, rgba(46, 2, 109, 0.22) 0%, rgba(21, 22, 44, 0.02) 42%, rgba(21, 22, 44, 0.38) 100%)",
        ].join(", ")
      : [
          "radial-gradient(ellipse 80% 52% at 50% 22%, rgba(21, 22, 44, 0.42) 0%, rgba(21, 22, 44, 0.12) 50%, rgba(21, 22, 44, 0.32) 100%)",
          "linear-gradient(to bottom, rgba(46, 2, 109, 0.24) 0%, rgba(21, 22, 44, 0.04) 40%, rgba(21, 22, 44, 0.42) 100%)",
        ].join(", ")
    : [
        "radial-gradient(ellipse 90% 60% at 50% 28%, rgba(21, 22, 44, 0.55) 0%, rgba(21, 22, 44, 0.85) 55%, rgba(21, 22, 44, 0.95) 100%)",
        "linear-gradient(to bottom, rgba(46, 2, 109, 0.35) 0%, rgba(21, 22, 44, 0.2) 35%, rgba(21, 22, 44, 0.75) 100%)",
      ].join(", ");

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[1]"
      style={{ background }}
    />
  );
}
