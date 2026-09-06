import {
  type FileSystemObserverInstance,
  supportsFileSystemObserver,
} from "~/lib/local-repo/file-system-types";

export function watchDirectory(
  directoryHandle: FileSystemDirectoryHandle,
  onChange: () => void,
): () => void {
  if (!supportsFileSystemObserver()) {
    return () => undefined;
  }

  const Observer = window.FileSystemObserver;

  if (!Observer) {
    return () => undefined;
  }

  const observer: FileSystemObserverInstance = new Observer(() => {
    onChange();
  });

  void observer.observe(directoryHandle, { recursive: true }).catch(() => {
    observer.disconnect();
  });

  return () => {
    observer.disconnect();
  };
}
