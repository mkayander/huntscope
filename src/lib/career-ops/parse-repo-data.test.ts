import { describe, expect, it } from "vitest";

import { parseCareerOpsRepoData } from "~/lib/career-ops/parse-repo-data";

const APPLICATIONS = `| # | Date | Company | Role | Score | Status | PDF | Report | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 2025-01-01 | Acme | Engineer | 4 | Applied | | | |`;

const PIPELINE = `## Pending
- Company A

## Processed
- Company B`;

describe("parseCareerOpsRepoData", () => {
  it("combines applications, pipeline, and analytics", () => {
    const parsed = parseCareerOpsRepoData({
      applicationsMarkdown: APPLICATIONS,
      pipelineMarkdown: PIPELINE,
    });

    expect(parsed.applications).toHaveLength(1);
    expect(parsed.pipeline).toEqual({
      pendingCount: 1,
      processedCount: 1,
      pendingPreview: ["- Company A"],
    });
    expect(parsed.analytics.total).toBe(1);
    expect(parsed.analytics.topFitCount).toBe(1);
  });

  it("handles missing markdown inputs", () => {
    const parsed = parseCareerOpsRepoData({
      applicationsMarkdown: null,
      pipelineMarkdown: null,
    });

    expect(parsed.applications).toEqual([]);
    expect(parsed.pipeline).toBeNull();
    expect(parsed.analytics.total).toBe(0);
  });
});
