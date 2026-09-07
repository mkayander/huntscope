import {
  buildCareerOpsRepoData,
  CAREER_OPS_PATHS,
} from "~/lib/career-ops/layout";
import type { RawCareerOpsRepoData } from "~/lib/career-ops/types";

async function readTextFile(
  directoryHandle: FileSystemDirectoryHandle,
  relativePath: string,
): Promise<string | null> {
  const segments = relativePath.split("/").filter(Boolean);
  let currentDirectory = directoryHandle;

  for (let index = 0; index < segments.length - 1; index += 1) {
    const segment = segments[index];

    if (!segment) {
      return null;
    }

    try {
      currentDirectory = await currentDirectory.getDirectoryHandle(segment);
    } catch {
      return null;
    }
  }

  const fileName = segments.at(-1);

  if (!fileName) {
    return null;
  }

  try {
    const fileHandle = await currentDirectory.getFileHandle(fileName);
    const file = await fileHandle.getFile();
    return await file.text();
  } catch {
    return null;
  }
}

type IterableDirectoryHandle = FileSystemDirectoryHandle & {
  keys(): AsyncIterableIterator<string>;
};

async function listDirectChildNames(
  directoryHandle: FileSystemDirectoryHandle,
): Promise<string[]> {
  const names: string[] = [];
  const iterableDirectory = directoryHandle as IterableDirectoryHandle;

  for await (const name of iterableDirectory.keys()) {
    names.push(name);
  }

  return names;
}

async function listDirectoryEntries(
  directoryHandle: FileSystemDirectoryHandle,
  relativeDir: string,
): Promise<Array<{ path: string; name: string; type: string }>> {
  const segments = relativeDir.split("/").filter(Boolean);
  let currentDirectory = directoryHandle;

  for (const segment of segments) {
    try {
      currentDirectory = await currentDirectory.getDirectoryHandle(segment);
    } catch {
      return [];
    }
  }

  const entries: Array<{ path: string; name: string; type: string }> = [];
  const childNames = await listDirectChildNames(currentDirectory);

  for (const name of childNames) {
    let type = "file";

    try {
      await currentDirectory.getFileHandle(name);
    } catch {
      try {
        await currentDirectory.getDirectoryHandle(name);
        type = "directory";
      } catch {
        continue;
      }
    }

    entries.push({
      path: relativeDir ? `${relativeDir}/${name}` : name,
      name,
      type,
    });
  }

  return entries;
}

export async function loadCareerOpsFromDirectory(
  directoryHandle: FileSystemDirectoryHandle,
): Promise<RawCareerOpsRepoData> {
  const [
    applicationsContent,
    pipelineContent,
    dataDirectory,
    reportsDirectory,
    outputDirectory,
  ] = await Promise.all([
    readTextFile(directoryHandle, CAREER_OPS_PATHS.applications),
    readTextFile(directoryHandle, CAREER_OPS_PATHS.pipeline),
    listDirectoryEntries(directoryHandle, CAREER_OPS_PATHS.dataDir),
    listDirectoryEntries(directoryHandle, CAREER_OPS_PATHS.reportsDir),
    listDirectoryEntries(directoryHandle, CAREER_OPS_PATHS.outputDir),
  ]);

  return buildCareerOpsRepoData({
    owner: "local",
    name: directoryHandle.name,
    fullName: `local://${directoryHandle.name}`,
    defaultBranch: null,
    applicationsMarkdown: applicationsContent,
    pipelineMarkdown: pipelineContent,
    dataDirectory,
    reportsDirectory,
    outputDirectory,
  });
}

export async function loadCareerOpsFromLaunchedFile(
  fileHandle: FileSystemFileHandle,
): Promise<RawCareerOpsRepoData> {
  const file = await fileHandle.getFile();
  const content = await file.text();
  const normalizedName = file.name.toLowerCase();
  const isApplicationsFile =
    normalizedName === "applications.md" ||
    file.name.endsWith(CAREER_OPS_PATHS.applications);
  const isPipelineFile =
    normalizedName === "pipeline.md" ||
    file.name.endsWith(CAREER_OPS_PATHS.pipeline);

  return buildCareerOpsRepoData({
    owner: "local",
    name: fileHandle.name,
    fullName: `local://${fileHandle.name}`,
    defaultBranch: null,
    applicationsMarkdown: isApplicationsFile ? content : null,
    pipelineMarkdown: isPipelineFile ? content : null,
    dataDirectory:
      isApplicationsFile || isPipelineFile
        ? [
            {
              path: isApplicationsFile
                ? CAREER_OPS_PATHS.applications
                : CAREER_OPS_PATHS.pipeline,
              name: file.name,
              type: "file",
            },
          ]
        : [],
    reportsDirectory: [],
    outputDirectory: [],
  });
}

export async function loadCareerOpsFromLocalSource(source: {
  directoryHandle: FileSystemDirectoryHandle | null;
  fileHandle: FileSystemFileHandle | null;
}): Promise<RawCareerOpsRepoData> {
  if (source.directoryHandle) {
    return loadCareerOpsFromDirectory(source.directoryHandle);
  }

  if (source.fileHandle) {
    return loadCareerOpsFromLaunchedFile(source.fileHandle);
  }

  throw new Error("No local folder or file is connected.");
}
