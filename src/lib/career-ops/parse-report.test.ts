import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { parseReportMarkdown } from "~/lib/career-ops/parse-report";

describe("parseReportMarkdown", () => {
  it("extracts score, legitimacy, and URL from a career-ops report", () => {
    const fixture = readFileSync(
      join(
        process.cwd(),
        "fixtures/sample-career-repo/reports/001-acme-2026-01-15.md",
      ),
      "utf8",
    );

    const meta = parseReportMarkdown(fixture);

    expect(meta.title).toBe("Acme Corp — Backend Engineer");
    expect(meta.numericScore).toBe(4.2);
    expect(meta.legitimacy).toContain("B");
    expect(meta.sourceUrl).toBe("https://example.com/jobs/acme-backend");
  });

  it("returns defaults for sparse reports", () => {
    expect(parseReportMarkdown("No structured header")).toEqual({
      title: "Evaluation report",
      score: null,
      numericScore: null,
      legitimacy: null,
      sourceUrl: null,
    });
  });
});
