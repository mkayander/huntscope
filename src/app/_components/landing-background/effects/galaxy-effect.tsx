"use client";

import { useMemo } from "react";

import {
  clearCanvas,
  computeGalaxyScale,
  useCanvasAnimation,
} from "~/app/_components/landing-background/canvas-utils";

type SpiralStar = {
  radius: number;
  angle: number;
  height: number;
  size: number;
  tone: number;
  twinkle: number;
};

const ARM_COUNT = 6;
const STAR_COUNT = 3600;
const TILT_RADIANS = 0.88;
const PERSPECTIVE = 5.4;

function createSpiralGalaxy(): SpiralStar[] {
  const stars: SpiralStar[] = [];

  for (let index = 0; index < STAR_COUNT; index += 1) {
    const radius = Math.pow(Math.random(), 0.5);
    const arm = index % ARM_COUNT;
    const armOffset = (arm / ARM_COUNT) * Math.PI * 2;
    const spiralTightness = 6.4;
    const spiralAngle = Math.log(radius * 0.92 + 0.1) * spiralTightness + armOffset;
    const armScatter = (Math.random() - 0.5) * (0.14 - radius * 0.05);
    const angle = spiralAngle + armScatter;

    stars.push({
      radius,
      angle,
      height: (Math.random() - 0.5) * 0.07 * (1 - radius * 0.35),
      size: Math.random() * 1.25 + 0.35,
      tone: Math.random(),
      twinkle: Math.random() * Math.PI * 2,
    });
  }

  return stars;
}

function projectGalaxyPoint(
  star: SpiralStar,
  spin: number,
  centerX: number,
  centerY: number,
  scale: number,
): {
  x: number;
  y: number;
  depth: number;
  radius: number;
} {
  const differentialSpin = spin / (star.radius * 0.85 + 0.18);
  const theta = star.angle + differentialSpin;
  const diskX = Math.cos(theta) * star.radius;
  const diskY = Math.sin(theta) * star.radius;

  const tiltedY = diskY * Math.cos(TILT_RADIANS) - star.height * Math.sin(TILT_RADIANS);
  const tiltedZ = diskY * Math.sin(TILT_RADIANS) + star.height * Math.cos(TILT_RADIANS);
  const perspective = PERSPECTIVE / (PERSPECTIVE + tiltedZ + 0.35);
  const x = centerX + diskX * perspective * scale;
  const y = centerY + tiltedY * perspective * scale * 0.9;

  return {
    x,
    y,
    depth: perspective,
    radius: star.radius,
  };
}

export function GalaxyEffect() {
  const stars = useMemo(() => createSpiralGalaxy(), []);
  const canvasRef = useCanvasAnimation(
    (frame, time) => {
      clearCanvas(frame);

      const { ctx, width, height, reducedMotion } = frame;
      const centerX = width * 0.5;
      const centerY = height * 0.5;
      const galaxyScale = computeGalaxyScale(width, height);
      const spin = reducedMotion ? 0 : -time * 0.00012;

      const projected = stars.map((star) => ({
        star,
        ...projectGalaxyPoint(star, spin, centerX, centerY, galaxyScale),
      }));

      projected.sort((left, right) => left.depth - right.depth);

      const coreRadius = galaxyScale * 0.2;
      const core = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreRadius);
      core.addColorStop(0, "rgba(255, 244, 230, 0.38)");
      core.addColorStop(0.18, "rgba(216, 180, 254, 0.24)");
      core.addColorStop(0.55, "rgba(109, 40, 217, 0.08)");
      core.addColorStop(1, "rgba(21, 22, 44, 0)");
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
      ctx.fill();

      for (const entry of projected) {
        const { star, x, y, depth, radius } = entry;
        const twinkle = reducedMotion
          ? 0.78
          : 0.62 + Math.sin(time * 0.0022 + star.twinkle) * 0.22;
        const coreBoost = Math.max(0, 1 - radius * 1.35);
        const alpha =
          (0.08 + depth * 0.55 + coreBoost * 0.35) * twinkle * (0.45 + (1 - radius) * 0.55);
        const violet = star.tone > 0.68;
        const warmCore = radius < 0.16 && star.tone > 0.42;

        ctx.beginPath();
        if (warmCore) {
          ctx.fillStyle = `rgba(255, 236, 210, ${alpha * 1.15})`;
        } else if (violet) {
          ctx.fillStyle = `rgba(196, 181, 253, ${alpha})`;
        } else {
          ctx.fillStyle = `rgba(240, 245, 255, ${alpha})`;
        }

        ctx.arc(x, y, star.size * depth * (0.55 + coreBoost * 0.45), 0, Math.PI * 2);
        ctx.fill();
      }

      if (!reducedMotion) {
        const haze = ctx.createRadialGradient(
          centerX,
          centerY,
          galaxyScale * 0.08,
          centerX,
          centerY,
          galaxyScale * 0.82,
        );
        haze.addColorStop(0, "rgba(124, 58, 237, 0.05)");
        haze.addColorStop(0.45, "rgba(76, 29, 149, 0.035)");
        haze.addColorStop(1, "rgba(21, 22, 44, 0)");
        ctx.fillStyle = haze;
        ctx.fillRect(0, 0, width, height);
      }
    },
    { deps: [stars] },
  );

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />;
}
