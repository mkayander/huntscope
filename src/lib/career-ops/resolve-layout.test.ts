import { describe, expect, it } from "vitest";

import {
  deriveDataDirFromTrackerPath,
  parseDataRootMarker,
  resolveCareerOpsLayout,
} from "~/lib/career-ops/resolve-layout";

describe("parseDataRootMarker", () => {
  it("reads the first non-empty line and normalizes relative paths", () => {
    expect(parseDataRootMarker("./external-data\nignored")).toBe(
      "external-data",
    );
  });

  it("strips trailing slashes", () => {
    expect(parseDataRootMarker("external-data/")).toBe("external-data");
  });
});

describe("deriveDataDirFromTrackerPath", () => {
  it("returns the data directory for standard tracker paths", () => {
    expect(deriveDataDirFromTrackerPath("data/applications.md")).toBe("data");
    expect(deriveDataDirFromTrackerPath("external/data/applications.md")).toBe(
      "external/data",
    );
  });

  it("returns the data root for root-level tracker files", () => {
    expect(deriveDataDirFromTrackerPath("applications.md")).toBe("");
    expect(deriveDataDirFromTrackerPath("external/applications.md")).toBe(
      "external",
    );
  });
});

describe("resolveCareerOpsLayout", () => {
  it("prefers data/applications.md over root-level applications.md", async () => {
    const files = new Map([
      ["data/applications.md", "# Applications"],
      ["applications.md", "# Legacy"],
    ]);

    const layout = await resolveCareerOpsLayout({
      readFile: async (path) => files.get(path) ?? null,
    });

    expect(layout).toEqual({
      dataRoot: "",
      applicationsPath: "data/applications.md",
      pipelinePath: "data/pipeline.md",
      dataDir: "data",
      reportsDir: "reports",
      outputDir: "output",
    });
  });

  it("falls back to root-level applications.md", async () => {
    const files = new Map([["applications.md", "# Applications"]]);

    const layout = await resolveCareerOpsLayout({
      readFile: async (path) => files.get(path) ?? null,
    });

    expect(layout?.applicationsPath).toBe("applications.md");
    expect(layout?.dataDir).toBe("");
  });

  it("resolves paths relative to a .career-ops-data marker", async () => {
    const files = new Map([
      [".career-ops-data", "external-data"],
      ["external-data/data/applications.md", "# Applications"],
      ["external-data/data/pipeline.md", "## Pending"],
    ]);

    const layout = await resolveCareerOpsLayout({
      readFile: async (path) => files.get(path) ?? null,
    });

    expect(layout).toEqual({
      dataRoot: "external-data",
      applicationsPath: "external-data/data/applications.md",
      pipelinePath: "external-data/data/pipeline.md",
      dataDir: "external-data/data",
      reportsDir: "external-data/reports",
      outputDir: "external-data/output",
    });
  });

  it("detects layout from a non-empty data directory listing", async () => {
    const layout = await resolveCareerOpsLayout({
      readFile: async () => null,
      listDirectory: async () => [
        { path: "data/pipeline.md", name: "pipeline.md", type: "file" },
      ],
    });

    expect(layout?.dataDir).toBe("data");
    expect(layout?.applicationsPath).toBe("data/applications.md");
  });

  it("returns null when no career-ops files are present", async () => {
    const layout = await resolveCareerOpsLayout({
      readFile: async () => null,
      listDirectory: async () => [],
    });

    expect(layout).toBeNull();
  });
});
