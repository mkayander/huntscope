"use client";

import dynamic from "next/dynamic";

import {
  CanvasTiltWrapper,
  ThreeSceneWrapper,
} from "~/app/_components/landing-background/canvas-tilt-wrapper";
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

const GraphGridEffect = dynamic(
  () =>
    import("~/app/_components/landing-background/effects/graph-grid-effect").then(
      (module) => module.GraphGridEffect,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center text-sm text-white/40">
        Loading graph grid…
      </div>
    ),
  },
);

function ScopeOverlayLayer({ placement }: { placement: "back" | "front" }) {
  return (
    <div
      className={
        placement === "front"
          ? "pointer-events-none absolute inset-0 z-[2]"
          : "pointer-events-none absolute inset-0 z-[0]"
      }
    >
      <ScopeEffect
        variant={placement === "front" ? "overlay-front" : "overlay-back"}
      />
    </div>
  );
}

function EffectRenderer({ effect }: { effect: LandingBackgroundEffect }) {
  switch (effect) {
    case "galaxy":
      return (
        <CanvasTiltWrapper>
          <GalaxyEffect />
        </CanvasTiltWrapper>
      );
    case "scope":
      return (
        <CanvasTiltWrapper>
          <ScopeEffect variant="primary" />
        </CanvasTiltWrapper>
      );
    case "constellation":
      return (
        <CanvasTiltWrapper>
          <ConstellationEffect />
        </CanvasTiltWrapper>
      );
    case "three":
      return (
        <ThreeSceneWrapper>
          <ThreeEffect />
        </ThreeSceneWrapper>
      );
    case "graph-grid":
      return (
        <ThreeSceneWrapper>
          <GraphGridEffect />
        </ThreeSceneWrapper>
      );
    default:
      return (
        <CanvasTiltWrapper>
          <ScopeEffect variant="primary" />
        </CanvasTiltWrapper>
      );
  }
}

export function LandingBackgroundCanvas() {
  const { effect, scopeOverlayEnabled, scopeOverlayLayer } =
    useLandingBackground();
  const isInteractive3d = effect === "three" || effect === "graph-grid";
  const showScopeOverlay = scopeOverlayEnabled && effect !== "scope";
  const scopeBehindParticles = effect === "three";
  const showScopeBack =
    showScopeOverlay && (scopeBehindParticles || scopeOverlayLayer === "back");
  const showScopeFront =
    showScopeOverlay && !scopeBehindParticles && scopeOverlayLayer === "front";

  return (
    <div
      className={
        isInteractive3d
          ? "pointer-events-auto fixed inset-x-0 top-0 z-0 h-[100dvh] overflow-hidden"
          : "pointer-events-none fixed inset-x-0 top-0 z-0 h-[100dvh] overflow-hidden"
      }
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#2e026d] to-[#15162c]" />

      {showScopeBack ? (
        scopeBehindParticles ? (
          <CanvasTiltWrapper>
            <ScopeOverlayLayer placement="back" />
          </CanvasTiltWrapper>
        ) : (
          <ScopeOverlayLayer placement="back" />
        )
      ) : null}

      <div
        className={
          scopeBehindParticles
            ? "absolute inset-0 z-[1]"
            : "absolute inset-0 z-[0]"
        }
      >
        <EffectRenderer effect={effect} />
      </div>

      <GradientOverlay />

      {showScopeFront ? <ScopeOverlayLayer placement="front" /> : null}
    </div>
  );
}
