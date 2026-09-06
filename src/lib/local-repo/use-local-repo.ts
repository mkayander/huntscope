"use client";

import { useCallback, useEffect, useState } from "react";

import {
  DIRECTORY_PICKER_ID,
} from "~/lib/local-repo/constants";
import {
  supportsDirectoryPicker,
  supportsFileSystemObserver,
} from "~/lib/local-repo/file-system-types";
import { registerLaunchConsumer } from "~/lib/local-repo/launch-handler";
import { watchDirectory } from "~/lib/local-repo/observer";
import {
  ensureReadPermission,
  readLaunchedFilePreview,
  readLocalRepoPreview,
  type LocalRepoPreview,
} from "~/lib/local-repo/reader";
import {
  clearAllLocalRepoHandles,
  clearLaunchedFileHandle,
  loadDirectoryHandle,
  loadLaunchedFileHandle,
  saveDirectoryHandle,
  saveLaunchedFileHandle,
} from "~/lib/local-repo/storage";
import { isInstalledPwa } from "~/lib/pwa/environment";

type LocalRepoState =
  | { status: "loading" }
  | { status: "unsupported" }
  | { status: "idle" }
  | { status: "connected"; preview: LocalRepoPreview }
  | { status: "permission-required"; directoryName: string }
  | { status: "error"; message: string };

export function useLocalRepo() {
  const [state, setState] = useState<LocalRepoState>({ status: "loading" });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [watchingDisk, setWatchingDisk] = useState(false);
  const [installedPwa, setInstalledPwa] = useState(false);
  const [directoryHandle, setDirectoryHandle] =
    useState<FileSystemDirectoryHandle | null>(null);
  const [launchedFileHandle, setLaunchedFileHandle] =
    useState<FileSystemFileHandle | null>(null);

  const refreshDirectory = useCallback(async (handle: FileSystemDirectoryHandle) => {
    setIsRefreshing(true);

    try {
      const hasPermission = await ensureReadPermission(handle);

      if (!hasPermission) {
        setState({
          status: "permission-required",
          directoryName: handle.name,
        });
        return;
      }

      const preview = await readLocalRepoPreview(handle);
      setDirectoryHandle(handle);
      setLaunchedFileHandle(null);
      setState({ status: "connected", preview });
    } catch (error) {
      setState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Could not read the selected folder.",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const refreshLaunchedFile = useCallback(async (handle: FileSystemFileHandle) => {
    setIsRefreshing(true);

    try {
      const preview = await readLaunchedFilePreview(handle);
      setLaunchedFileHandle(handle);
      setDirectoryHandle(null);
      setState({ status: "connected", preview });
    } catch (error) {
      setState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Could not read the launched file.",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const restore = useCallback(async () => {
    setInstalledPwa(isInstalledPwa());

    const launchedFile = await loadLaunchedFileHandle();

    if (launchedFile) {
      await refreshLaunchedFile(launchedFile);
      return;
    }

    if (!supportsDirectoryPicker()) {
      setState({ status: "unsupported" });
      return;
    }

    const directory = await loadDirectoryHandle();

    if (directory) {
      await refreshDirectory(directory);
      return;
    }

    setState({ status: "idle" });
  }, [refreshDirectory, refreshLaunchedFile]);

  useEffect(() => {
    void restore();
  }, [restore]);

  useEffect(() => {
    registerLaunchConsumer((files) => {
      const fileHandle = files[0];

      if (!fileHandle) {
        return;
      }

      void (async () => {
        await clearAllLocalRepoHandles();
        await saveLaunchedFileHandle(fileHandle);
        await refreshLaunchedFile(fileHandle);
      })();
    });
  }, [refreshLaunchedFile]);

  useEffect(() => {
    if (
      !directoryHandle ||
      state.status !== "connected" ||
      state.preview.source !== "directory"
    ) {
      setWatchingDisk(false);
      return;
    }

    let refreshTimeout: ReturnType<typeof setTimeout> | undefined;

    const stopWatching = watchDirectory(directoryHandle, () => {
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }

      refreshTimeout = setTimeout(() => {
        void refreshDirectory(directoryHandle);
      }, 500);
    });

    setWatchingDisk(supportsFileSystemObserver());

    return () => {
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }

      stopWatching();
    };
  }, [directoryHandle, refreshDirectory, state]);

  const pickDirectory = useCallback(async () => {
    if (!supportsDirectoryPicker()) {
      setState({ status: "unsupported" });
      return;
    }

    try {
      const picker = window.showDirectoryPicker;

      if (!picker) {
        setState({ status: "unsupported" });
        return;
      }

      const handle = await picker({
        id: DIRECTORY_PICKER_ID,
        mode: "read",
      });

      await clearLaunchedFileHandle();
      await saveDirectoryHandle(handle);
      await refreshDirectory(handle);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      setState({
        status: "error",
        message:
          error instanceof Error ? error.message : "Could not open the folder.",
      });
    }
  }, [refreshDirectory]);

  const reconnect = useCallback(async () => {
    if (launchedFileHandle) {
      await refreshLaunchedFile(launchedFileHandle);
      return;
    }

    const handle = directoryHandle ?? (await loadDirectoryHandle());

    if (!handle) {
      setState({ status: "idle" });
      return;
    }

    await refreshDirectory(handle);
  }, [directoryHandle, launchedFileHandle, refreshDirectory, refreshLaunchedFile]);

  const disconnect = useCallback(async () => {
    await clearAllLocalRepoHandles();
    setDirectoryHandle(null);
    setLaunchedFileHandle(null);
    setState({ status: "idle" });
  }, []);

  return {
    state,
    isRefreshing,
    watchingDisk,
    installedPwa,
    pickDirectory,
    refresh: reconnect,
    disconnect,
  };
}
