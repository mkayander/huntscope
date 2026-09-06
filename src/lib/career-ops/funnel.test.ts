import { describe, expect, it } from "vitest";

import { computeFunnelMetrics } from "~/lib/career-ops/funnel";
import type { ApplicationEntry } from "~/lib/career-ops/types";

const sampleApplications: ApplicationEntry[] = [
  {
    num: 1,
    date: "2026-01-15",
    company: "Acme",
    role: "Backend",
    score: "4.2",
    status: "Interview",
    pdf: "",
    report: "",
    notes: "",
  },
  {
    num: 2,
    date: "2026-02-01",
    company: "Beta",
    role: "Platform",
    score: "3.1",
    status: "Rejected",
    pdf: "",
    report: "",
    notes: "",
  },
  {
    num: 3,
    date: "2026-02-10",
    company: "Gamma",
    role: "SRE",
    score: "4.8",
    status: "Offer",
    pdf: "",
    report: "",
    notes: "",
  },
];

describe("computeFunnelMetrics", () => {
  it("computes funnel counts and rates", () => {
    const metrics = computeFunnelMetrics(sampleApplications);

    expect(metrics.total).toBe(3);
    expect(metrics.interviewCount).toBe(1);
    expect(metrics.offerCount).toBe(1);
    expect(metrics.rejectedCount).toBe(1);
    expect(metrics.rejectionByScoreBand.medium).toBe(1);
    expect(metrics.averageScoreInterview).toBe("4.2");
  });
});
