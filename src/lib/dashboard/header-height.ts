export const DASHBOARD_HEADER_HEIGHT_CSS_VAR = "--dashboard-header-height";

export const DASHBOARD_HEADER_HEIGHT_FALLBACK = "4.75rem";

export function setDashboardHeaderHeight(element: HTMLElement | null) {
  if (!element) {
    return;
  }

  document.documentElement.style.setProperty(
    DASHBOARD_HEADER_HEIGHT_CSS_VAR,
    `${element.offsetHeight}px`,
  );
}

export function readDashboardHeaderScrollOffset(
  fallback = 112,
  extraPadding = 16,
): number {
  if (typeof window === "undefined") {
    return fallback;
  }

  const raw = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue(DASHBOARD_HEADER_HEIGHT_CSS_VAR);
  const parsed = Number.parseFloat(raw);

  if (Number.isFinite(parsed) && parsed > 0) {
    return Math.round(parsed + extraPadding);
  }

  return fallback;
}
