"use client";

import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";

import { resolveApplicationReportFetchRef } from "~/lib/career-ops/application-reports";
import {
  getInlineJobPostingUrl,
  isHttpUrl,
} from "~/lib/career-ops/application-job-posting";
import type { CareerOpsDataSource } from "~/lib/career-ops/data-source";
import { parseReportMarkdown } from "~/lib/career-ops/parse-report";
import type { ApplicationEntry, RepoDataFile } from "~/lib/career-ops/types";
import {
  GITHUB_CACHE_GC_TIME_MS,
  GITHUB_CACHE_STALE_TIME_MS,
} from "~/lib/cache/github-query-options";
import { readLocalRepoFile } from "~/lib/local-repo/repo-file-access";
import { api } from "~/trpc/react";

function getReportSourceUrlQueryKey(
  dataSource: CareerOpsDataSource,
  path: string,
) {
  if (dataSource.kind === "github") {
    return [
      "report-source-url",
      "github",
      dataSource.repo.fullName,
      path,
    ] as const;
  }

  return [
    "report-source-url",
    "local",
    dataSource.sessionId,
    dataSource.directoryName,
    path,
  ] as const;
}

export function useReportSourceUrlMap(
  applications: readonly ApplicationEntry[],
  reportFiles: readonly RepoDataFile[],
  dataSource: CareerOpsDataSource | null,
): Map<string, string | null> {
  const utils = api.useUtils();

  const paths = useMemo(() => {
    const unique = new Set<string>();

    for (const application of applications) {
      if (getInlineJobPostingUrl(application)) {
        continue;
      }

      const reportRef = resolveApplicationReportFetchRef(
        application,
        reportFiles,
      );
      if (reportRef?.path) {
        unique.add(reportRef.path);
      }
    }

    return [...unique];
  }, [applications, reportFiles]);

  const queries = useQueries({
    queries: paths.map((path) => ({
      queryKey: dataSource
        ? getReportSourceUrlQueryKey(dataSource, path)
        : ["report-source-url", "disabled", path],
      queryFn: async (): Promise<string | null> => {
        if (!dataSource) {
          return null;
        }

        if (dataSource.kind === "github") {
          const file = await utils.github.getRepoFile.fetch({
            repo: dataSource.repo,
            path,
          });

          return file?.encoding === "utf-8" ? file.content : null;
        }

        if (!dataSource.directoryHandle) {
          return null;
        }

        const file = await readLocalRepoFile(dataSource.directoryHandle, path);
        return file?.encoding === "utf-8" ? file.content : null;
      },
      enabled: dataSource != null,
      staleTime: GITHUB_CACHE_STALE_TIME_MS,
      gcTime: GITHUB_CACHE_GC_TIME_MS,
      refetchOnWindowFocus: false,
    })),
  });

  return useMemo(() => {
    const map = new Map<string, string | null>();

    paths.forEach((path, index) => {
      const content = queries[index]?.data ?? null;
      if (!content) {
        map.set(path, null);
        return;
      }

      const sourceUrl = parseReportMarkdown(content).sourceUrl;
      map.set(path, sourceUrl && isHttpUrl(sourceUrl) ? sourceUrl : null);
    });

    return map;
  }, [paths, queries]);
}

export function getReportSourceUrlForApplication(
  application: ApplicationEntry,
  reportFiles: readonly RepoDataFile[],
  reportSourceUrlByPath: ReadonlyMap<string, string | null>,
): string | null {
  const reportRef = resolveApplicationReportFetchRef(application, reportFiles);
  if (!reportRef?.path) {
    return null;
  }

  return reportSourceUrlByPath.get(reportRef.path) ?? null;
}
