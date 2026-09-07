import { describe, expect, it } from "vitest";

import {
  DEFAULT_DASHBOARD_FILTERS,
  filterDashboardApplications,
  getDashboardPeriodCutoff,
  hasActiveDashboardFilters,
  matchesDashboardPeriod,
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
    report: "reports/gamma.md",
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

  it("filters by period using application dates", () => {
    const filtered = filterDashboardApplications(
      applications,
      {
        ...DEFAULT_DASHBOARD_FILTERS,
        periodWeeks: 12,
      },
      { referenceDate: new Date("2026-02-15") },
    );

    expect(filtered.map((entry) => entry.company)).toEqual(["Acme", "Gamma"]);
  });

  it("filters by search query", () => {
    const filtered = filterDashboardApplications(applications, {
      ...DEFAULT_DASHBOARD_FILTERS,
      searchQuery: "beta",
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.company).toBe("Beta");
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
});

describe("matchesDashboardPeriod", () => {
  it("includes undated applications only when all time is selected", () => {
    expect(
      matchesDashboardPeriod(
        createApplication(1, { date: "" }),
        null,
        new Date("2026-02-15"),
      ),
    ).toBe(true);
    expect(
      matchesDashboardPeriod(
        createApplication(1, { date: "" }),
        12,
        new Date("2026-02-15"),
      ),
    ).toBe(false);
  });
});

describe("getDashboardPeriodCutoff", () => {
  it("returns a date key N weeks before the reference date", () => {
    expect(getDashboardPeriodCutoff(12, new Date("2026-02-15"))).toBe(
      "2025-11-23",
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
        reportFilters: ["with"],
      }),
    ).toBe(true);
  });
});
