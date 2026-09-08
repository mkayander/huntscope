import { readFileSync } from "node:fs";
import { join } from "node:path";

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

    expect(serialized).toContain("| Via |");
    expect(reparsed).toEqual(parsed);
  });

  it("omits the Via column when no rows have meaningful via values", () => {
    const content = `${CAREER_OPS_TABLE_HEADER}
| 1 | 2026-06-20 | Acme | — | Engineer | 4.2/5 | Applied | | | |
| 2 | 2026-06-25 | Globex | — | Staff DevOps Engineer | 4.5/5 | Interview | | | |`;

    const parsed = parseApplicationsMarkdown(content);
    const serialized = serializeApplicationsMarkdown(parsed);

    expect(serialized).not.toContain("| Via |");

    const reparsed = parseApplicationsMarkdown(serialized);
    expect(reparsed.map((application) => application.role)).toEqual(
      parsed.map((application) => application.role),
    );
    expect(reparsed.every((application) => application.via === "")).toBe(true);
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
