import { describe, expect, it } from "vitest";

import {
  buildCareerOpsRepoData,
  CAREER_OPS_PATHS,
  hasCareerOpsLayoutData,
} from "~/lib/career-ops/layout";

const defaultLayout = {
  dataRoot: "",
  applicationsPath: CAREER_OPS_PATHS.applications,
  pipelinePath: CAREER_OPS_PATHS.pipeline,
  dataDir: CAREER_OPS_PATHS.dataDir,
  reportsDir: CAREER_OPS_PATHS.reportsDir,
  outputDir: CAREER_OPS_PATHS.outputDir,
};

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
      layout: defaultLayout,
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
        layout: defaultLayout,
        applicationsMarkdown: null,
        pipelineMarkdown: null,
        dataDirectory: [],
        reportsDirectory: [],
        outputDirectory: [],
      }),
    ).toThrow(/does not look like a career-ops/);
  });
});
