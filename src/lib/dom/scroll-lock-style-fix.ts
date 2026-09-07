export const SCROLL_LOCK_FIX_STYLE_ID = "huntscope-scroll-lock-fix";

/**
 * Neutralizes react-remove-scroll compensation when scrollbar-gutter: stable
 * already reserves gutter space on html.
 */
export const SCROLL_LOCK_FIX_CSS = `
body[data-scroll-locked] {
  --removed-body-scroll-bar-size: 0px !important;
  margin-right: 0 !important;
  padding-right: 0 !important;
  padding-left: 0 !important;
  margin-left: 0 !important;
}

.right-scroll-bar-position {
  right: 0 !important;
}

.width-before-scroll-bar {
  margin-right: 0 !important;
}
`;

export function applyScrollLockBodyStyles(): void {
  if (!document.body.hasAttribute("data-scroll-locked")) {
    return;
  }

  document.body.style.setProperty("padding-right", "0", "important");
  document.body.style.setProperty("margin-right", "0", "important");
  document.body.style.setProperty("padding-left", "0", "important");
  document.body.style.setProperty("margin-left", "0", "important");
}

export function clearScrollLockBodyStyles(): void {
  document.body.style.removeProperty("padding-right");
  document.body.style.removeProperty("margin-right");
  document.body.style.removeProperty("padding-left");
  document.body.style.removeProperty("margin-left");
}

export function ensureScrollLockFixStyle(): void {
  let style = document.getElementById(SCROLL_LOCK_FIX_STYLE_ID);

  if (!style) {
    style = document.createElement("style");
    style.id = SCROLL_LOCK_FIX_STYLE_ID;
    document.head.appendChild(style);
  }

  style.textContent = SCROLL_LOCK_FIX_CSS;
  document.head.appendChild(style);
}
