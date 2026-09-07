const OVERLAY_SCROLL_LOCK_ATTRIBUTE = "data-overlay-scroll-locked";

let overlayScrollLockCount = 0;

export function acquireBodyScrollLock(): () => void {
  if (typeof document === "undefined") {
    return () => undefined;
  }

  overlayScrollLockCount += 1;

  if (overlayScrollLockCount === 1) {
    document.body.setAttribute(OVERLAY_SCROLL_LOCK_ATTRIBUTE, "");
  }

  let released = false;

  return () => {
    if (released) {
      return;
    }

    released = true;
    overlayScrollLockCount = Math.max(0, overlayScrollLockCount - 1);

    if (overlayScrollLockCount === 0) {
      document.body.removeAttribute(OVERLAY_SCROLL_LOCK_ATTRIBUTE);
    }
  };
}
