import { describe, expect, it } from "vitest";

import {
  applicationHasReport,
  getApplicationReportRef,
  getEffectiveReportValue,
  inferReportFileForApplication,
} from "~/lib/career-ops/application-reports";
import type { ApplicationEntry, RepoDataFile } from "~/lib/career-ops/types";

const application: ApplicationEntry = {
  num: 2,
  date: "2026-02-03",
  company: "Example Inc",
  role: "Platform Engineer",
  score: "3.8",
  status: "Interview",
  pdf: "",
  report: "",
  notes: "",
};

const reportFiles: RepoDataFile[] = [
  {
    path: "reports/001-acme-2026-01-15.md",
    name: "001-acme-2026-01-15.md",
    type: "file",
  },
  {
    path: "reports/002-extended-demo.md",
    name: "002-extended-demo.md",
    type: "file",
  },
];

describe("inferReportFileForApplication", () => {
  it("matches report files by zero-padded application number prefix", () => {
    expect(inferReportFileForApplication(application, reportFiles)?.path).toBe(
      "reports/002-extended-demo.md",
    );
  });
});

describe("getEffectiveReportValue", () => {
  it("returns the resolved repo path for linked reports", () => {
    expect(
      getEffectiveReportValue(
        {
          ...application,
          report: "[report](reports/002-example-2026-02-03.md)",
        },
        reportFiles,
      ),
    ).toBe("reports/002-example-2026-02-03.md");
  });

  it("returns null for linked values that do not resolve to a path", () => {
    expect(
      getEffectiveReportValue(
        {
          ...application,
          report: "pending",
        },
        reportFiles,
      ),
    ).toBeNull();
  });

  it("falls back to inferred report files when the column is empty", () => {
    expect(getEffectiveReportValue(application, reportFiles)).toBe(
      "reports/002-extended-demo.md",
    );
  });
});

describe("applicationHasReport", () => {
  it("returns true for linked and inferred reports", () => {
    expect(applicationHasReport(application, reportFiles)).toBe(true);
    expect(
      applicationHasReport(
        {
          ...application,
          num: 99,
        },
        reportFiles,
      ),
    ).toBe(false);
  });
});

describe("getApplicationReportRef", () => {
  it("returns metadata for inferred reports", () => {
    expect(getApplicationReportRef(application, reportFiles)).toEqual({
      value: "reports/002-extended-demo.md",
      path: "reports/002-extended-demo.md",
      label: "002-extended-demo",
      source: "inferred",
    });
  });
});
