import type { CareerOpsDataSource } from "~/lib/career-ops/data-source";

export type LocalWriteAvailability =
  { mode: "editable"; hint: string } | { mode: "read-only"; hint: string };

export function getLocalWriteAvailability(
  source: CareerOpsDataSource,
): LocalWriteAvailability | null {
  if (source.kind === "github") {
    return {
      mode: "read-only",
      hint: "GitHub connections are read-only. Open your career-ops project folder locally to edit status and pipeline URLs.",
    };
  }

  if (source.kind === "local" && source.fileHandle != null) {
    return {
      mode: "read-only",
      hint: "This connection is a single file. Choose the project folder to save tracker and pipeline edits.",
    };
  }

  if (source.kind === "local" && source.directoryHandle != null) {
    return {
      mode: "editable",
      hint: "Status and pipeline edits save to your project folder on disk.",
    };
  }

  return null;
}

export function isStaleLocalWriteConflict(message: string): boolean {
  return /changed after Huntscope loaded it/i.test(message);
}
