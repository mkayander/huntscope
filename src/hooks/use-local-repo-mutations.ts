"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";

import { useCareerOpsDataSource } from "~/hooks/use-career-ops-data-source";
import { CAREER_OPS_PATHS } from "~/lib/career-ops/layout";
import {
  assertLocalTextFileUnchanged,
  ensureWritePermission,
  readLocalRepoFile,
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
    async (
      relativePath: string,
      content: string,
      expectedContent: string | null,
    ) => {
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

        const currentFile = await readLocalRepoFile(
          activeSource.directoryHandle,
          relativePath,
        );
        assertLocalTextFileUnchanged(expectedContent, currentFile);

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

  const applicationsWritePath =
    localDataQuery.data?.layout.applicationsWritePath ??
    CAREER_OPS_PATHS.applications;
  const loadedApplicationsMarkdown =
    localDataQuery.data?.applicationsMarkdown ?? null;
  const writeApplicationsMarkdown = useCallback(
    async (content: string) =>
      writeTextFile(applicationsWritePath, content, loadedApplicationsMarkdown),
    [applicationsWritePath, loadedApplicationsMarkdown, writeTextFile],
  );

  const pipelineWritePath =
    localDataQuery.data?.layout.pipelineWritePath ?? CAREER_OPS_PATHS.pipeline;
  const loadedPipelineMarkdown = localDataQuery.data?.pipelineMarkdown ?? null;
  const writePipelineMarkdown = useCallback(
    async (content: string) =>
      writeTextFile(pipelineWritePath, content, loadedPipelineMarkdown),
    [loadedPipelineMarkdown, pipelineWritePath, writeTextFile],
  );

  return {
    canWrite,
    isSaving,
    error,
    writeApplicationsMarkdown,
    writePipelineMarkdown,
  };
}
