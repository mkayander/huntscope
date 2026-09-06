import { describe, expect, it } from "vitest";

import { parseApplicationsMarkdown } from "~/lib/career-ops/parse-applications";

const TABLE_HEADER = `| # | Date | Company | Role | Score | Status | PDF | Report | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |`;

describe("parseApplicationsMarkdown", () => {
  it("parses application table rows", () => {
    const content = `${TABLE_HEADER}
| 1 | 2025-01-01 | Acme | Engineer | 4.5 | Applied | cv.pdf | reports/acme.md | Strong fit |`;

    expect(parseApplicationsMarkdown(content)).toEqual([
      {
        num: 1,
        date: "2025-01-01",
        company: "Acme",
        role: "Engineer",
        score: "4.5",
        status: "Applied",
        pdf: "cv.pdf",
        report: "reports/acme.md",
        notes: "Strong fit",
      },
    ]);
  });

  it("skips header and separator rows", () => {
    const content = `${TABLE_HEADER}
| not-a-number | 2025-01-01 | Acme | Engineer | 4 | Applied | | | |`;

    expect(parseApplicationsMarkdown(content)).toEqual([]);
  });

  it("parses multiple rows", () => {
    const content = `${TABLE_HEADER}
| 1 | 2025-01-01 | Acme | Engineer | 4 | Applied | | | |
| 2 | 2025-01-02 | Beta | Designer | 3 | Interview | | | |`;

    expect(parseApplicationsMarkdown(content)).toHaveLength(2);
    expect(parseApplicationsMarkdown(content)[1]?.company).toBe("Beta");
  });
});
