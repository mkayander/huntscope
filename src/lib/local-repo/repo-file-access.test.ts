import { describe, expect, it } from "vitest";

import {
  assertLocalTextFileUnchanged,
  type RepoFilePayload,
} from "~/lib/local-repo/repo-file-access";

function textFile(content: string): RepoFilePayload {
  return {
    path: "data/applications.md",
    encoding: "utf-8",
    content,
    mimeType: "text/markdown",
  };
}

describe("assertLocalTextFileUnchanged", () => {
  it("allows a write when the file still matches the loaded content", () => {
    expect(() =>
      assertLocalTextFileUnchanged(
        "loaded content",
        textFile("loaded content"),
      ),
    ).not.toThrow();
  });

  it("rejects a write when another process changed the file", () => {
    expect(() =>
      assertLocalTextFileUnchanged("loaded content", textFile("newer content")),
    ).toThrow("changed after Huntscope loaded it");
  });

  it("allows creation only when the expected file is still absent", () => {
    expect(() => assertLocalTextFileUnchanged(null, null)).not.toThrow();
    expect(() =>
      assertLocalTextFileUnchanged(null, textFile("created elsewhere")),
    ).toThrow("changed after Huntscope loaded it");
  });
});
