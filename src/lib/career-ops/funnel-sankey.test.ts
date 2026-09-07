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

  it("builds a balanced funnel graph from status counts", () => {
    const applications = [
      createApplication(1, "Applied"),
      createApplication(2, "Applied"),
      createApplication(3, "Rejected"),
      createApplication(4, "Responded"),
      createApplication(5, "Interview"),
      createApplication(6, "Offer"),
      createApplication(7, "Discarded"),
    ];

    const data = buildFunnelSankeyData(applications);

    expect(data).not.toBeNull();
    expect(data?.nodes[0]?.label).toBe("Applications");

    const rootLinks =
      data?.links.filter((link) => link.source === "applications") ?? [];
    const rootTotal = rootLinks.reduce((sum, link) => sum + link.value, 0);
    expect(rootTotal).toBe(applications.length);

    expect(rootLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ target: "applied", value: 2 }),
        expect.objectContaining({ target: "rejected", value: 1 }),
        expect.objectContaining({ target: "discarded", value: 1 }),
        expect.objectContaining({ target: "in-pipeline", value: 3 }),
      ]),
    );

    const pipelineLinks =
      data?.links.filter((link) => link.source === "in-pipeline") ?? [];
    expect(pipelineLinks).toEqual(
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
