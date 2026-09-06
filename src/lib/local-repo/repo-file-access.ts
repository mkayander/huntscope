import { asLocalDirectoryHandle } from "~/lib/local-repo/file-system-types";

export type RepoFilePayload = {
  path: string;
  encoding: "utf-8" | "base64";
  content: string;
  mimeType: string;
};

function guessMimeType(path: string): string {
  const lower = path.toLowerCase();

  if (lower.endsWith(".pdf")) {
    return "application/pdf";
  }

  if (lower.endsWith(".md") || lower.endsWith(".markdown")) {
    return "text/markdown";
  }

  if (lower.endsWith(".yml") || lower.endsWith(".yaml")) {
    return "text/yaml";
  }

  if (lower.endsWith(".json")) {
    return "application/json";
  }

  return "text/plain";
}

async function getFileHandle(
  directoryHandle: FileSystemDirectoryHandle,
  relativePath: string,
): Promise<FileSystemFileHandle | null> {
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
    return await currentDirectory.getFileHandle(fileName);
  } catch {
    return null;
  }
}

export async function readLocalRepoFile(
  directoryHandle: FileSystemDirectoryHandle,
  relativePath: string,
): Promise<RepoFilePayload | null> {
  const fileHandle = await getFileHandle(directoryHandle, relativePath);

  if (!fileHandle) {
    return null;
  }

  const file = await fileHandle.getFile();
  const mimeType = file.type || guessMimeType(relativePath);

  if (
    mimeType === "application/pdf" ||
    relativePath.toLowerCase().endsWith(".pdf")
  ) {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = "";

    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }

    return {
      path: relativePath,
      encoding: "base64",
      content: btoa(binary),
      mimeType: "application/pdf",
    };
  }

  return {
    path: relativePath,
    encoding: "utf-8",
    content: await file.text(),
    mimeType,
  };
}

export async function writeLocalRepoTextFile(
  directoryHandle: FileSystemDirectoryHandle,
  relativePath: string,
  content: string,
): Promise<void> {
  const segments = relativePath.split("/").filter(Boolean);
  let currentDirectory = directoryHandle;

  for (let index = 0; index < segments.length - 1; index += 1) {
    const segment = segments[index];

    if (!segment) {
      throw new Error(`Invalid file path: ${relativePath}`);
    }

    currentDirectory = await currentDirectory.getDirectoryHandle(segment, {
      create: true,
    });
  }

  const fileName = segments.at(-1);

  if (!fileName) {
    throw new Error(`Invalid file path: ${relativePath}`);
  }

  const fileHandle = await currentDirectory.getFileHandle(fileName, {
    create: true,
  });
  const writable = await fileHandle.createWritable();
  await writable.write(content);
  await writable.close();
}

export async function ensureWritePermission(
  directoryHandle: FileSystemDirectoryHandle,
) {
  const handle = asLocalDirectoryHandle(directoryHandle);
  const currentPermission = await handle.queryPermission({
    mode: "readwrite",
  });

  if (currentPermission === "granted") {
    return true;
  }

  const requestedPermission = await handle.requestPermission({
    mode: "readwrite",
  });

  return requestedPermission === "granted";
}
