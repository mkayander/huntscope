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
    pdf: "[cv](output/acme.pdf)",
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

  it("sorts scored entries high to low with unscored last", () => {
    const entries: ApplicationEntry[] = [
      { ...applications[0]!, score: "N/A" },
      { ...applications[1]!, score: "4.5" },
      { ...applications[2]!, score: "2.0" },
    ];

    expect(
      sortApplications(entries, "score", "desc").map((entry) => entry.score),
    ).toEqual(["4.5", "2.0", "N/A"]);
  });

  it("sorts scored entries low to high with unscored last", () => {
    const entries: ApplicationEntry[] = [
      { ...applications[0]!, score: "—" },
      { ...applications[1]!, score: "4.5" },
      { ...applications[2]!, score: "2.0" },
    ];

    expect(
      sortApplications(entries, "score", "asc").map((entry) => entry.score),
    ).toEqual(["2.0", "4.5", "—"]);
  });
});

describe("queryTrackerApplications", () => {
  it("sorts applications using the tracker query", () => {
    const results = queryTrackerApplications(applications, {
      ...DEFAULT_TRACKER_TABLE_QUERY,
      sortColumn: "company",
      sortDirection: "asc",
    });

    expect(results.map((entry) => entry.company)).toEqual([
      "Acme",
      "Beta",
      "Gamma",
    ]);
  });

  it("defaults to score descending", () => {
    const results = queryTrackerApplications(
      applications,
      DEFAULT_TRACKER_TABLE_QUERY,
    );

    expect(results.map((entry) => entry.score)).toEqual(["4.5", "3.5", "2.0"]);
  });
});
