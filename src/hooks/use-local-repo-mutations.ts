"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";

import { useCareerOpsDataSource } from "~/hooks/use-career-ops-data-source";
import { CAREER_OPS_PATHS } from "~/lib/career-ops/layout";
import {
  ensureWritePermission,
  writeLocalRepoTextFile,
} from "~/lib/local-repo/repo-file-access";

export function useLocalRepoMutations() {
  const queryClient = useQueryClient();
  const { activeSource, localDataQuery } = useCareerOpsDataSource();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canWrite =
    activeSource?.kind === "local" &&
    activeSource.directoryHandle != null &&
    activeSource.fileHandle == null;

  const invalidateLocalData = useCallback(async () => {
    if (activeSource?.kind !== "local") {
      return;
    }

    await queryClient.invalidateQueries({
      queryKey: [
        "local-career-ops",
        activeSource.sessionId,
        activeSource.directoryName,
      ],
    });
    await localDataQuery.refetch();
  }, [activeSource, localDataQuery, queryClient]);

  const writeTextFile = useCallback(
    async (relativePath: string, content: string) => {
      if (!canWrite || !activeSource?.directoryHandle) {
        throw new Error(
          "Local folder write is only available for directory connections.",
        );
      }

      setIsSaving(true);
      setError(null);

      try {
        const granted = await ensureWritePermission(
          activeSource.directoryHandle,
        );

        if (!granted) {
          throw new Error("Write permission was not granted for this folder.");
        }

        await writeLocalRepoTextFile(
          activeSource.directoryHandle,
          relativePath,
          content,
        );
        await invalidateLocalData();
      } catch (writeError) {
        const message =
          writeError instanceof Error
            ? writeError.message
            : "Could not save changes.";
        setError(message);
        throw writeError;
      } finally {
        setIsSaving(false);
      }
    },
    [activeSource, canWrite, invalidateLocalData],
  );

  const writeApplicationsMarkdown = useCallback(
    async (content: string) =>
      writeTextFile(CAREER_OPS_PATHS.applications, content),
    [writeTextFile],
  );

  const writePipelineMarkdown = useCallback(
    async (content: string) =>
      writeTextFile(CAREER_OPS_PATHS.pipeline, content),
    [writeTextFile],
  );

  return {
    canWrite,
    isSaving,
    error,
    writeApplicationsMarkdown,
    writePipelineMarkdown,
  };
}
