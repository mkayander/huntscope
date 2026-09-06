export function isInstalledPwa() {
  return (
    typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches ||
      window.matchMedia("(display-mode: window-controls-overlay)").matches)
  );
}

export function supportsPwaInstall() {
  return typeof window !== "undefined" && "serviceWorker" in navigator;
}
