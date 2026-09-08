import { describe, expect, it } from "vitest";

import {
  DEFAULT_DASHBOARD_FILTERS,
  filterDashboardApplications,
  getDashboardFilterSummaryLine,
  hasActiveDashboardFilters,
} from "~/lib/career-ops/dashboard-filters";
import type { ApplicationEntry } from "~/lib/career-ops/types";

function createApplication(
  num: number,
  overrides: Partial<ApplicationEntry> = {},
): ApplicationEntry {
  return {
    num,
    date: "2026-01-15",
    company: `Company ${num}`,
    via: "",
    role: "Engineer",
    score: "4.2",
    status: "Applied",
    pdf: "",
    report: "",
    notes: "",
    ...overrides,
  };
}

const applications: ApplicationEntry[] = [
  createApplication(1, {
    date: "2026-01-10",
    score: "4.5",
    status: "Applied",
    company: "Acme",
    pdf: "[cv](output/acme.pdf)",
    report: "reports/acme.md",
  }),
  createApplication(2, {
    date: "2025-01-01",
    score: "2.0",
    status: "Rejected",
    company: "Beta",
  }),
  createApplication(3, {
    date: "2026-02-01",
    score: "4.1",
    status: "Interview",
    company: "Gamma",
  }),
];

describe("filterDashboardApplications", () => {
  it("filters by score band and status together", () => {
    const filtered = filterDashboardApplications(applications, {
      ...DEFAULT_DASHBOARD_FILTERS,
      scoreFilters: ["high"],
      statusFilters: ["Applied", "Interview"],
    });

    expect(filtered.map((entry) => entry.company)).toEqual(["Acme", "Gamma"]);
  });

  it("filters by preset weeks using application dates", () => {
    const filtered = filterDashboardApplications(
      applications,
      {
        ...DEFAULT_DASHBOARD_FILTERS,
        period: { kind: "weeks", weeks: 12 },
      },
      { referenceDate: new Date("2026-02-15") },
    );

    expect(filtered.map((entry) => entry.company)).toEqual(["Acme", "Gamma"]);
  });

  it("filters by last N days", () => {
    const filtered = filterDashboardApplications(
      applications,
      {
        ...DEFAULT_DASHBOARD_FILTERS,
        period: { kind: "days", days: 20 },
      },
      { referenceDate: new Date("2026-02-15") },
    );

    expect(filtered.map((entry) => entry.company)).toEqual(["Gamma"]);
  });

  it("filters by explicit date range", () => {
    const filtered = filterDashboardApplications(
      applications,
      {
        ...DEFAULT_DASHBOARD_FILTERS,
        period: {
          kind: "range",
          start: "2026-01-01",
          end: "2026-01-15",
        },
      },
      { referenceDate: new Date("2026-02-15") },
    );

    expect(filtered.map((entry) => entry.company)).toEqual(["Acme"]);
  });

  it("filters by search query", () => {
    const filtered = filterDashboardApplications(applications, {
      ...DEFAULT_DASHBOARD_FILTERS,
      searchQuery: "gamma",
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.company).toBe("Gamma");
  });

  it("filters by report presence", () => {
    const filtered = filterDashboardApplications(
      applications,
      {
        ...DEFAULT_DASHBOARD_FILTERS,
        statusFilters: ["Applied"],
        scoreFilters: ["high"],
        reportFilters: ["with"],
      },
      {
        repoFiles: {
          reportFiles: [],
          outputFiles: [],
        },
      },
    );

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.company).toBe("Acme");
  });

  it("filters by pdf presence using inferred output files", () => {
    const filtered = filterDashboardApplications(
      applications,
      {
        ...DEFAULT_DASHBOARD_FILTERS,
        statusFilters: ["Rejected"],
        pdfFilters: ["with"],
      },
      {
        repoFiles: {
          reportFiles: [],
          outputFiles: [
            {
              path: "output/beta.pdf",
              name: "beta.pdf",
              type: "file",
            },
          ],
        },
      },
    );

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.company).toBe("Beta");
  });

  it("treats inferred report files as report coverage", () => {
    const filtered = filterDashboardApplications(
      applications,
      {
        ...DEFAULT_DASHBOARD_FILTERS,
        statusFilters: ["Rejected"],
        reportFilters: ["with"],
      },
      {
        repoFiles: {
          reportFiles: [
            {
              path: "reports/002-beta.md",
              name: "002-beta.md",
              type: "file",
            },
          ],
          outputFiles: [],
        },
      },
    );

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.company).toBe("Beta");
  });

  it("matches any selected status when multiple are chosen", () => {
    const results = filterDashboardApplications(applications, {
      ...DEFAULT_DASHBOARD_FILTERS,
      statusFilters: ["Applied", "Rejected"],
    });

    expect(results.map((entry) => entry.company).sort()).toEqual([
      "Acme",
      "Beta",
    ]);
  });

  it("matches any selected score band when multiple are chosen", () => {
    const results = filterDashboardApplications(applications, {
      ...DEFAULT_DASHBOARD_FILTERS,
      scoreFilters: ["high", "low"],
    });

    expect(results.map((entry) => entry.company).sort()).toEqual([
      "Acme",
      "Beta",
      "Gamma",
    ]);
  });

  it("searches across company and role fields", () => {
    const results = filterDashboardApplications(applications, {
      ...DEFAULT_DASHBOARD_FILTERS,
      searchQuery: "gamma",
    });

    expect(results).toHaveLength(1);
    expect(results[0]?.company).toBe("Gamma");
  });
});

describe("getDashboardFilterSummaryLine", () => {
  it("builds a readable summary for active filters", () => {
    expect(
      getDashboardFilterSummaryLine(
        {
          ...DEFAULT_DASHBOARD_FILTERS,
          period: { kind: "days", days: 4 },
          scoreFilters: ["high"],
          statusFilters: ["Applied"],
        },
        {
          resultCount: 1,
          totalCount: 3,
          statusOptions: [{ value: "Applied", label: "Applied" }],
        },
      ),
    ).toBe(
      "Showing 1 of 3 applications · period: Last 4 days · status: Applied · score: High (4+)",
    );
  });
});

describe("hasActiveDashboardFilters", () => {
  it("detects active filters", () => {
    expect(hasActiveDashboardFilters(DEFAULT_DASHBOARD_FILTERS)).toBe(false);
    expect(
      hasActiveDashboardFilters({
        ...DEFAULT_DASHBOARD_FILTERS,
        scoreFilters: ["high"],
      }),
    ).toBe(true);
    expect(
      hasActiveDashboardFilters({
        ...DEFAULT_DASHBOARD_FILTERS,
        period: { kind: "days", days: 4 },
      }),
    ).toBe(true);
    expect(
      hasActiveDashboardFilters({
        ...DEFAULT_DASHBOARD_FILTERS,
        reportFilters: ["with"],
      }),
    ).toBe(true);
  });
});
