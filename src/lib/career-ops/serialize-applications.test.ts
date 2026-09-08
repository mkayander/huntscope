import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  hasViaColumnInApplicationsMarkdown,
  parseApplicationsMarkdown,
} from "~/lib/career-ops/parse-applications";
import {
  serializeApplicationsMarkdown,
  updateApplicationStatus,
} from "~/lib/career-ops/serialize-applications";

const SAMPLE_TABLE = `# Applications

| # | Date | Company | Role | Score | Status | PDF | Report | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 2026-01-15 | Acme Corp | Backend Engineer | 4.2 | Applied | [cv](output/acme.pdf) | [report](reports/001-acme.md) | Strong fit |
`;

const CAREER_OPS_TABLE_HEADER = `| # | Date | Company | Via | Role | Score | Status | PDF | Report | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |`;

describe("serializeApplicationsMarkdown", () => {
  it("round-trips a simple applications table", () => {
    const parsed = parseApplicationsMarkdown(SAMPLE_TABLE);
    const serialized = serializeApplicationsMarkdown(parsed);
    const reparsed = parseApplicationsMarkdown(serialized);

    expect(reparsed).toEqual(parsed);
  });

  it("round-trips career-ops tables with a Via column", () => {
    const content = readFileSync(
      join(process.cwd(), "fixtures/career-ops-repo/data/applications.md"),
      "utf8",
    );
    const parsed = parseApplicationsMarkdown(content);
    const serialized = serializeApplicationsMarkdown(parsed);
    const reparsed = parseApplicationsMarkdown(serialized);

    expect(reparsed).toEqual(parsed);
  });

  it("preserves an empty Via column when requested", () => {
    const content = `${CAREER_OPS_TABLE_HEADER}
| 1 | 2026-06-20 | Acme | | Engineer | 4.2/5 | Applied | | | |`;

    const parsed = parseApplicationsMarkdown(content);
    const serialized = serializeApplicationsMarkdown(parsed, {
      includeViaColumn: hasViaColumnInApplicationsMarkdown(content),
    });
    const reparsed = parseApplicationsMarkdown(serialized);

    expect(serialized).toContain("| Via |");
    expect(reparsed[0]?.via).toBe("—");
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
