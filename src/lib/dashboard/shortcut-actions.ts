export type DashboardShortcutTarget = {
  tagName: string;
  isContentEditable: boolean;
};

export type DashboardShortcutKeyEvent = {
  key: string;
  metaKey: boolean;
  ctrlKey: boolean;
  target: DashboardShortcutTarget;
  preventDefault: () => void;
};

export type DashboardShortcutAction = "focus-search" | "close-artifact";

export function resolveDashboardShortcutAction(
  event: DashboardShortcutKeyEvent,
  artifactOpen: boolean,
): DashboardShortcutAction | null {
  const isEditableTarget =
    event.target.isContentEditable ||
    event.target.tagName === "INPUT" ||
    event.target.tagName === "TEXTAREA" ||
    event.target.tagName === "SELECT";

  if (isEditableTarget) {
    if (event.key === "Escape" && artifactOpen) {
      event.preventDefault();
      return "close-artifact";
    }

    return null;
  }

  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    return "focus-search";
  }

  if (event.key === "Escape" && artifactOpen) {
    event.preventDefault();
    return "close-artifact";
  }

  return null;
}
