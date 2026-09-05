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
    radius: 0.1 + Math.random() * 0.88,
    phase: Math.random() * Math.PI * 2,
    size: 2.5 + Math.random() * 4,
  }));
}

function computeScopeRadius(width: number, height: number): number {
  return Math.min(width * 0.72, height * 0.78, Math.hypot(width, height) * 0.42);
}

export function ScopeEffect() {
  const blips = useMemo(() => createBlips(28), []);
  const canvasRef = useCanvasAnimation(
    (frame, time, delta) => {
      clearCanvas(frame);

      const { ctx, width, height, pointer, reducedMotion } = frame;
      const centerX = width * 0.5 + pointer.x * 18;
      const centerY = height * 0.5 + pointer.y * 12;
      const baseRadius = computeScopeRadius(width, height);
      const sweepAngle = (time * 0.00035) % (Math.PI * 2);

      ctx.save();
      ctx.translate(centerX, centerY);

      const ringCount = 5;
      for (let ring = 1; ring <= ringCount; ring += 1) {
        const radius = baseRadius * (ring / ringCount);
        ctx.beginPath();
        ctx.strokeStyle = `rgba(167, 139, 250, ${0.07 + ring * 0.035})`;
        ctx.lineWidth = ring === ringCount ? 1.25 : 1;
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.strokeStyle = "rgba(139, 92, 246, 0.12)";
      ctx.lineWidth = 1;
      ctx.moveTo(-baseRadius, 0);
      ctx.lineTo(baseRadius, 0);
      ctx.moveTo(0, -baseRadius);
      ctx.lineTo(0, baseRadius);
      ctx.stroke();

      const sweepGradient = ctx.createLinearGradient(0, 0, baseRadius, 0);
      sweepGradient.addColorStop(0, "rgba(196, 181, 253, 0.55)");
      sweepGradient.addColorStop(1, "rgba(196, 181, 253, 0.08)");

      ctx.save();
      ctx.rotate(sweepAngle);
      ctx.beginPath();
      ctx.strokeStyle = sweepGradient;
      ctx.lineWidth = 2;
      ctx.moveTo(0, 0);
      ctx.lineTo(baseRadius, 0);
      ctx.stroke();

      ctx.beginPath();
      ctx.fillStyle = "rgba(167, 139, 250, 0.08)";
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, baseRadius, -0.08, 0.08);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      ctx.beginPath();
      ctx.fillStyle = "rgba(196, 181, 253, 0.7)";
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
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
        ctx.arc(x, y, blip.size * (0.75 + pulse * 0.55), 0, Math.PI * 2);
        ctx.fill();

        if (sweepProximity > 0.45) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(196, 181, 253, ${sweepProximity * 0.45})`;
          ctx.lineWidth = 1.25;
          ctx.arc(x, y, blip.size * 2.6, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      ctx.restore();
    },
    { deps: [blips] },
  );

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />;
}
