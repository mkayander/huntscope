export const CAREER_OPS_DATA_ROOT_MARKER = ".career-ops-data";

export const APPLICATIONS_CANDIDATE_PATHS = [
  "data/applications.md",
  "applications.md",
] as const;

export const PIPELINE_CANDIDATE_PATHS = [
  "data/pipeline.md",
  "pipeline.md",
] as const;

import type { CareerOpsResolvedLayout } from "~/lib/career-ops/types";

export type { CareerOpsResolvedLayout };

export type CareerOpsLayoutReader = {
  readFile: (path: string) => Promise<string | null>;
  listDirectory?: (
    path: string,
  ) => Promise<Array<{ path: string; name: string; type: string }>>;
};

function joinRepoPath(...segments: string[]): string {
  return segments.filter(Boolean).join("/");
}

function prefixDataRoot(dataRoot: string, relativePath: string): string {
  return dataRoot ? joinRepoPath(dataRoot, relativePath) : relativePath;
}

export function parseDataRootMarker(content: string): string {
  const line = content.trim().split("\n")[0]?.trim() ?? "";

  return line.replace(/^\.\//, "").replace(/\/$/, "");
}

export function deriveDataDirFromTrackerPath(trackerPath: string): string {
  if (trackerPath.endsWith("/applications.md")) {
    return trackerPath.slice(0, -"/applications.md".length);
  }

  if (trackerPath.endsWith("/pipeline.md")) {
    return trackerPath.slice(0, -"/pipeline.md".length);
  }

  const slashIndex = trackerPath.lastIndexOf("/");

  return slashIndex >= 0 ? trackerPath.slice(0, slashIndex) : "";
}

async function findExistingFile(
  readFile: (path: string) => Promise<string | null>,
  dataRoot: string,
  candidates: readonly string[],
): Promise<string | null> {
  for (const candidate of candidates) {
    const path = prefixDataRoot(dataRoot, candidate);
    const content = await readFile(path);

    if (content !== null) {
      return path;
    }
  }

  return null;
}

export async function resolveCareerOpsLayout(
  reader: CareerOpsLayoutReader,
): Promise<CareerOpsResolvedLayout | null> {
  const markerContent = await reader.readFile(CAREER_OPS_DATA_ROOT_MARKER);
  const dataRoot = markerContent ? parseDataRootMarker(markerContent) : "";

  const [applicationsPath, pipelinePath] = await Promise.all([
    findExistingFile(reader.readFile, dataRoot, APPLICATIONS_CANDIDATE_PATHS),
    findExistingFile(reader.readFile, dataRoot, PIPELINE_CANDIDATE_PATHS),
  ]);

  const dataDirPath = prefixDataRoot(dataRoot, "data");
  const dataDirectoryEntries = reader.listDirectory
    ? await reader.listDirectory(dataDirPath)
    : [];

  const hasLayoutData = Boolean(
    applicationsPath ?? pipelinePath ?? dataDirectoryEntries.length > 0,
  );

  if (!hasLayoutData) {
    return null;
  }

  const trackerPath = applicationsPath ?? pipelinePath;
  const dataDir = trackerPath
    ? deriveDataDirFromTrackerPath(trackerPath)
    : dataDirPath;

  return {
    dataRoot,
    applicationsPath:
      applicationsPath ?? prefixDataRoot(dataRoot, "data/applications.md"),
    pipelinePath: pipelinePath ?? prefixDataRoot(dataRoot, "data/pipeline.md"),
    dataDir,
    reportsDir: prefixDataRoot(dataRoot, "reports"),
    outputDir: prefixDataRoot(dataRoot, "output"),
  };
}

export async function repositoryHasCareerOpsLayout(
  reader: CareerOpsLayoutReader,
): Promise<boolean> {
  const layout = await resolveCareerOpsLayout(reader);
  return layout !== null;
}
