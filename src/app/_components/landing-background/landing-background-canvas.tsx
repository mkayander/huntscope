"use client";

import dynamic from "next/dynamic";

import { GalaxyEffect } from "~/app/_components/landing-background/effects/galaxy-effect";
import { ConstellationEffect } from "~/app/_components/landing-background/effects/constellation-effect";
import { ScopeEffect } from "~/app/_components/landing-background/effects/scope-effect";
import { GradientOverlay } from "~/app/_components/landing-background/gradient-overlay";
import { useLandingBackground } from "~/app/_components/landing-background/landing-background-context";
import type { LandingBackgroundEffect } from "~/app/_components/landing-background/types";

const ThreeEffect = dynamic(
  () =>
    import("~/app/_components/landing-background/effects/three-effect").then(
      (module) => module.ThreeEffect,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center text-sm text-white/40">
        Loading 3D preview…
      </div>
    ),
  },
);

function EffectRenderer({
  effect,
  interactive,
}: {
  effect: LandingBackgroundEffect;
  interactive: boolean;
}) {
  const content = (() => {
    switch (effect) {
      case "galaxy":
        return <GalaxyEffect />;
      case "scope":
        return <ScopeEffect />;
      case "constellation":
        return <ConstellationEffect />;
      case "three":
        return <ThreeEffect />;
      default:
        return <ScopeEffect />;
    }
  })();

  return (
    <div className={interactive ? "pointer-events-auto absolute inset-0" : "absolute inset-0"}>
      {content}
    </div>
  );
}

export function LandingBackgroundCanvas() {
  const { effect } = useLandingBackground();

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#2e026d] to-[#15162c]" />
      <EffectRenderer effect={effect} interactive={effect === "three"} />
      <GradientOverlay />
    </div>
  );
}
