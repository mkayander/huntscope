"use client";

import { useEffect, useMemo, useState } from "react";

import { ScoreBadge } from "~/app/_components/score-badge";
import {
  createDefaultTrackerQuery,
  TrackerTableToolbar,
} from "~/app/_components/tracker-table-toolbar";
import { TrackerVirtualTable } from "~/app/_components/tracker-virtual-table";
import { ApplicationDate } from "~/components/application-date";
import { Button } from "~/components/ui/button";
import { glassCardSurfaceClassName } from "~/components/ui/glass-surface";
import { GlowPanel } from "~/components/ui/glow-panel";
import { DASHBOARD_SECTION_IDS } from "~/lib/dashboard/sections";
import type { CareerOpsDataSource } from "~/lib/career-ops/data-source";
import { cn } from "~/lib/utils";
import { TrackerArtifactLink } from "~/app/_components/tracker-artifact-link";
import { groupApplicationsByStatus } from "~/lib/career-ops/analytics";
import { getBoardColumnOrder } from "~/lib/career-ops/status-meta";
import {
  DEFAULT_TRACKER_TABLE_QUERY,
  queryTrackerApplications,
  type TrackerSortColumn,
  type TrackerTableQuery,
} from "~/lib/career-ops/tracker-table";
import type { ApplicationEntry } from "~/lib/career-ops/types";

type TrackerView = "table" | "board";

type TrackerPanelProps = {
  dataSource: CareerOpsDataSource;
  defaultBranch: string | null;
  applications: ApplicationEntry[];
  statusFilter: string | null;
  onStatusFilterChange: (status: string | null) => void;
};

export function TrackerPanel({
  dataSource,
  defaultBranch,
  applications,
  statusFilter,
  onStatusFilterChange,
}: TrackerPanelProps) {
  const [view, setView] = useState<TrackerView>("table");
  const [tableQuery, setTableQuery] = useState<TrackerTableQuery>(() =>
    createDefaultTrackerQuery(statusFilter),
  );

  useEffect(() => {
    setTableQuery((current) =>
      current.statusFilter === statusFilter
        ? current
        : { ...current, statusFilter },
    );
  }, [statusFilter]);

  const filteredApplications = useMemo(
    () => queryTrackerApplications(applications, tableQuery),
    [applications, tableQuery],
  );

  const groupedApplications = useMemo(
    () => groupApplicationsByStatus(filteredApplications),
    [filteredApplications],
  );

  const boardStatuses = useMemo(() => {
    const statusCounts = Object.fromEntries(
      [...groupedApplications.entries()].map(([status, entries]) => [
        status,
        entries.length,
      ]),
    );

    return getBoardColumnOrder(statusCounts);
  }, [groupedApplications]);

  const handleQueryChange = (nextQuery: TrackerTableQuery) => {
    setTableQuery(nextQuery);
    if (nextQuery.statusFilter !== statusFilter) {
      onStatusFilterChange(nextQuery.statusFilter);
    }
  };

  const handleClearFilters = () => {
    setTableQuery(DEFAULT_TRACKER_TABLE_QUERY);
    onStatusFilterChange(null);
  };

  const handleSort = (column: TrackerSortColumn) => {
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
        sortDirection: column === "num" || column === "date" ? "desc" : "asc",
      };
    });
  };

  return (
    <GlowPanel
      accent={DASHBOARD_SECTION_IDS.tracker}
      className="flex max-h-[100dvh] w-full min-w-0 flex-col overflow-hidden"
      contentClassName="flex min-h-0 min-w-0 flex-1 flex-col"
    >
      <div className="shrink-0">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Application tracker
            </h3>
            <p className="mt-1 text-sm text-white/60">
              Search, filter, and sort applications. Overview status chips stay
              in sync with the status filter here.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <ViewToggle
              label="Table"
              isActive={view === "table"}
              onClick={() => setView("table")}
            />
            <ViewToggle
              label="Board"
              isActive={view === "board"}
              onClick={() => setView("board")}
            />
          </div>
        </div>

        <TrackerTableToolbar
          applications={applications}
          query={tableQuery}
          resultCount={filteredApplications.length}
          onQueryChange={handleQueryChange}
          onClearFilters={handleClearFilters}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {filteredApplications.length === 0 ? (
          <p className="mt-6 rounded-lg border border-dashed border-white/15 px-4 py-6 text-center text-sm text-white/60">
            No applications match the current filters.
          </p>
        ) : view === "table" ? (
          <TrackerVirtualTable
            applications={filteredApplications}
            dataSource={dataSource}
            defaultBranch={defaultBranch}
            tableQuery={tableQuery}
            onSort={handleSort}
          />
        ) : (
          <TrackerBoard
            statuses={boardStatuses}
            groupedApplications={groupedApplications}
            dataSource={dataSource}
            defaultBranch={defaultBranch}
          />
        )}
      </div>
    </GlowPanel>
  );
}

function TrackerBoard({
  statuses,
  groupedApplications,
  dataSource,
  defaultBranch,
}: {
  statuses: string[];
  groupedApplications: Map<string, ApplicationEntry[]>;
  dataSource: CareerOpsDataSource;
  defaultBranch: string | null;
}) {
  return (
    <div className="mt-4 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto md:overflow-x-auto md:overflow-y-hidden">
        <div className="flex flex-col gap-4 pb-2 md:h-full md:min-w-min md:flex-row md:items-stretch">
          {statuses.map((status) => {
            const entries = groupedApplications.get(status) ?? [];

            return (
              <div
                key={status}
                className={cn(
                  glassCardSurfaceClassName,
                  "flex min-h-0 w-full flex-col rounded-xl p-3 md:h-full md:w-72 md:shrink-0",
                )}
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-white">{status}</h4>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70">
                    {entries.length}
                  </span>
                </div>

                <ul className="min-h-0 space-y-3 md:flex-1 md:overflow-y-auto">
                  {entries.map((entry) => (
                    <li
                      key={entry.num}
                      className="rounded-lg border border-white/10 bg-[#15162c] p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-white">
                            {entry.company}
                          </p>
                          <p className="mt-1 truncate text-sm text-white/70">
                            {entry.role}
                          </p>
                        </div>
                        <ScoreBadge score={entry.score} />
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2 text-xs text-white/50">
                        <ApplicationDate value={entry.date} />
                        <TrackerArtifactLink
                          dataSource={dataSource}
                          defaultBranch={defaultBranch}
                          value={entry.report}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ViewToggle({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant={isActive ? "brand" : "brandSecondary"}
      size="pill"
      onClick={onClick}
    >
      {label}
    </Button>
  );
}
