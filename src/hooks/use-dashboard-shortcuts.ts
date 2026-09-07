"use client";

import { useEffect } from "react";

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

      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT")
      ) {
        if (event.key === "Escape" && artifactOpen) {
          event.preventDefault();
          onCloseArtifact();
        }

        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.getElementById("tracker-search")?.focus();
        return;
      }

      if (event.key === "Escape" && artifactOpen) {
        event.preventDefault();
        onCloseArtifact();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [artifactOpen, onCloseArtifact]);
}
