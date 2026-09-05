"use client";

import { useMemo } from "react";

import { clearCanvas, useCanvasAnimation } from "~/app/_components/landing-background/canvas-utils";

type Star = {
  x: number;
  y: number;
  z: number;
  radius: number;
  twinkle: number;
  tone: number;
};

function createStars(count: number): Star[] {
  return Array.from({ length: count }, () => ({
    x: Math.random(),
    y: Math.random(),
    z: Math.random(),
    radius: Math.random() * 1.6 + 0.4,
    twinkle: Math.random() * Math.PI * 2,
    tone: Math.random(),
  }));
}

export function GalaxyEffect() {
  const stars = useMemo(() => createStars(220), []);
  const canvasRef = useCanvasAnimation(
    (frame, time, delta) => {
      clearCanvas(frame);

      const { ctx, width, height, pointer, reducedMotion } = frame;
      const parallaxX = pointer.x * 28;
      const parallaxY = pointer.y * 18;
      const drift = reducedMotion ? 0 : delta * 0.015;

      for (const star of stars) {
        star.y += drift * (0.35 + star.z);
        if (star.y > 1.08) {
          star.y = -0.08;
          star.x = Math.random();
        }

        const depth = 0.25 + star.z * 0.75;
        const x = (star.x + pointer.x * depth * 0.08) * width + parallaxX * depth;
        const y = star.y * height + parallaxY * depth;
        const twinkle = reducedMotion
          ? 0.75
          : 0.55 + Math.sin(time * 0.002 + star.twinkle) * 0.25;
        const alpha = (0.15 + star.z * 0.65) * twinkle;
        const violet = star.tone > 0.72;

        ctx.beginPath();
        ctx.fillStyle = violet
          ? `rgba(196, 181, 253, ${alpha})`
          : `rgba(255, 255, 255, ${alpha})`;
        ctx.arc(x, y, star.radius * (0.6 + depth), 0, Math.PI * 2);
        ctx.fill();
      }

      const nebula = ctx.createRadialGradient(
        width * 0.55 + parallaxX,
        height * 0.35 + parallaxY,
        0,
        width * 0.55,
        height * 0.35,
        width * 0.45,
      );
      nebula.addColorStop(0, "rgba(139, 92, 246, 0.12)");
      nebula.addColorStop(0.5, "rgba(76, 29, 149, 0.06)");
      nebula.addColorStop(1, "rgba(21, 22, 44, 0)");
      ctx.fillStyle = nebula;
      ctx.fillRect(0, 0, width, height);
    },
    { deps: [stars] },
  );

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />;
}
