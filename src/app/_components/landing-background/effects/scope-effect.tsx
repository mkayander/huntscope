"use client";

import { useMemo } from "react";

import { clearCanvas, useCanvasAnimation } from "~/app/_components/landing-background/canvas-utils";

type Blip = {
  angle: number;
  radius: number;
  phase: number;
  size: number;
};

function createBlips(count: number): Blip[] {
  return Array.from({ length: count }, () => ({
    angle: Math.random() * Math.PI * 2,
    radius: 0.12 + Math.random() * 0.38,
    phase: Math.random() * Math.PI * 2,
    size: 2 + Math.random() * 3,
  }));
}

export function ScopeEffect() {
  const blips = useMemo(() => createBlips(18), []);
  const canvasRef = useCanvasAnimation(
    (frame, time, delta) => {
      clearCanvas(frame);

      const { ctx, width, height, pointer, reducedMotion } = frame;
      const centerX = width * 0.5 + pointer.x * 24;
      const centerY = height * 0.42 + pointer.y * 16;
      const baseRadius = Math.min(width, height) * 0.34;
      const sweepAngle = (time * 0.00035) % (Math.PI * 2);

      ctx.save();
      ctx.translate(centerX, centerY);

      for (let ring = 1; ring <= 3; ring += 1) {
        const radius = baseRadius * (ring / 3);
        ctx.beginPath();
        ctx.strokeStyle = `rgba(167, 139, 250, ${0.08 + ring * 0.04})`;
        ctx.lineWidth = 1;
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.strokeStyle = "rgba(196, 181, 253, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(sweepAngle) * baseRadius, Math.sin(sweepAngle) * baseRadius);
      ctx.stroke();

      ctx.beginPath();
      ctx.fillStyle = "rgba(167, 139, 250, 0.55)";
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();

      for (const blip of blips) {
        if (!reducedMotion) {
          blip.phase += delta * (0.4 + blip.radius);
        }

        const x = Math.cos(blip.angle) * baseRadius * blip.radius;
        const y = Math.sin(blip.angle) * baseRadius * blip.radius;
        const angleDiff = Math.atan2(
          Math.sin(blip.angle - sweepAngle),
          Math.cos(blip.angle - sweepAngle),
        );
        const sweepProximity = Math.max(0, 1 - Math.abs(angleDiff) * 2.4);
        const pulse = 0.35 + Math.sin(blip.phase) * 0.15 + sweepProximity * 0.55;

        ctx.beginPath();
        ctx.fillStyle = `rgba(221, 214, 254, ${0.25 + pulse * 0.55})`;
        ctx.arc(x, y, blip.size * (0.7 + pulse * 0.5), 0, Math.PI * 2);
        ctx.fill();

        if (sweepProximity > 0.45) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(196, 181, 253, ${sweepProximity * 0.45})`;
          ctx.lineWidth = 1;
          ctx.arc(x, y, blip.size * 2.4, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      ctx.restore();
    },
    { deps: [blips] },
  );

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />;
}
