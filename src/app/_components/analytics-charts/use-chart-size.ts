"use client";

import { useEffect, useRef, useState } from "react";

type UseChartSizeOptions = {
  aspectRatio?: number;
  minHeight?: number;
  maxHeight?: number;
};

export function useChartSize({
  aspectRatio = 0.52,
  minHeight = 220,
  maxHeight = 360,
}: UseChartSizeOptions = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 640, height: 320 });

  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    const updateSize = () => {
      const width = element.clientWidth;
      const height = Math.min(maxHeight, Math.max(minHeight, width * aspectRatio));
      setSize({ width, height });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    return () => observer.disconnect();
  }, [aspectRatio, maxHeight, minHeight]);

  return { containerRef, ...size };
}
