import { describe, expect, it } from "vitest";

import {
  getBoardColumnOrder,
  sortStatuses,
} from "~/lib/career-ops/status-meta";

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
