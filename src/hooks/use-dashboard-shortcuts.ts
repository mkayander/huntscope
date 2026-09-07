"use client";

import { useEffect } from "react";

import { resolveDashboardShortcutAction } from "~/lib/dashboard/shortcut-actions";
import { openDashboardFilters } from "~/lib/career-ops/dashboard-filters";

type UseDashboardShortcutsOptions = {
  artifactOpen: boolean;
  onCloseArtifact: () => void;
};

export function useDashboardShortcuts({
  artifactOpen,
  onCloseArtifact,
}: UseDashboardShortcutsOptions) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      const action = resolveDashboardShortcutAction(
        {
          key: event.key,
          metaKey: event.metaKey,
          ctrlKey: event.ctrlKey,
          target: {
            tagName: target instanceof HTMLElement ? target.tagName : "",
            isContentEditable:
              target instanceof HTMLElement ? target.isContentEditable : false,
          },
          preventDefault: () => event.preventDefault(),
        },
        artifactOpen,
      );

      if (action === "focus-search") {
        openDashboardFilters();
        return;
      }

      if (action === "close-artifact") {
        onCloseArtifact();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [artifactOpen, onCloseArtifact]);
}
