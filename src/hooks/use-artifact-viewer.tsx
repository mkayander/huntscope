"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ArtifactPreviewRequest = {
  path: string;
  label?: string;
};

type ArtifactViewerContextValue = {
  activeArtifact: ArtifactPreviewRequest | null;
  openArtifact: (request: ArtifactPreviewRequest) => void;
  closeArtifact: () => void;
};

const ArtifactViewerContext = createContext<ArtifactViewerContextValue | null>(
  null,
);

export function ArtifactViewerProvider({ children }: { children: ReactNode }) {
  const [activeArtifact, setActiveArtifact] =
    useState<ArtifactPreviewRequest | null>(null);

  const openArtifact = useCallback((request: ArtifactPreviewRequest) => {
    setActiveArtifact(request);
  }, []);

  const closeArtifact = useCallback(() => {
    setActiveArtifact(null);
  }, []);

  const value = useMemo(
    () => ({
      activeArtifact,
      openArtifact,
      closeArtifact,
    }),
    [activeArtifact, closeArtifact, openArtifact],
  );

  return (
    <ArtifactViewerContext.Provider value={value}>
      {children}
    </ArtifactViewerContext.Provider>
  );
}

export function useArtifactViewer() {
  const context = useContext(ArtifactViewerContext);

  if (!context) {
    throw new Error(
      "useArtifactViewer must be used within ArtifactViewerProvider",
    );
  }

  return context;
}
