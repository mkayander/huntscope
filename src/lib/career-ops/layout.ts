import type {
  RawCareerOpsRepoData,
  RepoDataFile,
} from "~/lib/career-ops/types";

export const CAREER_OPS_PATHS = {
  applications: "data/applications.md",
  pipeline: "data/pipeline.md",
  dataDir: "data",
  reportsDir: "reports",
  outputDir: "output",
  profile: "config/profile.yml",
} as const;

export function toRepoDataFile(item: {
  path: string;
  name: string;
  type: string;
}): RepoDataFile | null {
  if (item.type !== "file" && item.type !== "dir") {
    return null;
  }

  return {
    path: item.path,
    name: item.name,
    type: item.type,
  };
}

export function hasCareerOpsLayoutData(input: {
  applicationsMarkdown: string | null;
  pipelineMarkdown: string | null;
  dataFiles: RepoDataFile[];
}): boolean {
  return Boolean(
    input.applicationsMarkdown ??
    input.pipelineMarkdown ??
    input.dataFiles.length > 0,
  );
}

export function buildCareerOpsRepoData(input: {
  owner: string;
  name: string;
  fullName: string;
  defaultBranch?: string | null;
  applicationsMarkdown: string | null;
  pipelineMarkdown: string | null;
  dataDirectory: Array<{ path: string; name: string; type: string }>;
  reportsDirectory: Array<{ path: string; name: string; type: string }>;
  outputDirectory: Array<{ path: string; name: string; type: string }>;
}): RawCareerOpsRepoData {
  const dataFiles = input.dataDirectory
    .map(toRepoDataFile)
    .filter((item): item is RepoDataFile => item !== null);

  if (
    !hasCareerOpsLayoutData({
      applicationsMarkdown: input.applicationsMarkdown,
      pipelineMarkdown: input.pipelineMarkdown,
      dataFiles,
    })
  ) {
    throw new Error(
      "This folder does not look like a career-ops project or companion repo. Expected files such as data/applications.md or data/pipeline.md.",
    );
  }

  return {
    owner: input.owner,
    name: input.name,
    fullName: input.fullName,
    defaultBranch: input.defaultBranch ?? null,
    applicationsMarkdown: input.applicationsMarkdown,
    pipelineMarkdown: input.pipelineMarkdown,
    dataFiles,
    reportFiles: input.reportsDirectory
      .map(toRepoDataFile)
      .filter((item): item is RepoDataFile => item !== null),
    outputFiles: input.outputDirectory
      .map(toRepoDataFile)
      .filter((item): item is RepoDataFile => item !== null),
    reportsCount: input.reportsDirectory.filter((item) => item.type === "file")
      .length,
  };
}
