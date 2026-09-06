import { describe, expect, it } from "vitest";

import { toGitHubDataSource } from "~/lib/career-ops/data-source";
import {
  extractMarkdownLink,
  resolveArtifactLink,
  resolveRepoFileUrl,
} from "~/lib/career-ops/links";

describe("extractMarkdownLink", () => {
  it("parses markdown links", () => {
    expect(extractMarkdownLink("[Report](reports/foo.md)")).toEqual({
      label: "Report",
      href: "reports/foo.md",
    });
  });

  it("returns null for empty values", () => {
    expect(extractMarkdownLink("—")).toBeNull();
  });
});

describe("resolveRepoFileUrl", () => {
  it("uses the provided default branch", () => {
    expect(
      resolveRepoFileUrl("acme/career-ops", "reports/foo.md", "develop"),
    ).toBe("https://github.com/acme/career-ops/blob/develop/reports/foo.md");
  });
});

describe("resolveArtifactLink", () => {
  const githubSource = toGitHubDataSource({
    owner: "acme",
    name: "career-ops",
    fullName: "acme/career-ops",
  });

  it("builds GitHub blob links with a non-main default branch", () => {
    expect(
      resolveArtifactLink(githubSource, "reports/foo.md", "develop"),
    ).toEqual({
      label: "Report",
      href: "https://github.com/acme/career-ops/blob/develop/reports/foo.md",
      path: "reports/foo.md",
    });
  });

  it("keeps absolute markdown hrefs unchanged", () => {
    expect(
      resolveArtifactLink(
        githubSource,
        "[Notes](https://example.com/report)",
        "main",
      ),
    ).toEqual({
      label: "Notes",
      href: "https://example.com/report",
      path: null,
    });
  });
});
