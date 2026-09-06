import { useEffect, useRef, type RefObject } from "react";

export type CanvasFrameContext = {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  dpr: number;
  reducedMotion: boolean;
};

type CanvasAnimationOptions = {
  deps?: unknown[];
};

export function useCanvasAnimation(
  draw: (frame: CanvasFrameContext, time: number, delta: number) => void,
  options: CanvasAnimationOptions = {},
): RefObject<HTMLCanvasElement | null> {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const deps = options.deps ?? [];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let animationFrame = 0;
    let lastTime = performance.now();

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) {
        return;
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = parent.clientWidth;
      const height = parent.clientHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const tick = (time: number) => {
      const parent = canvas.parentElement;
      if (!parent) {
        return;
      }

      const delta = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      draw(
        {
          ctx,
          width: parent.clientWidth,
          height: parent.clientHeight,
          dpr: Math.min(window.devicePixelRatio || 1, 2),
          reducedMotion,
        },
        time,
        delta,
      );

      animationFrame = window.requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener("resize", resize);
    animationFrame = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- draw identity is controlled by callers via deps
  }, deps);

  return canvasRef;
}

export function clearCanvas(frame: CanvasFrameContext): void {
  frame.ctx.clearRect(0, 0, frame.width, frame.height);
}

export function computeGalaxyScale(width: number, height: number): number {
  return Math.min(
    width * 0.92,
    height * 0.96,
    Math.hypot(width, height) * 0.52,
  );
}

export function computeScopeRadius(width: number, height: number): number {
  const inset = 0.03;
  const verticalRadius = height * 0.5 * (1 - inset);
  const horizontalRadius = width * 0.5 * (1 - inset);

  // Tall viewports: fill the full screen height (minor horizontal clipping is ok).
  // Wide viewports: height is the limiting axis, so the same vertical radius fits.
  return height >= width
    ? verticalRadius
    : Math.min(verticalRadius, horizontalRadius);
}
