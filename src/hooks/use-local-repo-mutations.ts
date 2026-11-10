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

type SaveContext = "applications" | "pipeline";

export function useLocalRepoMutations() {
  const queryClient = useQueryClient();
  const { activeSource, localDataQuery, localRepo } = useCareerOpsDataSource();
  const [saveContext, setSaveContext] = useState<SaveContext | null>(null);
  const [savingApplicationNum, setSavingApplicationNum] = useState<
    number | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const canWrite =
    activeSource?.kind === "local" &&
    activeSource.directoryHandle != null &&
    activeSource.fileHandle == null;

  const isSavingApplications = saveContext === "applications";
  const isSavingPipeline = saveContext === "pipeline";

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

  const refreshLoadedData = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);

    try {
      if (activeSource?.kind === "local") {
        await localRepo.refresh();
      }
      await invalidateLocalData();
    } finally {
      setIsRefreshing(false);
    }
  }, [activeSource?.kind, invalidateLocalData, localRepo]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

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
    async (content: string, applicationNum?: number) => {
      setSaveContext("applications");
      setSavingApplicationNum(applicationNum ?? null);

      try {
        await writeTextFile(
          applicationsWritePath,
          content,
          loadedApplicationsMarkdown,
        );
      } finally {
        setSaveContext(null);
        setSavingApplicationNum(null);
      }
    },
    [applicationsWritePath, loadedApplicationsMarkdown, writeTextFile],
  );

  const pipelineWritePath =
    localDataQuery.data?.layout.pipelineWritePath ?? CAREER_OPS_PATHS.pipeline;
  const loadedPipelineMarkdown = localDataQuery.data?.pipelineMarkdown ?? null;

  const writePipelineMarkdown = useCallback(
    async (content: string) => {
      setSaveContext("pipeline");

      try {
        await writeTextFile(pipelineWritePath, content, loadedPipelineMarkdown);
      } finally {
        setSaveContext(null);
      }
    },
    [loadedPipelineMarkdown, pipelineWritePath, writeTextFile],
  );

  return {
    canWrite,
    isSavingApplications,
    isSavingPipeline,
    savingApplicationNum,
    error,
    isRefreshing,
    clearError,
    refreshLoadedData,
    writeApplicationsMarkdown,
    writePipelineMarkdown,
  };
}
