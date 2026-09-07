import { describe, expect, it } from "vitest";

import { buildFunnelSankeyData } from "~/lib/career-ops/funnel-sankey";
import type { ApplicationEntry } from "~/lib/career-ops/types";

function createApplication(num: number, status: string): ApplicationEntry {
  return {
    num,
    date: "2026-01-15",
    company: `Company ${num}`,
    role: "Engineer",
    score: "4.0",
    status,
    pdf: "",
    report: "",
    notes: "",
  };
}

describe("buildFunnelSankeyData", () => {
  it("returns null for an empty application list", () => {
    expect(buildFunnelSankeyData([])).toBeNull();
  });

  it("builds a sequential funnel from evaluations through offer", () => {
    const applications = [
      createApplication(1, "Evaluated"),
      createApplication(2, "Applied"),
      createApplication(3, "Applied"),
      createApplication(4, "Rejected"),
      createApplication(5, "Responded"),
      createApplication(6, "Interview"),
      createApplication(7, "Offer"),
      createApplication(8, "Discarded"),
      createApplication(9, "SKIP"),
    ];

    const data = buildFunnelSankeyData(applications);

    expect(data).not.toBeNull();
    expect(data?.nodes[0]?.label).toBe("Evaluations");

    const evaluationLinks =
      data?.links.filter((link) => link.source === "evaluations") ?? [];
    expect(evaluationLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ target: "evaluated", value: 1 }),
        expect.objectContaining({ target: "skip", value: 1 }),
        expect.objectContaining({ target: "applied-flow", value: 7 }),
      ]),
    );

    const appliedLinks =
      data?.links.filter((link) => link.source === "applied-flow") ?? [];
    expect(appliedLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ target: "applied", value: 2 }),
        expect.objectContaining({ target: "rejected", value: 1 }),
        expect.objectContaining({ target: "discarded", value: 1 }),
        expect.objectContaining({ target: "responded-flow", value: 3 }),
      ]),
    );

    const respondedLinks =
      data?.links.filter((link) => link.source === "responded-flow") ?? [];
    expect(respondedLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ target: "responded", value: 1 }),
        expect.objectContaining({ target: "interview-flow", value: 2 }),
      ]),
    );

    const interviewLinks =
      data?.links.filter((link) => link.source === "interview-flow") ?? [];
    expect(interviewLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ target: "interview", value: 1 }),
        expect.objectContaining({ target: "offer", value: 1 }),
      ]),
    );
  });
});
