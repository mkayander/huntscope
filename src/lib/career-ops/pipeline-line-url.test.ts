import { describe, expect, it } from "vitest";

import { extractPipelineLineUrl } from "~/lib/career-ops/pipeline-line-url";
import { collectPipelineSectionUrls } from "~/lib/career-ops/pipeline-section-urls";

describe("extractPipelineLineUrl", () => {
  it("reads bare URLs and checklist rows", () => {
    expect(extractPipelineLineUrl("https://example.com/jobs/1")).toBe(
      "https://example.com/jobs/1",
    );
    expect(
      extractPipelineLineUrl(
        "- [ ] https://jobs.example.com/123 | Acme | Engineer",
      ),
    ).toBe("https://jobs.example.com/123");
  });
});

describe("collectPipelineSectionUrls", () => {
  it("collects URLs inside a fenced pending block", () => {
    const urls = collectPipelineSectionUrls([
      "```",
      "https://one.example.com",
      "https://two.example.com",
      "```",
    ]);

    expect(urls).toEqual([
      "https://one.example.com",
      "https://two.example.com",
    ]);
  });
});
