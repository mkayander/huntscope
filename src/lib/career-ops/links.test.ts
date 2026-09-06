import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { toGitHubDataSource } from "~/lib/career-ops/data-source";
import {
  extractMarkdownLink,
  resolveArtifactLink,
  resolveRepoFileUrl,
} from "~/lib/career-ops/links";

describe("extractMarkdownLink", () => {
  it("parses markdown links", () => {
    assert.deepEqual(extractMarkdownLink("[Report](reports/foo.md)"), {
      label: "Report",
      href: "reports/foo.md",
    });
  });

  it("returns null for empty values", () => {
    assert.equal(extractMarkdownLink("—"), null);
  });
});

describe("resolveRepoFileUrl", () => {
  it("uses the provided default branch", () => {
    assert.equal(
      resolveRepoFileUrl("acme/career-ops", "reports/foo.md", "develop"),
      "https://github.com/acme/career-ops/blob/develop/reports/foo.md",
    );
  });
});

describe("resolveArtifactLink", () => {
  const githubSource = toGitHubDataSource({
    owner: "acme",
    name: "career-ops",
    fullName: "acme/career-ops",
  });

  it("builds GitHub blob links with a non-main default branch", () => {
    const artifact = resolveArtifactLink(
      githubSource,
      "reports/foo.md",
      "develop",
    );

    assert.deepEqual(artifact, {
      label: "Report",
      href: "https://github.com/acme/career-ops/blob/develop/reports/foo.md",
    });
  });

  it("keeps absolute markdown hrefs unchanged", () => {
    const artifact = resolveArtifactLink(
      githubSource,
      "[Notes](https://example.com/report)",
      "main",
    );

    assert.deepEqual(artifact, {
      label: "Notes",
      href: "https://example.com/report",
    });
  });
});
