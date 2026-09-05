import { useEffect, useRef, type RefObject } from "react";

export type CanvasFrameContext = {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  dpr: number;
  pointer: { x: number; y: number };
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
  const pointerRef = useRef({ x: 0, y: 0 });
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

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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

    const onPointerMove = (event: PointerEvent) => {
      const parent = canvas.parentElement;
      if (!parent) {
        return;
      }

      const rect = parent.getBoundingClientRect();
      pointerRef.current = {
        x: (event.clientX - rect.left) / rect.width - 0.5,
        y: (event.clientY - rect.top) / rect.height - 0.5,
      };
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
          pointer: pointerRef.current,
          reducedMotion,
        },
        time,
        delta,
      );

      animationFrame = window.requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove);
    animationFrame = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- draw identity is controlled by callers via deps
  }, deps);

  return canvasRef;
}

export function clearCanvas(frame: CanvasFrameContext): void {
  frame.ctx.clearRect(0, 0, frame.width, frame.height);
}
