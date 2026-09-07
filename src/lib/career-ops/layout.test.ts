import { describe, expect, it } from "vitest";

import {
  buildCareerOpsRepoData,
  hasCareerOpsLayoutData,
} from "~/lib/career-ops/layout";

describe("hasCareerOpsLayoutData", () => {
  it("detects career-ops layout from applications markdown", () => {
    expect(
      hasCareerOpsLayoutData({
        applicationsMarkdown: "# Applications",
        pipelineMarkdown: null,
        dataFiles: [],
      }),
    ).toBe(true);
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
      outputDirectory: [],
    });

    expect(data.defaultBranch).toBe("develop");
    expect(data.reportsCount).toBe(1);
  });

  it("rejects folders without career-ops data", () => {
    expect(() =>
      buildCareerOpsRepoData({
        owner: "acme",
        name: "empty",
        fullName: "acme/empty",
        applicationsMarkdown: null,
        pipelineMarkdown: null,
        dataDirectory: [],
        reportsDirectory: [],
        outputDirectory: [],
      }),
    ).toThrow(/does not look like a career-ops/);
  });
});
