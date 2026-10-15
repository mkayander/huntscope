import { describe, expect, it } from "vitest";

import {
  deriveDataDirFromTrackerPath,
  parseDataRootMarker,
  resolveCareerOpsLayout,
  resolveDataDir,
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

  it("rejects parent traversal segments in marker paths", () => {
    expect(parseDataRootMarker("../outside")).toBe("");
    expect(parseDataRootMarker("external/../outside")).toBe("");
    expect(parseDataRootMarker("/absolute/path")).toBe("");
  });

  it("allows directory names that contain double dots", () => {
    expect(parseDataRootMarker("my..data")).toBe("my..data");
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

describe("resolveDataDir", () => {
  it("prefers data/ when pipeline lives under data/", () => {
    expect(
      resolveDataDir({
        dataDirPath: "data",
        applicationsPath: "applications.md",
        pipelinePath: "data/pipeline.md",
      }),
    ).toBe("data");
  });

  it("falls back to data/ for root-level trackers", () => {
    expect(
      resolveDataDir({
        dataDirPath: "data",
        applicationsPath: "applications.md",
        pipelinePath: null,
      }),
    ).toBe("data");
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

    expect(layout).toMatchObject({
      dataRoot: "",
      applicationsPath: "data/applications.md",
      pipelinePath: "data/pipeline.md",
      applicationsWritePath: "data/applications.md",
      pipelineWritePath: "data/pipeline.md",
      dataDir: "data",
      reportsDir: "reports",
      outputDir: "output",
      applicationsMarkdown: "# Applications",
      pipelineMarkdown: null,
    });
  });

  it("falls back to root-level applications.md", async () => {
    const files = new Map([["applications.md", "# Applications"]]);

    const layout = await resolveCareerOpsLayout({
      readFile: async (path) => files.get(path) ?? null,
    });

    expect(layout?.applicationsPath).toBe("applications.md");
    expect(layout?.dataDir).toBe("data");
    expect(layout?.applicationsMarkdown).toBe("# Applications");
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

    expect(layout).toMatchObject({
      dataRoot: "external-data",
      applicationsPath: "external-data/data/applications.md",
      pipelinePath: "external-data/data/pipeline.md",
      applicationsWritePath: "external-data/data/applications.md",
      pipelineWritePath: "external-data/data/pipeline.md",
      dataDir: "external-data/data",
      reportsDir: "external-data/reports",
      outputDir: "external-data/output",
      applicationsMarkdown: "# Applications",
      pipelineMarkdown: "## Pending",
    });
  });

  it("detects layout from recognizable files in data/", async () => {
    const layout = await resolveCareerOpsLayout({
      readFile: async () => null,
      listDirectory: async () => [
        { path: "data/pipeline.md", name: "pipeline.md", type: "file" },
      ],
    });

    expect(layout?.dataDir).toBe("data");
    expect(layout?.applicationsPath).toBe("data/applications.md");
  });

  it("ignores unrelated files in data/", async () => {
    const layout = await resolveCareerOpsLayout({
      readFile: async () => null,
      listDirectory: async () => [
        { path: "data/readme.txt", name: "readme.txt", type: "file" },
      ],
    });

    expect(layout).toBeNull();
  });

  it("uses the read tracker path for writes", async () => {
    const files = new Map([["applications.md", "# Applications"]]);

    const layout = await resolveCareerOpsLayout({
      readFile: async (path) => files.get(path) ?? null,
    });

    expect(layout?.applicationsPath).toBe("applications.md");
    expect(layout?.applicationsWritePath).toBe("applications.md");
  });

  it("returns null when no career-ops files are present", async () => {
    const layout = await resolveCareerOpsLayout({
      readFile: async () => null,
      listDirectory: async () => [],
    });

    expect(layout).toBeNull();
  });
});
