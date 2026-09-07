import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  extractHttpUrl,
  getInlineJobPostingUrl,
  getRoleDisplayLabel,
  resolveJobPostingUrl,
} from "~/lib/career-ops/application-job-posting";
import { getApplicationReportRef } from "~/lib/career-ops/application-reports";
import { parseApplicationsMarkdown } from "~/lib/career-ops/parse-applications";
import { parseReportMarkdown } from "~/lib/career-ops/parse-report";
import type { ApplicationEntry, RepoDataFile } from "~/lib/career-ops/types";

const application: ApplicationEntry = {
  num: 1,
  date: "2026-01-15",
  company: "Acme Corp",
  role: "Backend Engineer",
  score: "4.2",
  status: "Applied",
  pdf: "",
  report: "reports/001-acme-2026-01-15.md",
  notes: "",
};

const reportFiles: RepoDataFile[] = [
  {
    path: "reports/001-acme-2026-01-15.md",
    name: "001-acme-2026-01-15.md",
    type: "file",
  },
];

describe("getRoleDisplayLabel", () => {
  it("returns the markdown label when the role is a link", () => {
    expect(
      getRoleDisplayLabel(
        "[Backend Engineer](https://example.com/jobs/acme-backend)",
      ),
    ).toBe("Backend Engineer");
  });

  it("returns the raw role when it is plain text", () => {
    expect(getRoleDisplayLabel("Backend Engineer")).toBe("Backend Engineer");
  });
});

describe("getInlineJobPostingUrl", () => {
  it("reads an http link from the role column", () => {
    expect(
      getInlineJobPostingUrl({
        ...application,
        role: "[Backend Engineer](https://example.com/jobs/acme-backend)",
      }),
    ).toBe("https://example.com/jobs/acme-backend");
  });

  it("reads a bare url from the notes column", () => {
    expect(
      getInlineJobPostingUrl({
        ...application,
        notes: "https://example.com/jobs/acme-backend",
      }),
    ).toBe("https://example.com/jobs/acme-backend");
  });
});

describe("extractHttpUrl", () => {
  it("extracts the first http url from mixed notes text", () => {
    expect(
      extractHttpUrl(
        "Strong fit — https://example.com/jobs/acme-backend follow up",
      ),
    ).toBe("https://example.com/jobs/acme-backend");
  });
});

describe("resolveJobPostingUrl", () => {
  it("prefers inline urls over report metadata", () => {
    expect(
      resolveJobPostingUrl(
        {
          ...application,
          notes: "https://example.com/jobs/inline",
        },
        "https://example.com/jobs/report",
      ),
    ).toBe("https://example.com/jobs/inline");
  });

  it("falls back to the report source url", () => {
    expect(
      resolveJobPostingUrl(
        application,
        "https://example.com/jobs/acme-backend",
      ),
    ).toBe("https://example.com/jobs/acme-backend");
  });

  it("returns null when no url is available", () => {
    expect(resolveJobPostingUrl(application, null)).toBeNull();
  });
});

describe("fixture report metadata", () => {
  it("resolves posting urls from linked evaluation reports", () => {
    const applications = parseApplicationsMarkdown(
      readFileSync(
        join(process.cwd(), "fixtures/sample-career-repo/data/applications.md"),
        "utf8",
      ),
    );
    const acme = applications.find((entry) => entry.company === "Acme Corp");

    expect(acme).toBeDefined();

    const reportRef = getApplicationReportRef(acme!, reportFiles);
    const reportContent = readFileSync(
      join(process.cwd(), "fixtures/sample-career-repo", reportRef!.path),
      "utf8",
    );

    expect(
      resolveJobPostingUrl(acme!, parseReportMarkdown(reportContent).sourceUrl),
    ).toBe("https://example.com/jobs/acme-backend");
    expect(getRoleDisplayLabel(acme!.role)).toBe("Backend Engineer");
  });
});
