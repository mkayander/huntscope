import { describe, expect, it } from "vitest";

import {
  isSameDataSource,
  toGitHubDataSource,
  toLocalDataSource,
  toLocalDataSourceFromConnectedRepo,
} from "~/lib/career-ops/data-source";

describe("career-ops data source helpers", () => {
  it("compares local sources by session id", () => {
    const left = toLocalDataSource({
      directoryName: "career-ops",
      displayName: "career-ops",
      sessionId: "session-a",
      directoryHandle: null,
      fileHandle: null,
    });
    const right = toLocalDataSource({
      directoryName: "career-ops",
      displayName: "career-ops",
      sessionId: "session-b",
      directoryHandle: null,
      fileHandle: null,
    });

    expect(isSameDataSource(left, left)).toBe(true);
    expect(isSameDataSource(left, right)).toBe(false);
  });

  it("compares GitHub sources by full name", () => {
    const left = toGitHubDataSource({
      owner: "acme",
      name: "career-ops",
      fullName: "acme/career-ops",
    });
    const right = toGitHubDataSource({
      owner: "acme",
      name: "other",
      fullName: "acme/other",
    });

    expect(isSameDataSource(left, left)).toBe(true);
    expect(isSameDataSource(left, right)).toBe(false);
  });

  it("builds a local source from connected repo state", () => {
    const source = toLocalDataSourceFromConnectedRepo({
      preview: {
        directoryName: "career-ops",
        source: "directory",
      },
      sessionId: "session-a",
      directoryHandle: null,
      fileHandle: null,
    });

    expect(source).toEqual(
      toLocalDataSource({
        directoryName: "career-ops",
        displayName: "career-ops",
        sessionId: "session-a",
        directoryHandle: null,
        fileHandle: null,
      }),
    );
  });
});
