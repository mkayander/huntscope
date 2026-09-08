export const VISUAL_VIEWPORT_HEIGHT_VAR = "--visual-viewport-height";

export function readVisualViewportHeight(): number {
  if (typeof window === "undefined") {
    return 0;
  }

  return window.visualViewport?.height ?? window.innerHeight;
}

export function syncVisualViewportHeight(
  root: HTMLElement = document.documentElement,
) {
  root.style.setProperty(
    VISUAL_VIEWPORT_HEIGHT_VAR,
    `${readVisualViewportHeight()}px`,
  );
}

export function clearVisualViewportHeight(
  root: HTMLElement = document.documentElement,
) {
  root.style.removeProperty(VISUAL_VIEWPORT_HEIGHT_VAR);
}

export function bindVisualViewportHeight(
  root: HTMLElement = document.documentElement,
): () => void {
  const sync = () => {
    syncVisualViewportHeight(root);
  };

  sync();

  const viewport = window.visualViewport;
  viewport?.addEventListener("resize", sync);
  viewport?.addEventListener("scroll", sync);
  window.addEventListener("resize", sync);
  window.addEventListener("orientationchange", sync);

  return () => {
    viewport?.removeEventListener("resize", sync);
    viewport?.removeEventListener("scroll", sync);
    window.removeEventListener("resize", sync);
    window.removeEventListener("orientationchange", sync);
    clearVisualViewportHeight(root);
  };
}
