import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildCareerOpsRepoData,
  hasCareerOpsLayoutData,
} from "~/lib/career-ops/layout";

describe("hasCareerOpsLayoutData", () => {
  it("detects career-ops layout from applications markdown", () => {
    assert.equal(
      hasCareerOpsLayoutData({
        applicationsMarkdown: "# Applications",
        pipelineMarkdown: null,
        dataFiles: [],
      }),
      true,
    );
  });
});

describe("buildCareerOpsRepoData", () => {
  it("includes the repository default branch", () => {
    const data = buildCareerOpsRepoData({
      owner: "acme",
      name: "career-ops",
      fullName: "acme/career-ops",
      defaultBranch: "develop",
      applicationsMarkdown: "# Applications",
      pipelineMarkdown: null,
      dataDirectory: [],
      reportsDirectory: [{ path: "reports/a.md", name: "a.md", type: "file" }],
    });

    assert.equal(data.defaultBranch, "develop");
    assert.equal(data.reportsCount, 1);
  });

  it("rejects folders without career-ops data", () => {
    assert.throws(
      () =>
        buildCareerOpsRepoData({
          owner: "acme",
          name: "empty",
          fullName: "acme/empty",
          applicationsMarkdown: null,
          pipelineMarkdown: null,
          dataDirectory: [],
          reportsDirectory: [],
        }),
      /does not look like a career-ops/,
    );
  });
});
