export type LaunchParams = {
  files?: FileSystemFileHandle[];
  targetURL?: string;
};

export type LaunchQueue = {
  setConsumer: (callback: (params: LaunchParams) => void) => void;
};

export function supportsLaunchQueue() {
  return typeof window !== "undefined" && "launchQueue" in window;
}

export function registerLaunchConsumer(
  onFilesLaunched: (files: FileSystemFileHandle[]) => void,
) {
  if (!supportsLaunchQueue()) {
    return;
  }

  if (!window.launchQueue) {
    return;
  }

  window.launchQueue.setConsumer((params) => {
    if (!params.files?.length) {
      return;
    }

    onFilesLaunched(params.files);
  });
}

declare global {
  interface Window {
    launchQueue?: LaunchQueue;
  }
}
