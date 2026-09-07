import { describe, expect, it } from "vitest";

import {
  countApplicationsByStatus,
  getBoardColumnOrder,
  normalizeStatus,
  sortStatuses,
} from "~/lib/career-ops/status-meta";

describe("normalizeStatus", () => {
  it("trims whitespace", () => {
    expect(normalizeStatus(" Applied ")).toBe("Applied");
  });

  it("collapses dated applied statuses to the base status", () => {
    expect(normalizeStatus("Applied 2026-09-07")).toBe("Applied");
    expect(normalizeStatus("Evaluated 2025-01-01")).toBe("Evaluated");
  });

  it("preserves unknown statuses with date-like suffixes", () => {
    expect(normalizeStatus("Phone Screen 2026-09-07")).toBe(
      "Phone Screen 2026-09-07",
    );
  });
});

describe("countApplicationsByStatus", () => {
  it("groups dated statuses under their base status", () => {
    expect(
      countApplicationsByStatus([
        { status: "Applied" },
        { status: "Applied 2026-09-07" },
        { status: "Rejected" },
      ]),
    ).toEqual({
      Applied: 2,
      Rejected: 1,
    });
  });
});

describe("sortStatuses", () => {
  it("orders known statuses by pipeline progression", () => {
    expect(
      sortStatuses({
        Rejected: 2,
        Applied: 5,
        Evaluated: 3,
        Interview: 1,
      }),
    ).toEqual(["Evaluated", "Applied", "Interview", "Rejected"]);
  });

  it("appends unknown statuses alphabetically after known ones", () => {
    expect(
      sortStatuses({
        "Phone Screen": 1,
        Applied: 2,
        Evaluated: 1,
      }),
    ).toEqual(["Evaluated", "Applied", "Phone Screen"]);
  });
});

describe("getBoardColumnOrder", () => {
  it("matches pipeline order for board columns", () => {
    expect(
      getBoardColumnOrder({
        Offer: 1,
        Responded: 2,
        Evaluated: 4,
        Discarded: 1,
      }),
    ).toEqual(["Evaluated", "Responded", "Offer", "Discarded"]);
  });
});
