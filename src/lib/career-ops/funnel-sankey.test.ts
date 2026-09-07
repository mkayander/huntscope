import { describe, expect, it } from "vitest";

import {
  buildFunnelSankeyData,
  validateFunnelSankeyFlow,
} from "~/lib/career-ops/funnel-sankey";
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
    expect(
      validateFunnelSankeyFlow(data?.links ?? [], applications.length),
    ).toBe(true);

    const evaluationLinks =
      data?.links.filter((link) => link.source === "evaluations") ?? [];
    expect(evaluationLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ target: "evaluated", value: 1 }),
        expect.objectContaining({ target: "skip", value: 1 }),
        expect.objectContaining({ target: "discarded", value: 1 }),
        expect.objectContaining({ target: "applied-flow", value: 6 }),
      ]),
    );

    const appliedLinks =
      data?.links.filter((link) => link.source === "applied-flow") ?? [];
    expect(appliedLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ target: "applied", value: 2 }),
        expect.objectContaining({ target: "rejected", value: 1 }),
        expect.objectContaining({ target: "responded-flow", value: 3 }),
      ]),
    );
    expect(appliedLinks.some((link) => link.target === "discarded")).toBe(
      false,
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

  it("branches unknown statuses from the applied stage", () => {
    const applications = [
      createApplication(1, "Phone Screen"),
      createApplication(2, "Applied"),
    ];

    const data = buildFunnelSankeyData(applications);

    expect(data).not.toBeNull();
    expect(
      data?.links.some(
        (link) => link.source === "applied-flow" && link.target === "other",
      ),
    ).toBe(true);
    expect(
      data?.links.some(
        (link) => link.source === "evaluations" && link.target === "other",
      ),
    ).toBe(false);
  });

  it("uses distinct labels for flow nodes and terminal outcomes", () => {
    const applications = [
      createApplication(1, "Applied"),
      createApplication(2, "Responded"),
      createApplication(3, "Interview"),
    ];

    const data = buildFunnelSankeyData(applications);
    const labels = new Map(data?.nodes.map((node) => [node.id, node.label]));

    expect(labels.get("applied-flow")).toBe("Applied");
    expect(labels.get("applied")).toBe("Awaiting response");
    expect(labels.get("responded-flow")).toBe("Responded");
    expect(labels.get("responded")).toBe("Active");
    expect(labels.get("interview-flow")).toBe("Interview");
    expect(labels.get("interview")).toBe("In progress");
  });

  it("supports a single-status dataset", () => {
    const applications = [createApplication(1, "Evaluated")];
    const data = buildFunnelSankeyData(applications);

    expect(data).not.toBeNull();
    expect(data?.links).toEqual([
      expect.objectContaining({
        source: "evaluations",
        target: "evaluated",
        value: 1,
      }),
    ]);
  });
});

describe("validateFunnelSankeyFlow", () => {
  it("returns false when flow is unbalanced", () => {
    expect(
      validateFunnelSankeyFlow(
        [
          {
            source: "evaluations",
            target: "evaluated",
            value: 1,
            color: "#fff",
          },
          {
            source: "evaluations",
            target: "applied-flow",
            value: 2,
            color: "#fff",
          },
        ],
        2,
      ),
    ).toBe(false);
  });
});
