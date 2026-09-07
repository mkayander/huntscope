import { describe, expect, it } from "vitest";

import {
  applicationHasPdf,
  getApplicationPdfRef,
  getEffectivePdfValue,
  inferOutputFileForApplication,
} from "~/lib/career-ops/application-pdfs";
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

const outputFiles: RepoDataFile[] = [
  {
    path: "output/acme.pdf",
    name: "acme.pdf",
    type: "file",
  },
  {
    path: "output/example.pdf",
    name: "example.pdf",
    type: "file",
  },
  {
    path: "output/002-tailored.pdf",
    name: "002-tailored.pdf",
    type: "file",
  },
];

describe("inferOutputFileForApplication", () => {
  it("matches output files by zero-padded application number prefix", () => {
    expect(inferOutputFileForApplication(application, outputFiles)?.path).toBe(
      "output/002-tailored.pdf",
    );
  });

  it("matches output files by company token in filename", () => {
    expect(
      inferOutputFileForApplication(
        {
          ...application,
          num: 9,
        },
        outputFiles,
      )?.path,
    ).toBe("output/example.pdf");
  });
});

describe("getEffectivePdfValue", () => {
  it("returns the resolved repo path for linked pdfs", () => {
    expect(
      getEffectivePdfValue(
        {
          ...application,
          pdf: "[cv](output/example.pdf)",
        },
        outputFiles,
      ),
    ).toBe("output/example.pdf");
  });

  it("returns null for linked values that do not resolve to a path", () => {
    expect(
      getEffectivePdfValue(
        {
          ...application,
          pdf: "pending",
        },
        outputFiles,
      ),
    ).toBeNull();
  });

  it("falls back to inferred output files when the column is empty", () => {
    expect(getEffectivePdfValue(application, outputFiles)).toBe(
      "output/002-tailored.pdf",
    );
  });
});

describe("applicationHasPdf", () => {
  it("returns true for linked and inferred pdfs", () => {
    expect(applicationHasPdf(application, outputFiles)).toBe(true);
    expect(
      applicationHasPdf(
        {
          ...application,
          num: 99,
          company: "Unrelated Co",
        },
        outputFiles,
      ),
    ).toBe(false);
  });

  it("returns false for non-resolvable linked values", () => {
    expect(
      applicationHasPdf(
        {
          ...application,
          pdf: "TBD",
        },
        outputFiles,
      ),
    ).toBe(false);
  });
});

describe("getApplicationPdfRef", () => {
  it("returns metadata for linked pdfs", () => {
    expect(
      getApplicationPdfRef(
        {
          ...application,
          num: 1,
          pdf: "[cv](output/acme.pdf)",
        },
        outputFiles,
      ),
    ).toEqual({
      value: "[cv](output/acme.pdf)",
      path: "output/acme.pdf",
      label: "cv",
      source: "linked",
    });
  });

  it("returns metadata for inferred pdfs", () => {
    expect(getApplicationPdfRef(application, outputFiles)).toEqual({
      value: "output/002-tailored.pdf",
      path: "output/002-tailored.pdf",
      label: "002-tailored",
      source: "inferred",
    });
  });
});
