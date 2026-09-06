import { describe, expect, it } from "vitest";

import { parsePipelineMarkdown } from "~/lib/career-ops/parse-pipeline";

describe("parsePipelineMarkdown", () => {
  it("counts pending and processed sections", () => {
    const content = `## Pending
- Company A
- Company B

## Processed
- Company C
| ignored table row |
`;

    expect(parsePipelineMarkdown(content)).toEqual({
      pendingCount: 2,
      processedCount: 1,
      pendingPreview: ["- Company A", "- Company B"],
    });
  });

  it("returns empty counts when sections are missing", () => {
    expect(parsePipelineMarkdown("# Pipeline\n\nNo sections yet.")).toEqual({
      pendingCount: 0,
      processedCount: 0,
      pendingPreview: [],
    });
  });
});
