import { describe, expect, it } from "vitest";

import { normalizeRepoRelativePath } from "~/lib/career-ops/repo-paths";

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
