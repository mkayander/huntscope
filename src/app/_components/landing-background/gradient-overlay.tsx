const HERO_GRADIENT_OVERLAY = [
  "radial-gradient(ellipse 90% 60% at 50% 28%, rgba(21, 22, 44, 0.55) 0%, rgba(21, 22, 44, 0.85) 55%, rgba(21, 22, 44, 0.95) 100%)",
  "linear-gradient(to bottom, rgba(46, 2, 109, 0.35) 0%, rgba(21, 22, 44, 0.2) 35%, rgba(21, 22, 44, 0.75) 100%)",
].join(", ");

export function GradientOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[1]"
      style={{ background: HERO_GRADIENT_OVERLAY }}
    />
  );
}
