"use client";

import { FileIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { ApplicationDate } from "~/components/application-date";
import { ArtifactLinkButton } from "~/app/_components/artifact-link-button";
import {
  OutputFilesSortableHeader,
  OutputFilesStaticHeader,
  OutputFilesTableToolbar,
} from "~/app/_components/output-files-table-toolbar";
import { GlowPanel } from "~/components/ui/glow-panel";
import { DASHBOARD_SECTION_IDS } from "~/lib/dashboard/sections";
import type { CareerOpsDataSource } from "~/lib/career-ops/data-source";
import {
  buildOutputFileRows,
  DEFAULT_OUTPUT_FILES_TABLE_QUERY,
  queryOutputFileRows,
  type OutputFileSortColumn,
  type OutputFilesTableQuery,
} from "~/lib/career-ops/output-files-table";
import type { ApplicationEntry, RepoDataFile } from "~/lib/career-ops/types";
import { cn } from "~/lib/utils";

const OUTPUT_GRID_COLUMNS =
  "grid-cols-[minmax(10rem,1.4fr)_minmax(6rem,1fr)_minmax(7rem,1.1fr)_6rem_minmax(5.5rem,6.5rem)]";

type OutputFilesPanelProps = {
  dataSource: CareerOpsDataSource;
  defaultBranch: string | null;
  outputFiles: RepoDataFile[];
  applications: ApplicationEntry[];
};

export function OutputFilesPanel({
  dataSource,
  defaultBranch,
  outputFiles,
  applications,
}: OutputFilesPanelProps) {
  const [tableQuery, setTableQuery] = useState<OutputFilesTableQuery>(
    DEFAULT_OUTPUT_FILES_TABLE_QUERY,
  );

  const rows = useMemo(
    () => buildOutputFileRows(outputFiles, applications),
    [applications, outputFiles],
  );

  const filteredRows = useMemo(
    () => queryOutputFileRows(rows, tableQuery),
    [rows, tableQuery],
  );

  if (rows.length === 0) {
    return null;
  }

  const handleSort = (column: OutputFileSortColumn) => {
    setTableQuery((current) => {
      if (current.sortColumn === column) {
        return {
          ...current,
          sortDirection: current.sortDirection === "asc" ? "desc" : "asc",
        };
      }

      return {
        ...current,
        sortColumn: column,
        sortDirection: column === "date" ? "desc" : "asc",
      };
    });
  };

  return (
    <GlowPanel accent={DASHBOARD_SECTION_IDS.outputs}>
      <div>
        <h3 className="text-lg font-semibold text-white">Generated PDFs</h3>
        <p className="mt-1 text-sm text-white/60">
          Tailored CVs and outputs from `output/` — search, filter, and open
          PDFs inline.
        </p>
      </div>

      <OutputFilesTableToolbar
        query={tableQuery}
        resultCount={filteredRows.length}
        totalCount={rows.length}
        onQueryChange={setTableQuery}
        onClearFilters={() => setTableQuery(DEFAULT_OUTPUT_FILES_TABLE_QUERY)}
      />

      {filteredRows.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-white/15 px-4 py-6 text-center text-sm text-white/60">
          No PDFs match the current filters.
        </p>
      ) : (
        <div
          className="mt-4 overflow-hidden rounded-lg border border-white/10"
          role="table"
          aria-rowcount={filteredRows.length}
        >
          <div className="overflow-x-auto">
            <div className="min-w-[44rem]">
              <div role="rowgroup">
                <div
                  className={cn(
                    "grid border-b border-white/10 bg-[#15162c] px-2 text-sm",
                    OUTPUT_GRID_COLUMNS,
                  )}
                  role="row"
                >
                  <OutputFilesSortableHeader
                    label="File"
                    column="name"
                    sortColumn={tableQuery.sortColumn}
                    sortDirection={tableQuery.sortDirection}
                    onSort={handleSort}
                    className="px-2 py-2"
                  />
                  <OutputFilesSortableHeader
                    label="Company"
                    column="company"
                    sortColumn={tableQuery.sortColumn}
                    sortDirection={tableQuery.sortDirection}
                    onSort={handleSort}
                    className="px-2 py-2"
                  />
                  <OutputFilesSortableHeader
                    label="Role"
                    column="role"
                    sortColumn={tableQuery.sortColumn}
                    sortDirection={tableQuery.sortDirection}
                    onSort={handleSort}
                    className="px-2 py-2"
                  />
                  <OutputFilesSortableHeader
                    label="Date"
                    column="date"
                    sortColumn={tableQuery.sortColumn}
                    sortDirection={tableQuery.sortDirection}
                    onSort={handleSort}
                    className="px-2 py-2"
                  />
                  <OutputFilesStaticHeader label="Open" className="px-2 py-2" />
                </div>
              </div>

              <div role="rowgroup">
                {filteredRows.map((row) => (
                  <div
                    key={row.path}
                    className={cn(
                      "grid border-b border-white/5 px-2 text-sm text-white/90 last:border-b-0",
                      OUTPUT_GRID_COLUMNS,
                    )}
                    role="row"
                  >
                    <div
                      className="flex min-w-0 items-center gap-2 px-2 py-2"
                      role="cell"
                    >
                      <FileIcon className="size-3.5 shrink-0 text-violet-300/80" />
                      <span className="truncate" title={row.name}>
                        {row.name}
                      </span>
                    </div>
                    <div
                      className="flex items-center truncate px-2 py-2"
                      title={row.linkedApplication?.company}
                      role="cell"
                    >
                      {row.linkedApplication?.company ?? "—"}
                    </div>
                    <div
                      className="flex items-center truncate px-2 py-2 text-white/75"
                      title={row.linkedApplication?.role}
                      role="cell"
                    >
                      {row.linkedApplication?.role ?? "—"}
                    </div>
                    <div
                      className="flex items-center px-2 py-2 text-white/70"
                      role="cell"
                    >
                      {row.sortDate ? (
                        <ApplicationDate value={row.sortDate} />
                      ) : (
                        "—"
                      )}
                    </div>
                    <div className="flex items-center px-2 py-2" role="cell">
                      <ArtifactLinkButton
                        dataSource={dataSource}
                        defaultBranch={defaultBranch}
                        value={row.path}
                        className="inline-flex items-center gap-1 text-xs font-medium text-violet-300 hover:text-violet-200"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </GlowPanel>
  );
}
