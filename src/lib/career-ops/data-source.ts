import type { SelectedRepo } from "~/lib/career-ops/types";

export type CareerOpsDataSource =
  | {
      kind: "local";
      directoryName: string;
      displayName: string;
      directoryHandle: FileSystemDirectoryHandle;
    }
  | {
      kind: "github";
      repo: SelectedRepo;
    };

export type CareerOpsDataSourcePreference = "local" | "github";

export const DATA_SOURCE_PREFERENCE_KEY = "huntscope.data-source-preference";

export function getDataSourceLabel(source: CareerOpsDataSource): string {
  return source.kind === "github" ? source.repo.fullName : source.displayName;
}

export function readDataSourcePreference(): CareerOpsDataSourcePreference | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.sessionStorage.getItem(DATA_SOURCE_PREFERENCE_KEY);

  if (value === "local" || value === "github") {
    return value;
  }

  return null;
}

export function writeDataSourcePreference(
  preference: CareerOpsDataSourcePreference,
) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(DATA_SOURCE_PREFERENCE_KEY, preference);
}

export function toLocalDataSource(
  directoryHandle: FileSystemDirectoryHandle,
): CareerOpsDataSource {
  return {
    kind: "local",
    directoryName: directoryHandle.name,
    displayName: directoryHandle.name,
    directoryHandle,
  };
}

export function toGitHubDataSource(repo: SelectedRepo): CareerOpsDataSource {
  return {
    kind: "github",
    repo,
  };
}

export function isSameDataSource(
  left: CareerOpsDataSource | null | undefined,
  right: CareerOpsDataSource | null | undefined,
): boolean {
  if (!left || !right) {
    return false;
  }

  if (left.kind !== right.kind) {
    return false;
  }

  if (left.kind === "local" && right.kind === "local") {
    return left.directoryName === right.directoryName;
  }

  if (left.kind === "github" && right.kind === "github") {
    return left.repo.fullName === right.repo.fullName;
  }

  return false;
}
