import { describe, expect, it } from "vitest";

import {
  hasMeaningfulViaValue,
  parseApplicationsMarkdown,
  shouldShowViaColumn,
} from "~/lib/career-ops/parse-applications";

const LEGACY_TABLE_HEADER = `| # | Date | Company | Role | Score | Status | PDF | Report | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |`;

const CAREER_OPS_TABLE_HEADER = `| # | Date | Company | Via | Role | Score | Status | PDF | Report | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |`;

describe("hasMeaningfulViaValue", () => {
  it("treats placeholders as empty", () => {
    expect(hasMeaningfulViaValue("")).toBe(false);
    expect(hasMeaningfulViaValue("—")).toBe(false);
    expect(hasMeaningfulViaValue("-")).toBe(false);
  });

  it("detects agency names", () => {
    expect(hasMeaningfulViaValue("Hays")).toBe(true);
  });
});

describe("shouldShowViaColumn", () => {
  it("is false when every row has an empty via", () => {
    expect(
      shouldShowViaColumn([
        {
          num: 1,
          date: "2026-01-01",
          company: "Acme",
          via: "—",
          role: "Engineer",
          score: "4",
          status: "Applied",
          pdf: "",
          report: "",
          notes: "",
        },
      ]),
    ).toBe(false);
  });

  it("is true when at least one row has a via value", () => {
    expect(
      shouldShowViaColumn([
        {
          num: 1,
          date: "2026-01-01",
          company: "Acme",
          via: "—",
          role: "Engineer",
          score: "4",
          status: "Applied",
          pdf: "",
          report: "",
          notes: "",
        },
        {
          num: 2,
          date: "2026-01-02",
          company: "Globex",
          via: "Hays",
          role: "Staff Engineer",
          score: "4.5",
          status: "Interview",
          pdf: "",
          report: "",
          notes: "",
        },
      ]),
    ).toBe(true);
  });
});

describe("parseApplicationsMarkdown", () => {
  it("parses legacy application table rows without a Via column", () => {
    const content = `${LEGACY_TABLE_HEADER}
| 1 | 2025-01-01 | Acme | Engineer | 4.5 | Applied | cv.pdf | reports/acme.md | Strong fit |`;

    expect(parseApplicationsMarkdown(content)).toEqual([
      {
        num: 1,
        date: "2025-01-01",
        company: "Acme",
        via: "",
        role: "Engineer",
        score: "4.5",
        status: "Applied",
        pdf: "cv.pdf",
        report: "reports/acme.md",
        notes: "Strong fit",
      },
    ]);
  });

  it("parses career-ops application tables with a Via column", () => {
    const content = `${CAREER_OPS_TABLE_HEADER}
| 1 | 2026-06-20 | Acme | — | Senior Platform Engineer | 4.2/5 | Applied | ✅ | [1](../reports/001-acme-2026-06-20.md) | Strong platform fit |
| 2 | 2026-06-25 | Globex | Hays | Staff DevOps Engineer | 4.5/5 | Interview | ✅ | [2](../reports/002-globex-2026-06-25.md) | Referral via ex-colleague |`;

    expect(parseApplicationsMarkdown(content)).toEqual([
      {
        num: 1,
        date: "2026-06-20",
        company: "Acme",
        via: "—",
        role: "Senior Platform Engineer",
        score: "4.2/5",
        status: "Applied",
        pdf: "✅",
        report: "[1](../reports/001-acme-2026-06-20.md)",
        notes: "Strong platform fit",
      },
      {
        num: 2,
        date: "2026-06-25",
        company: "Globex",
        via: "Hays",
        role: "Staff DevOps Engineer",
        score: "4.5/5",
        status: "Interview",
        pdf: "✅",
        report: "[2](../reports/002-globex-2026-06-25.md)",
        notes: "Referral via ex-colleague",
      },
    ]);
  });

  it("skips header and separator rows", () => {
    const content = `${LEGACY_TABLE_HEADER}
| not-a-number | 2025-01-01 | Acme | Engineer | 4 | Applied | | | |`;

    expect(parseApplicationsMarkdown(content)).toEqual([]);
  });

  it("parses multiple rows", () => {
    const content = `${LEGACY_TABLE_HEADER}
| 1 | 2025-01-01 | Acme | Engineer | 4 | Applied | | | |
| 2 | 2025-01-02 | Beta | Designer | 3 | Interview | | | |`;

    expect(parseApplicationsMarkdown(content)).toHaveLength(2);
    expect(parseApplicationsMarkdown(content)[1]?.company).toBe("Beta");
  });
});
