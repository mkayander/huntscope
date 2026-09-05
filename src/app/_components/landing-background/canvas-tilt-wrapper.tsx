"use client";

import { useEffect, useRef, type ReactNode } from "react";

const TILT_DEGREES = 7;
const SMOOTHING = 0.08;

type TiltWrapperProps = {
  children: ReactNode;
  enabled?: boolean;
};

export function CanvasTiltWrapper({ children, enabled = true }: TiltWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      return;
    }

    const onPointerMove = (event: PointerEvent) => {
      targetRef.current = {
        x: (event.clientX / window.innerWidth - 0.5) * 2,
        y: (event.clientY / window.innerHeight - 0.5) * 2,
      };
    };

    const onPointerLeave = () => {
      targetRef.current = { x: 0, y: 0 };
    };

    const tick = () => {
      const container = containerRef.current;
      if (container) {
        currentRef.current = {
          x: currentRef.current.x + (targetRef.current.x - currentRef.current.x) * SMOOTHING,
          y: currentRef.current.y + (targetRef.current.y - currentRef.current.y) * SMOOTHING,
        };

        container.style.transform = [
          "perspective(1100px)",
          `rotateX(${(-currentRef.current.y * TILT_DEGREES).toFixed(3)}deg)`,
          `rotateY(${(currentRef.current.x * TILT_DEGREES).toFixed(3)}deg)`,
          "scale(1.04)",
        ].join(" ");
      }

      frameRef.current = window.requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerleave", onPointerLeave);
    frameRef.current = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameRef.current);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [enabled]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 origin-center will-change-transform"
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
    </div>
  );
}

export function ThreeSceneWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 min-h-full w-full origin-center scale-[1.08] sm:scale-[1.14]">
      <div className="absolute inset-[-8%_-4%_-2%_-4%]">{children}</div>
    </div>
  );
}
