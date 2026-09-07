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

describe("filterDashboardApplications", () => {
  const applications = [
    createApplication(1, {
      date: "2026-01-10",
      score: "4.5",
      status: "Applied",
      company: "Acme",
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
      new Date("2026-02-15"),
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
  });
});
