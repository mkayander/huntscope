"use client";

import { useCallback, useEffect, useState } from "react";

import {
  supportsDirectoryPicker,
  supportsFileSystemObserver,
} from "~/lib/local-repo/file-system-types";
import { watchDirectory } from "~/lib/local-repo/observer";
import {
  ensureReadPermission,
  readLocalRepoPreview,
  type LocalRepoPreview,
} from "~/lib/local-repo/reader";
import {
  clearDirectoryHandle,
  loadDirectoryHandle,
  saveDirectoryHandle,
} from "~/lib/local-repo/storage";

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
  const [directoryHandle, setDirectoryHandle] =
    useState<FileSystemDirectoryHandle | null>(null);

  const refresh = useCallback(async (handle: FileSystemDirectoryHandle) => {
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

  const restore = useCallback(async () => {
    if (!supportsDirectoryPicker()) {
      setState({ status: "unsupported" });
      return;
    }

    const handle = await loadDirectoryHandle();

    if (!handle) {
      setState({ status: "idle" });
      return;
    }

    await refresh(handle);
  }, [refresh]);

  useEffect(() => {
    void restore();
  }, [restore]);

  useEffect(() => {
    if (!directoryHandle || state.status !== "connected") {
      setWatchingDisk(false);
      return;
    }

    const stopWatching = watchDirectory(directoryHandle, () => {
      void refresh(directoryHandle);
    });

    setWatchingDisk(supportsFileSystemObserver());
    return stopWatching;
  }, [directoryHandle, refresh, state.status]);

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
        id: "huntscope-local-repo",
        mode: "read",
      });

      await saveDirectoryHandle(handle);
      await refresh(handle);
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
  }, [refresh]);

  const reconnect = useCallback(async () => {
    const handle = directoryHandle ?? (await loadDirectoryHandle());

    if (!handle) {
      setState({ status: "idle" });
      return;
    }

    await refresh(handle);
  }, [directoryHandle, refresh]);

  const disconnect = useCallback(async () => {
    await clearDirectoryHandle();
    setDirectoryHandle(null);
    setState({ status: "idle" });
  }, []);

  return {
    state,
    isRefreshing,
    watchingDisk,
    pickDirectory,
    refresh: reconnect,
    disconnect,
  };
}
