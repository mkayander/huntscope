import type { CareerOpsResolvedLayout } from "~/lib/career-ops/types";

export type { CareerOpsResolvedLayout };

export const CAREER_OPS_DATA_ROOT_MARKER = ".career-ops-data";

export const APPLICATIONS_CANDIDATE_PATHS = [
  "data/applications.md",
  "applications.md",
] as const;

export const PIPELINE_CANDIDATE_PATHS = [
  "data/pipeline.md",
  "pipeline.md",
] as const;

const CAREER_OPS_DATA_DIR_MARKERS = new Set([
  "applications.md",
  "pipeline.md",
  "scan-history.tsv",
  "scan-runs.tsv",
  "follow-ups.md",
  "blacklist.md",
  "salary-observations.tsv",
  "assessments.tsv",
]);

export type CareerOpsLayoutReader = {
  readFile: (path: string) => Promise<string | null>;
  listDirectory?: (
    path: string,
  ) => Promise<Array<{ path: string; name: string; type: string }>>;
};

export type ResolvedCareerOpsLayout = CareerOpsResolvedLayout & {
  applicationsMarkdown: string | null;
  pipelineMarkdown: string | null;
};

function joinRepoPath(...segments: string[]): string {
  return segments.filter(Boolean).join("/");
}

function prefixDataRoot(dataRoot: string, relativePath: string): string {
  return dataRoot ? joinRepoPath(dataRoot, relativePath) : relativePath;
}

function hasParentTraversalSegment(path: string): boolean {
  return path.split("/").some((segment) => segment === "..");
}

export function parseDataRootMarker(content: string): string {
  const line = content.trim().split("\n")[0]?.trim() ?? "";
  const normalized = line.replace(/^\.\//, "").replace(/\/$/, "");

  if (
    !normalized ||
    normalized.startsWith("/") ||
    hasParentTraversalSegment(normalized)
  ) {
    return "";
  }

  return normalized;
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

function pathBelongsToDataDir(dataDirPath: string, filePath: string): boolean {
  return (
    filePath === `${dataDirPath}/applications.md` ||
    filePath === `${dataDirPath}/pipeline.md` ||
    filePath.startsWith(`${dataDirPath}/`)
  );
}

export function resolveDataDir(input: {
  dataDirPath: string;
  applicationsPath: string | null;
  pipelinePath: string | null;
}): string {
  const trackerPaths = [input.applicationsPath, input.pipelinePath].filter(
    (path): path is string => path !== null,
  );

  if (
    trackerPaths.some((path) => pathBelongsToDataDir(input.dataDirPath, path))
  ) {
    return input.dataDirPath;
  }

  const primaryTracker = input.applicationsPath ?? input.pipelinePath;

  if (primaryTracker) {
    const derived = deriveDataDirFromTrackerPath(primaryTracker);
    return derived || input.dataDirPath;
  }

  return input.dataDirPath;
}

function hasRecognizableCareerOpsDataFiles(
  entries: Array<{ name: string }>,
): boolean {
  return entries.some((entry) => CAREER_OPS_DATA_DIR_MARKERS.has(entry.name));
}

async function findExistingFile(
  readFile: (path: string) => Promise<string | null>,
  dataRoot: string,
  candidates: readonly string[],
): Promise<{ path: string; content: string } | null> {
  for (const candidate of candidates) {
    const path = prefixDataRoot(dataRoot, candidate);
    const content = await readFile(path);

    if (content !== null) {
      return { path, content };
    }
  }

  return null;
}

async function resolveDataRoot(
  readFile: (path: string) => Promise<string | null>,
): Promise<string> {
  const markerContent = await readFile(CAREER_OPS_DATA_ROOT_MARKER);
  return markerContent ? parseDataRootMarker(markerContent) : "";
}

export async function repositoryHasCareerOpsLayout(
  reader: CareerOpsLayoutReader,
): Promise<boolean> {
  const dataRoot = await resolveDataRoot(reader.readFile);

  for (const candidate of APPLICATIONS_CANDIDATE_PATHS) {
    const content = await reader.readFile(prefixDataRoot(dataRoot, candidate));

    if (content !== null) {
      return true;
    }
  }

  for (const candidate of PIPELINE_CANDIDATE_PATHS) {
    const content = await reader.readFile(prefixDataRoot(dataRoot, candidate));

    if (content !== null) {
      return true;
    }
  }

  if (!reader.listDirectory) {
    return false;
  }

  const dataDirectoryEntries = await reader.listDirectory(
    prefixDataRoot(dataRoot, "data"),
  );

  return hasRecognizableCareerOpsDataFiles(dataDirectoryEntries);
}

export async function resolveCareerOpsLayout(
  reader: CareerOpsLayoutReader,
): Promise<ResolvedCareerOpsLayout | null> {
  const dataRoot = await resolveDataRoot(reader.readFile);

  const [applicationsFile, pipelineFile] = await Promise.all([
    findExistingFile(reader.readFile, dataRoot, APPLICATIONS_CANDIDATE_PATHS),
    findExistingFile(reader.readFile, dataRoot, PIPELINE_CANDIDATE_PATHS),
  ]);

  const applicationsPath = applicationsFile?.path ?? null;
  const pipelinePath = pipelineFile?.path ?? null;
  const dataDirPath = prefixDataRoot(dataRoot, "data");
  const dataDirectoryEntries = reader.listDirectory
    ? await reader.listDirectory(dataDirPath)
    : [];

  const hasLayoutData = Boolean(
    applicationsPath ??
    pipelinePath ??
    hasRecognizableCareerOpsDataFiles(dataDirectoryEntries),
  );

  if (!hasLayoutData) {
    return null;
  }

  const dataDir = resolveDataDir({
    dataDirPath,
    applicationsPath,
    pipelinePath,
  });

  const resolvedApplicationsPath =
    applicationsPath ?? prefixDataRoot(dataRoot, "data/applications.md");
  const resolvedPipelinePath =
    pipelinePath ?? prefixDataRoot(dataRoot, "data/pipeline.md");

  const layout: CareerOpsResolvedLayout = {
    dataRoot,
    applicationsPath: resolvedApplicationsPath,
    pipelinePath: resolvedPipelinePath,
    applicationsWritePath: resolvedApplicationsPath,
    pipelineWritePath: resolvedPipelinePath,
    dataDir,
    reportsDir: prefixDataRoot(dataRoot, "reports"),
    outputDir: prefixDataRoot(dataRoot, "output"),
  };

  return {
    ...layout,
    applicationsMarkdown: applicationsFile?.content ?? null,
    pipelineMarkdown: pipelineFile?.content ?? null,
  };
}
