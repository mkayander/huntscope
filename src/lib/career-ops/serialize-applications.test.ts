import { describe, expect, it } from "vitest";

import { parseApplicationsMarkdown } from "~/lib/career-ops/parse-applications";
import {
  serializeApplicationsMarkdown,
  updateApplicationStatus,
} from "~/lib/career-ops/serialize-applications";

const SAMPLE_TABLE = `# Applications

| # | Date | Company | Role | Score | Status | PDF | Report | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 2026-01-15 | Acme Corp | Backend Engineer | 4.2 | Applied | [cv](output/acme.pdf) | [report](reports/001-acme.md) | Strong fit |
`;

describe("serializeApplicationsMarkdown", () => {
  it("round-trips a simple applications table", () => {
    const parsed = parseApplicationsMarkdown(SAMPLE_TABLE);
    const serialized = serializeApplicationsMarkdown(parsed);
    const reparsed = parseApplicationsMarkdown(serialized);

    expect(reparsed).toEqual(parsed);
  });

  it("updates status for one application", () => {
    const parsed = parseApplicationsMarkdown(SAMPLE_TABLE);
    const updated = updateApplicationStatus(parsed, 1, "Interview");
    const reparsed = parseApplicationsMarkdown(
      serializeApplicationsMarkdown(updated),
    );

    expect(reparsed[0]?.status).toBe("Interview");
  });
});
