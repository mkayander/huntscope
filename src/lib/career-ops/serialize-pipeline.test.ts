import { describe, expect, it } from "vitest";

import {
  appendPendingPipelineUrl,
  parsePipelineSections,
} from "~/lib/career-ops/serialize-pipeline";

describe("serialize-pipeline", () => {
  it("appends a pending URL without duplicates", () => {
    const initial = `# Pipeline

## Pending

https://example.com/jobs/1

## Processed

`;

    const first = appendPendingPipelineUrl(
      initial,
      "https://example.com/jobs/2",
    );
    const second = appendPendingPipelineUrl(
      first,
      "https://example.com/jobs/2",
    );

    expect(parsePipelineSections(first).pending).toEqual([
      "https://example.com/jobs/1",
      "https://example.com/jobs/2",
    ]);
    expect(second).toBe(first);
  });
});
