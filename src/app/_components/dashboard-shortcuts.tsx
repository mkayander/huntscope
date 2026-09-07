"use client";

import { useDashboardShortcuts } from "~/hooks/use-dashboard-shortcuts";
import { useArtifactViewer } from "~/hooks/use-artifact-viewer";

export function DashboardShortcuts() {
  const { activeArtifact, closeArtifact } = useArtifactViewer();

  useDashboardShortcuts({
    artifactOpen: activeArtifact != null,
    onCloseArtifact: closeArtifact,
  });

  return null;
}
