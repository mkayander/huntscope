import { describe, expect, it } from "vitest";

import {
  DEFAULT_TRACKER_TABLE_QUERY,
  queryTrackerApplications,
  sortApplications,
} from "~/lib/career-ops/tracker-table";
import type { ApplicationEntry } from "~/lib/career-ops/types";

const applications: ApplicationEntry[] = [
  {
    num: 1,
    date: "2025-01-01",
    company: "Acme",
    role: "Engineer",
    score: "4.5",
    status: "Applied",
    pdf: "",
    report: "reports/acme.md",
    notes: "",
  },
  {
    num: 2,
    date: "2025-01-02",
    company: "Beta",
    role: "Designer",
    score: "2.0",
    status: "Rejected",
    pdf: "",
    report: "",
    notes: "",
  },
  {
    num: 3,
    date: "2025-01-03",
    company: "Gamma",
    role: "PM",
    score: "3.5",
    status: "Interview",
    pdf: "",
    report: "reports/gamma.md",
    notes: "",
  },
];

describe("sortApplications", () => {
  it("sorts by numeric column in descending order", () => {
    const sorted = sortApplications(applications, "num", "desc");

    expect(sorted.map((entry) => entry.num)).toEqual([3, 2, 1]);
  });
});

describe("queryTrackerApplications", () => {
  it("filters by status, score band, and report presence", () => {
    const results = queryTrackerApplications(applications, {
      ...DEFAULT_TRACKER_TABLE_QUERY,
      statusFilter: "Applied",
      scoreFilter: "high",
      reportFilter: "with",
    });

    expect(results).toHaveLength(1);
    expect(results[0]?.company).toBe("Acme");
  });

  it("searches across company and role fields", () => {
    const results = queryTrackerApplications(applications, {
      ...DEFAULT_TRACKER_TABLE_QUERY,
      searchQuery: "designer",
    });

    expect(results).toHaveLength(1);
    expect(results[0]?.company).toBe("Beta");
  });
});
