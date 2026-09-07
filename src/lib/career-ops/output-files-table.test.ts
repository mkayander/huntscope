import { describe, expect, it } from "vitest";

import {
  buildOutputFileRows,
  DEFAULT_OUTPUT_FILES_TABLE_QUERY,
  inferApplicationForOutputFile,
  queryOutputFileRows,
} from "~/lib/career-ops/output-files-table";
import type { ApplicationEntry, RepoDataFile } from "~/lib/career-ops/types";

const applications: ApplicationEntry[] = [
  {
    num: 1,
    date: "2026-01-15",
    company: "Acme Corp",
    role: "Backend Engineer",
    score: "4.2",
    status: "Applied",
    pdf: "[cv](output/acme.pdf)",
    report: "",
    notes: "",
  },
  {
    num: 2,
    date: "2026-02-03",
    company: "Example Inc",
    role: "Platform Engineer",
    score: "3.8",
    status: "Interview",
    pdf: "",
    report: "",
    notes: "",
  },
];

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
    path: "output/orphan-2026-03-01.pdf",
    name: "orphan-2026-03-01.pdf",
    type: "file",
  },
];

describe("buildOutputFileRows", () => {
  it("links applications by pdf path and infers remaining files", () => {
    const rows = buildOutputFileRows(outputFiles, applications);

    expect(
      rows.find((row) => row.name === "acme.pdf")?.linkedApplication,
    ).toMatchObject({ company: "Acme Corp" });
    expect(
      rows.find((row) => row.name === "example.pdf")?.linkedApplication,
    ).toMatchObject({ company: "Example Inc" });
    expect(
      rows.find((row) => row.name === "orphan-2026-03-01.pdf")
        ?.linkedApplication,
    ).toBeNull();
  });
});

describe("inferApplicationForOutputFile", () => {
  it("matches by company token in filename", () => {
    expect(
      inferApplicationForOutputFile(outputFiles[1]!, applications)?.company,
    ).toBe("Example Inc");
  });
});

describe("queryOutputFileRows", () => {
  it("filters by search and linked application presence", () => {
    const rows = buildOutputFileRows(outputFiles, applications);

    const linked = queryOutputFileRows(rows, {
      ...DEFAULT_OUTPUT_FILES_TABLE_QUERY,
      linkedFilters: ["with"],
    });

    expect(linked.map((row) => row.name).sort()).toEqual([
      "acme.pdf",
      "example.pdf",
    ]);

    const orphanSearch = queryOutputFileRows(rows, {
      ...DEFAULT_OUTPUT_FILES_TABLE_QUERY,
      searchQuery: "orphan",
    });

    expect(orphanSearch).toHaveLength(1);
    expect(orphanSearch[0]?.name).toBe("orphan-2026-03-01.pdf");
  });

  it("sorts by date descending by default", () => {
    const rows = buildOutputFileRows(outputFiles, applications);
    const sorted = queryOutputFileRows(rows, DEFAULT_OUTPUT_FILES_TABLE_QUERY);

    expect(sorted.map((row) => row.sortDate)).toEqual([
      "2026-03-01",
      "2026-02-03",
      "2026-01-15",
    ]);
  });
});
