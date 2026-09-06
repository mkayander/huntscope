"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";

import { ScoreBadge } from "~/app/_components/score-badge";
import { TrackerSortableHeader } from "~/app/_components/tracker-table-toolbar";
import { ApplicationDate } from "~/components/application-date";
import { extractMarkdownLink, resolveRepoFileUrl } from "~/lib/career-ops/links";
import type { TrackerSortColumn, TrackerTableQuery } from "~/lib/career-ops/tracker-table";
import type { ApplicationEntry } from "~/lib/career-ops/types";

const ROW_HEIGHT = 52;

const TRACKER_GRID_COLUMNS =
  "grid-cols-[2.5rem_6rem_minmax(0,1.1fr)_minmax(0,1.1fr)_4rem_minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,1.2fr)]";

type TrackerVirtualTableProps = {
  applications: ApplicationEntry[];
  repoFullName: string;
  tableQuery: TrackerTableQuery;
  onSort: (column: TrackerSortColumn) => void;
};

export function TrackerVirtualTable({
  applications,
  repoFullName,
  tableQuery,
  onSort,
}: TrackerVirtualTableProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: applications.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 12,
    getItemKey: (index) => applications[index]?.num ?? index,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();

  return (
    <div
      className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-white/10"
      role="table"
      aria-rowcount={applications.length}
    >
      <div
        className={`grid ${TRACKER_GRID_COLUMNS} shrink-0 border-b border-white/10 bg-[#15162c] px-2 text-sm`}
        role="row"
      >
        <TrackerSortableHeader
          as="div"
          label="#"
          column="num"
          sortColumn={tableQuery.sortColumn}
          sortDirection={tableQuery.sortDirection}
          onSort={onSort}
          className="px-2 py-2"
        />
        <TrackerSortableHeader
          as="div"
          label="Date"
          column="date"
          sortColumn={tableQuery.sortColumn}
          sortDirection={tableQuery.sortDirection}
          onSort={onSort}
          className="px-2 py-2"
        />
        <TrackerSortableHeader
          as="div"
          label="Company"
          column="company"
          sortColumn={tableQuery.sortColumn}
          sortDirection={tableQuery.sortDirection}
          onSort={onSort}
          className="px-2 py-2"
        />
        <TrackerSortableHeader
          as="div"
          label="Role"
          column="role"
          sortColumn={tableQuery.sortColumn}
          sortDirection={tableQuery.sortDirection}
          onSort={onSort}
          className="px-2 py-2"
        />
        <TrackerSortableHeader
          as="div"
          label="Score"
          column="score"
          sortColumn={tableQuery.sortColumn}
          sortDirection={tableQuery.sortDirection}
          onSort={onSort}
          className="px-2 py-2"
        />
        <TrackerSortableHeader
          as="div"
          label="Status"
          column="status"
          sortColumn={tableQuery.sortColumn}
          sortDirection={tableQuery.sortDirection}
          onSort={onSort}
          className="px-2 py-2"
        />
        <div className="px-2 py-2 font-medium text-white/60" role="columnheader">
          Report
        </div>
        <div className="px-2 py-2 font-medium text-white/60" role="columnheader">
          Notes
        </div>
      </div>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-auto"
        role="rowgroup"
      >
        <div
          className="relative w-full"
          style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
        >
          {virtualRows.map((virtualRow) => {
            const entry = applications[virtualRow.index];
            if (!entry) {
              return null;
            }

            return (
              <div
                key={entry.num}
                data-index={virtualRow.index}
                className={`absolute top-0 left-0 grid w-full ${TRACKER_GRID_COLUMNS} border-b border-white/5 px-2 text-sm text-white/90`}
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                role="row"
              >
                <div className="flex items-center px-2 py-2" role="cell">{entry.num}</div>
                <div className="flex items-center px-2 py-2 text-white/70" role="cell">
                  <ApplicationDate value={entry.date} />
                </div>
                <div className="flex items-center truncate px-2 py-2" title={entry.company} role="cell">
                  {entry.company}
                </div>
                <div className="flex items-center truncate px-2 py-2" title={entry.role} role="cell">
                  {entry.role}
                </div>
                <div className="flex items-center px-2 py-2" role="cell">
                  <ScoreBadge score={entry.score} />
                </div>
                <div className="flex items-center truncate px-2 py-2" title={entry.status} role="cell">
                  {entry.status}
                </div>
                <div className="flex items-center truncate px-2 py-2" role="cell">
                  <ArtifactLink repoFullName={repoFullName} value={entry.report} />
                </div>
                <div className="flex items-center px-2 py-2 text-white/70" role="cell">
                  <span className="line-clamp-2 break-words" title={entry.notes || undefined}>
                    {entry.notes || "—"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ArtifactLink({
  repoFullName,
  value,
}: {
  repoFullName: string;
  value: string;
}) {
  const markdownLink = extractMarkdownLink(value);
  if (markdownLink) {
    const href = markdownLink.href.startsWith("http")
      ? markdownLink.href
      : resolveRepoFileUrl(repoFullName, markdownLink.href);

    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="block truncate font-medium text-violet-300 underline-offset-2 hover:text-violet-200 hover:underline"
      >
        {markdownLink.label}
      </a>
    );
  }

  const trimmed = value.trim();
  if (trimmed && (trimmed.includes("/") || trimmed.endsWith(".md"))) {
    return (
      <a
        href={resolveRepoFileUrl(repoFullName, trimmed)}
        target="_blank"
        rel="noreferrer"
        className="block truncate font-medium text-violet-300 underline-offset-2 hover:text-violet-200 hover:underline"
      >
        Report
      </a>
    );
  }

  return <span className="text-white/40">—</span>;
}
