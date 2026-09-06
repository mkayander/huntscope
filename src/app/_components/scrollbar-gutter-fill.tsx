"use client";

import { useLayoutEffect, useState } from "react";

function measureScrollbarGutter() {
  const doc = document.documentElement;
  const body = document.body;

  // Stable gutter shrinks the body/content box while the visual viewport stays wide.
  return Math.max(
    0,
    window.innerWidth - doc.clientWidth,
    doc.clientWidth - body.clientWidth,
  );
}

function applyScrollbarGutter(gutter: number) {
  const root = document.documentElement;

  if (gutter > 0) {
    root.dataset.scrollbarGutter = "";
    root.style.setProperty("--scrollbar-gutter", `${gutter}px`);
  } else {
    delete root.dataset.scrollbarGutter;
    root.style.removeProperty("--scrollbar-gutter");
  }
}

export function ScrollbarGutterFill() {
  const [gutterWidth, setGutterWidth] = useState(0);

  useLayoutEffect(() => {
    const sync = () => {
      const gutter = measureScrollbarGutter();
      setGutterWidth(gutter);
      applyScrollbarGutter(gutter);
    };

    sync();

    window.addEventListener("resize", sync);

    const observer = new ResizeObserver(sync);
    observer.observe(document.documentElement);
    observer.observe(document.body);

    return () => {
      window.removeEventListener("resize", sync);
      observer.disconnect();
      applyScrollbarGutter(0);
    };
  }, []);

  if (gutterWidth <= 0) {
    return null;
  }

  return (
    <div
      aria-hidden
      className="scrollbar-gutter-fill pointer-events-none fixed top-0 bottom-0 z-[1]"
      style={{ width: gutterWidth }}
    />
  );
}
