import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  applicationHasReport,
  getApplicationReportRef,
  getEffectiveReportValue,
  inferReportFileForApplication,
  resolveApplicationReportFetchRef,
} from "~/lib/career-ops/application-reports";
import { parseApplicationsMarkdown } from "~/lib/career-ops/parse-applications";
import type { ApplicationEntry, RepoDataFile } from "~/lib/career-ops/types";

const application: ApplicationEntry = {
  num: 2,
  date: "2026-02-03",
  company: "Example Inc",
  via: "",
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
  it("returns the linked path when that report exists in the repo", () => {
    expect(
      getEffectiveReportValue(
        {
          ...application,
          num: 1,
          report: "[report](reports/001-acme-2026-01-15.md)",
        },
        reportFiles,
      ),
    ).toBe("reports/001-acme-2026-01-15.md");
  });

  it("falls back to inferred reports when the linked path is missing", () => {
    expect(
      resolveApplicationReportFetchRef(
        {
          ...application,
          report: "[report](reports/002-example-2026-02-03.md)",
        },
        reportFiles,
      )?.path,
    ).toBe("reports/002-extended-demo.md");
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

describe("career-ops fixture reports", () => {
  const fixtureRoot = join(process.cwd(), "fixtures/career-ops-repo");
  const reportFilesFromFixture: RepoDataFile[] = [
    {
      path: "reports/001-acme-2026-06-20.md",
      name: "001-acme-2026-06-20.md",
      type: "file",
    },
    {
      path: "reports/002-globex-2026-06-25.md",
      name: "002-globex-2026-06-25.md",
      type: "file",
    },
  ];

  it("resolves ../reports links from career-ops applications tables", () => {
    const applications = parseApplicationsMarkdown(
      readFileSync(join(fixtureRoot, "data/applications.md"), "utf8"),
    );
    const acme = applications.find((entry) => entry.company === "Acme");

    expect(acme?.role).toBe("Senior Platform Engineer");
    expect(getApplicationReportRef(acme!, reportFilesFromFixture)).toEqual({
      value: "[1](../reports/001-acme-2026-06-20.md)",
      path: "reports/001-acme-2026-06-20.md",
      label: "1",
      source: "linked",
    });
  });

  it("matches report links against prefixed external-data paths", () => {
    const applications = parseApplicationsMarkdown(
      readFileSync(join(fixtureRoot, "data/applications.md"), "utf8"),
    );
    const acme = applications.find((entry) => entry.company === "Acme");
    const externalReportFiles: RepoDataFile[] = [
      {
        path: "external-data/reports/001-acme-2026-06-20.md",
        name: "001-acme-2026-06-20.md",
        type: "file",
      },
    ];

    expect(getApplicationReportRef(acme!, externalReportFiles)?.path).toBe(
      "external-data/reports/001-acme-2026-06-20.md",
    );
  });
});
