import { describe, expect, it } from "vitest";

import {
  findFilesByCompanyTokens,
  getCompanySearchTokens,
  inferApplicationForFile,
  inferFileForApplication,
} from "~/lib/career-ops/application-artifact-inference";
import type { ApplicationEntry, RepoDataFile } from "~/lib/career-ops/types";

const acmeApplication: ApplicationEntry = {
  num: 1,
  date: "2026-01-15",
  company: "Acme Corp",
  via: "",
  role: "Backend Engineer",
  score: "4.2",
  status: "Applied",
  pdf: "",
  report: "",
  notes: "",
};

const exampleApplication: ApplicationEntry = {
  num: 2,
  date: "2026-02-03",
  company: "The Example Inc",
  via: "",
  role: "Platform Engineer",
  score: "3.8",
  status: "Interview",
  pdf: "",
  report: "",
  notes: "",
};

const outputFiles: RepoDataFile[] = [
  { path: "output/acme.pdf", name: "acme.pdf", type: "file" },
  { path: "output/example.pdf", name: "example.pdf", type: "file" },
  { path: "output/002-tailored.pdf", name: "002-tailored.pdf", type: "file" },
  {
    path: "output/acme-example.pdf",
    name: "acme-example.pdf",
    type: "file",
  },
];

describe("getCompanySearchTokens", () => {
  it("skips stop-words such as the and inc", () => {
    expect(getCompanySearchTokens("The Example Inc")).toEqual(["example"]);
    expect(getCompanySearchTokens("Acme Corp")).toEqual(["acme"]);
  });
});

describe("inferFileForApplication", () => {
  it("prefers numbered prefixes over company token matches", () => {
    expect(
      inferFileForApplication(exampleApplication, outputFiles, ".pdf")?.path,
    ).toBe("output/002-tailored.pdf");
  });

  it("matches company tokens after skipping stop-words", () => {
    expect(
      inferFileForApplication(
        { ...exampleApplication, num: 9 },
        [{ path: "output/example.pdf", name: "example.pdf", type: "file" }],
        ".pdf",
      )?.path,
    ).toBe("output/example.pdf");
  });

  it("returns null when multiple files tie on company token strength", () => {
    expect(
      inferFileForApplication(acmeApplication, outputFiles, ".pdf"),
    ).toBeNull();
  });
});

describe("findFilesByCompanyTokens", () => {
  it("returns a single unambiguous company match", () => {
    expect(
      findFilesByCompanyTokens(
        [{ path: "output/example.pdf", name: "example.pdf", type: "file" }],
        exampleApplication,
      ),
    ).toHaveLength(1);
  });
});

describe("inferApplicationForFile", () => {
  it("returns null for ambiguous reverse lookups", () => {
    expect(
      inferApplicationForFile(
        {
          path: "output/tech-shared.pdf",
          name: "tech-shared.pdf",
          type: "file",
        },
        [
          { ...acmeApplication, company: "Tech Alpha" },
          { ...exampleApplication, num: 3, company: "Tech Beta" },
        ],
      ),
    ).toBeNull();
  });

  it("links a file to the strongest single-token match", () => {
    expect(
      inferApplicationForFile(
        { path: "output/acme.pdf", name: "acme.pdf", type: "file" },
        [acmeApplication, exampleApplication],
      )?.company,
    ).toBe("Acme Corp");
  });
});
