import { DEFAULT_DATA_FILE } from "~/lib/local-repo/constants";
import { asLocalDirectoryHandle } from "~/lib/local-repo/file-system-types";

export type LocalRepoPreview = {
  directoryName: string;
  filePath: string;
  preview: string | null;
  lastRefreshedAt: string;
};

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

    currentDirectory = await currentDirectory.getDirectoryHandle(segment);
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

export async function readLocalRepoPreview(
  directoryHandle: FileSystemDirectoryHandle,
  filePath = DEFAULT_DATA_FILE,
): Promise<LocalRepoPreview> {
  const content = await readTextFile(directoryHandle, filePath);

  return {
    directoryName: directoryHandle.name,
    filePath,
    preview: content ? content.split("\n").slice(0, 5).join("\n") : null,
    lastRefreshedAt: new Date().toISOString(),
  };
}

export async function ensureReadPermission(
  directoryHandle: FileSystemDirectoryHandle,
) {
  const handle = asLocalDirectoryHandle(directoryHandle);
  const currentPermission = await handle.queryPermission({
    mode: "read",
  });

  if (currentPermission === "granted") {
    return true;
  }

  const requestedPermission = await handle.requestPermission({
    mode: "read",
  });

  return requestedPermission === "granted";
}
