export type DirectoryPermissionMode = "read" | "readwrite";

export type PermissionDescriptor = {
  mode?: DirectoryPermissionMode;
};

export type FileSystemHandlePermissionMixin = {
  queryPermission: (
    descriptor: PermissionDescriptor,
  ) => Promise<PermissionState>;
  requestPermission: (
    descriptor: PermissionDescriptor,
  ) => Promise<PermissionState>;
};

export type LocalDirectoryHandle = FileSystemDirectoryHandle &
  FileSystemHandlePermissionMixin;

export function asLocalDirectoryHandle(
  handle: FileSystemDirectoryHandle,
): LocalDirectoryHandle {
  return handle as LocalDirectoryHandle;
}

export type ShowDirectoryPickerOptions = {
  id?: string;
  mode?: DirectoryPermissionMode;
  startIn?:
    | "desktop"
    | "documents"
    | "downloads"
    | "music"
    | "pictures"
    | "videos";
};

export type FileSystemObserverRecord = {
  changedHandle: FileSystemHandle;
  relativePathComponents: string[];
  relativePathMovedFrom?: string[];
  type: "appeared" | "disappeared" | "modified" | "moved" | "unknown";
};

export type FileSystemObserverInstance = {
  observe: (
    handle: FileSystemHandle,
    options?: { recursive?: boolean },
  ) => Promise<void>;
  disconnect: () => void;
};

export type FileSystemObserverConstructor = new (
  callback: (
    records: FileSystemObserverRecord[],
    observer: FileSystemObserverInstance,
  ) => void,
) => FileSystemObserverInstance;

export function supportsDirectoryPicker() {
  return (
    typeof window !== "undefined" &&
    typeof window.showDirectoryPicker === "function"
  );
}

export function supportsFileSystemObserver() {
  return (
    typeof window !== "undefined" &&
    "FileSystemObserver" in window &&
    typeof window.FileSystemObserver === "function"
  );
}

declare global {
  interface Window {
    showDirectoryPicker?: (
      options?: ShowDirectoryPickerOptions,
    ) => Promise<FileSystemDirectoryHandle>;
    FileSystemObserver?: FileSystemObserverConstructor;
  }
}
