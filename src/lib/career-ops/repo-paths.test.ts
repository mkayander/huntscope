import { describe, expect, it } from "vitest";

import {
  matchRepoFilePath,
  normalizeRepoRelativePath,
} from "~/lib/career-ops/repo-paths";

describe("normalizeRepoRelativePath", () => {
  it("strips leading ./ segments", () => {
    expect(normalizeRepoRelativePath("./reports/acme.md")).toBe(
      "reports/acme.md",
    );
  });

  it("strips leading ../ segments used by career-ops report links", () => {
    expect(normalizeRepoRelativePath("../reports/001-acme-2026-06-20.md")).toBe(
      "reports/001-acme-2026-06-20.md",
    );
  });

  it("returns an empty string for blank input", () => {
    expect(normalizeRepoRelativePath("   ")).toBe("");
  });
});

describe("matchRepoFilePath", () => {
  const reportFiles = [
    {
      path: "external-data/reports/001-acme-2026-06-20.md",
      name: "001-acme-2026-06-20.md",
      type: "file" as const,
    },
  ];

  it("returns an exact match when available", () => {
    expect(matchRepoFilePath("reports/acme.md", reportFiles)).toBe(
      "reports/acme.md",
    );
  });

  it("matches normalized paths against prefixed repo file paths", () => {
    expect(
      matchRepoFilePath("reports/001-acme-2026-06-20.md", reportFiles),
    ).toBe("external-data/reports/001-acme-2026-06-20.md");
  });
});
