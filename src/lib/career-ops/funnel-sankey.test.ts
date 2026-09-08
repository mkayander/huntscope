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
    via: "",
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

  it("follows scan → evaluation → apply chronology", () => {
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
    expect(data?.nodes[0]?.label).toBe("Scanned");
    expect(
      validateFunnelSankeyFlow(data?.links ?? [], applications.length),
    ).toBe(true);

    const scannedLinks =
      data?.links.filter((link) => link.source === "scanned") ?? [];
    expect(scannedLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ target: "skip", value: 1 }),
        expect.objectContaining({ target: "evaluation-flow", value: 8 }),
      ]),
    );

    const evaluationLinks =
      data?.links.filter((link) => link.source === "evaluation-flow") ?? [];
    expect(evaluationLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ target: "to-apply", value: 1 }),
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
        (link) => link.source === "scanned" && link.target === "other",
      ),
    ).toBe(false);
  });

  it("uses distinct labels for flow nodes and terminal outcomes", () => {
    const applications = [
      createApplication(1, "Evaluated"),
      createApplication(2, "Applied"),
      createApplication(3, "Responded"),
      createApplication(4, "Interview"),
    ];

    const data = buildFunnelSankeyData(applications);
    const labels = new Map(data?.nodes.map((node) => [node.id, node.label]));

    expect(labels.get("evaluation-flow")).toBe("Evaluation");
    expect(labels.get("to-apply")).toBe("To apply");
    expect(labels.get("applied-flow")).toBe("Applied");
    expect(labels.get("applied")).toBe("Awaiting response");
    expect(labels.get("responded-flow")).toBe("Responded");
    expect(labels.get("responded")).toBe("Active");
    expect(labels.get("interview-flow")).toBe("Interview");
    expect(labels.get("interview")).toBe("In progress");
  });

  it("supports a single skipped job", () => {
    const applications = [createApplication(1, "SKIP")];
    const data = buildFunnelSankeyData(applications);

    expect(data).not.toBeNull();
    expect(data?.links).toEqual([
      expect.objectContaining({
        source: "scanned",
        target: "skip",
        value: 1,
      }),
    ]);
  });

  it("supports a single job waiting to apply after evaluation", () => {
    const applications = [createApplication(1, "Evaluated")];
    const data = buildFunnelSankeyData(applications);

    expect(data).not.toBeNull();
    expect(data?.links).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: "scanned",
          target: "evaluation-flow",
          value: 1,
        }),
        expect.objectContaining({
          source: "evaluation-flow",
          target: "to-apply",
          value: 1,
        }),
      ]),
    );
  });
});

describe("validateFunnelSankeyFlow", () => {
  it("returns false when flow is unbalanced", () => {
    expect(
      validateFunnelSankeyFlow(
        [
          {
            source: "scanned",
            target: "skip",
            value: 1,
            color: "#fff",
          },
          {
            source: "scanned",
            target: "evaluation-flow",
            value: 2,
            color: "#fff",
          },
        ],
        2,
      ),
    ).toBe(false);
  });
});
