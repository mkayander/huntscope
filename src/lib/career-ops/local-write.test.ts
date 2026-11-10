import { describe, expect, it } from "vitest";

import {
  getLocalWriteAvailability,
  isStaleLocalWriteConflict,
} from "~/lib/career-ops/local-write";
import type { CareerOpsDataSource } from "~/lib/career-ops/data-source";

describe("isStaleLocalWriteConflict", () => {
  it("detects the reload message from repo-file-access", () => {
    expect(
      isStaleLocalWriteConflict(
        "This file changed after Huntscope loaded it. Reload the folder and try again so newer changes are not overwritten.",
      ),
    ).toBe(true);
  });
});

describe("getLocalWriteAvailability", () => {
  const localDirectory: CareerOpsDataSource = {
    kind: "local",
    directoryName: "career-ops",
    displayName: "career-ops",
    sessionId: "session",
    directoryHandle: {} as FileSystemDirectoryHandle,
    fileHandle: null,
  };

  it("marks folder connections as editable", () => {
    expect(getLocalWriteAvailability(localDirectory)?.mode).toBe("editable");
  });

  it("marks GitHub as read-only", () => {
    expect(
      getLocalWriteAvailability({
        kind: "github",
        repo: { owner: "acme", name: "data", fullName: "acme/data" },
      })?.mode,
    ).toBe("read-only");
  });
});
