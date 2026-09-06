import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  isSameDataSource,
  toGitHubDataSource,
  toLocalDataSource,
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

    assert.equal(isSameDataSource(left, left), true);
    assert.equal(isSameDataSource(left, right), false);
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

    assert.equal(isSameDataSource(left, left), true);
    assert.equal(isSameDataSource(left, right), false);
  });
});
