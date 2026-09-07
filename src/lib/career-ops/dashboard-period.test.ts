import { describe, expect, it } from "vitest";

import {
  buildApplicationDateCounts,
  DEFAULT_DASHBOARD_PERIOD,
  getActivityHeatmapPeriodWeeks,
  getActivityHeatmapWindow,
  getCalendarMonthDays,
  getDashboardPeriodLabel,
  getDashboardPeriodStartKey,
  isDashboardPeriodCustom,
  matchesDashboardPeriod,
  matchesDashboardPeriodPreset,
  normalizeDashboardDateRange,
  normalizeDashboardPeriodDays,
  parseDashboardPeriodDaysInput,
} from "~/lib/career-ops/dashboard-period";
import type { ApplicationEntry } from "~/lib/career-ops/types";

function createApplication(date: string, company = "Acme"): ApplicationEntry {
  return {
    num: 1,
    date,
    company,
    role: "Engineer",
    score: "4.0",
    status: "Applied",
    pdf: "",
    report: "",
    notes: "",
  };
}

describe("matchesDashboardPeriod", () => {
  it("filters by preset weeks", () => {
    expect(
      matchesDashboardPeriod(
        createApplication("2026-01-10"),
        { kind: "weeks", weeks: 12 },
        new Date("2026-02-15"),
      ),
    ).toBe(true);
    expect(
      matchesDashboardPeriod(
        createApplication("2025-01-01"),
        { kind: "weeks", weeks: 12 },
        new Date("2026-02-15"),
      ),
    ).toBe(false);
  });

  it("filters by last N days inclusively", () => {
    expect(
      matchesDashboardPeriod(
        createApplication("2026-02-13"),
        { kind: "days", days: 4 },
        new Date("2026-02-15"),
      ),
    ).toBe(true);
    expect(
      matchesDashboardPeriod(
        createApplication("2026-02-10"),
        { kind: "days", days: 4 },
        new Date("2026-02-15"),
      ),
    ).toBe(false);
  });

  it("filters by explicit date range", () => {
    expect(
      matchesDashboardPeriod(createApplication("2026-02-01"), {
        kind: "range",
        start: "2026-02-01",
        end: "2026-02-10",
      }),
    ).toBe(true);
    expect(
      matchesDashboardPeriod(createApplication("2026-02-11"), {
        kind: "range",
        start: "2026-02-01",
        end: "2026-02-10",
      }),
    ).toBe(false);
  });

  it("includes undated applications only when all time is selected", () => {
    expect(
      matchesDashboardPeriod(createApplication(""), DEFAULT_DASHBOARD_PERIOD),
    ).toBe(true);
    expect(
      matchesDashboardPeriod(createApplication(""), { kind: "days", days: 7 }),
    ).toBe(false);
  });
});

describe("getDashboardPeriodLabel", () => {
  it("describes custom day and range periods", () => {
    expect(getDashboardPeriodLabel({ kind: "days", days: 4 })).toBe(
      "Last 4 days",
    );
    expect(
      getDashboardPeriodLabel({
        kind: "range",
        start: "2026-01-10",
        end: "2026-02-03",
      }),
    ).toContain("2026");
  });
});

describe("normalizeDashboardDateRange", () => {
  it("orders reversed ranges", () => {
    expect(normalizeDashboardDateRange("2026-02-10", "2026-01-01")).toEqual({
      start: "2026-01-01",
      end: "2026-02-10",
    });
  });
});

describe("buildApplicationDateCounts", () => {
  it("counts applications per date key", () => {
    expect(
      buildApplicationDateCounts([
        createApplication("2026-01-10"),
        createApplication("2026-01-10", "Beta"),
        createApplication("2026-01-11", "Gamma"),
      ]).get("2026-01-10"),
    ).toBe(2);
  });
});

describe("getActivityHeatmapWindow", () => {
  it("aligns custom day periods to the exact rolling window", () => {
    expect(
      getActivityHeatmapWindow(
        { kind: "days", days: 4 },
        new Date("2026-02-15"),
      ),
    ).toEqual({
      startDateKey: "2026-02-08",
      endDateKey: "2026-02-15",
    });
  });

  it("aligns explicit ranges to week boundaries", () => {
    expect(
      getActivityHeatmapWindow(
        {
          kind: "range",
          start: "2026-02-03",
          end: "2026-02-10",
        },
        new Date("2026-02-15"),
      ),
    ).toEqual({
      startDateKey: "2026-02-01",
      endDateKey: "2026-02-10",
    });
  });
});

describe("getActivityHeatmapPeriodWeeks", () => {
  it("maps short custom periods to smaller heatmap windows", () => {
    expect(getActivityHeatmapPeriodWeeks({ kind: "days", days: 4 })).toBe(12);
    expect(getActivityHeatmapPeriodWeeks({ kind: "weeks", weeks: 52 })).toBe(
      52,
    );
  });
});

describe("getCalendarMonthDays", () => {
  it("returns a 6-week grid", () => {
    expect(getCalendarMonthDays(2026, 1)).toHaveLength(42);
  });
});

describe("normalizeDashboardPeriodDays", () => {
  it("clamps custom day counts", () => {
    expect(normalizeDashboardPeriodDays(0)).toBe(1);
    expect(normalizeDashboardPeriodDays(999)).toBe(365);
  });
});

describe("parseDashboardPeriodDaysInput", () => {
  it("accepts valid day counts", () => {
    expect(parseDashboardPeriodDaysInput("4")).toBe(4);
    expect(parseDashboardPeriodDaysInput("365")).toBe(365);
  });

  it("rejects invalid day counts", () => {
    expect(parseDashboardPeriodDaysInput("")).toBeNull();
    expect(parseDashboardPeriodDaysInput("abc")).toBeNull();
    expect(parseDashboardPeriodDaysInput("0")).toBeNull();
    expect(parseDashboardPeriodDaysInput("366")).toBeNull();
  });
});

describe("dashboard period presets", () => {
  it("matches known preset periods", () => {
    expect(matchesDashboardPeriodPreset({ kind: "days", days: 7 })?.label).toBe(
      "7d",
    );
    expect(matchesDashboardPeriodPreset({ kind: "days", days: 4 })).toBeNull();
  });

  it("detects custom periods", () => {
    expect(isDashboardPeriodCustom({ kind: "all" })).toBe(false);
    expect(isDashboardPeriodCustom({ kind: "days", days: 7 })).toBe(false);
    expect(isDashboardPeriodCustom({ kind: "days", days: 4 })).toBe(true);
    expect(
      isDashboardPeriodCustom({
        kind: "range",
        start: "2026-01-01",
        end: "2026-01-10",
      }),
    ).toBe(true);
  });
});

describe("getDashboardPeriodStartKey", () => {
  it("returns a date key N weeks before the reference date", () => {
    expect(
      getDashboardPeriodStartKey(
        { kind: "weeks", weeks: 12 },
        new Date("2026-02-15"),
      ),
    ).toBe("2025-11-23");
  });
});
