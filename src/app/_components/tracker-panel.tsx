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
import { groupApplicationsByStatus } from "~/lib/career-ops/analytics";
import { resolveArtifactLink } from "~/lib/career-ops/links";
import { arraysEqual } from "~/lib/career-ops/status-filters";
import { sortStatuses } from "~/lib/career-ops/status-meta";
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
  statusFilters: string[];
  onStatusFiltersChange: (statuses: string[]) => void;
};

export function TrackerPanel({
  dataSource,
  defaultBranch,
  applications,
  statusFilters,
  onStatusFiltersChange,
}: TrackerPanelProps) {
  const [view, setView] = useState<TrackerView>("table");
  const [tableQuery, setTableQuery] = useState<TrackerTableQuery>(() =>
    createDefaultTrackerQuery(statusFilters),
  );

  useEffect(() => {
    setTableQuery((current) =>
      arraysEqual(current.statusFilters, statusFilters)
        ? current
        : { ...current, statusFilters },
    );
  }, [statusFilters]);

  const filteredApplications = useMemo(
    () => queryTrackerApplications(applications, tableQuery),
    [applications, tableQuery],
  );

  const groupedApplications = useMemo(
    () => groupApplicationsByStatus(filteredApplications),
    [filteredApplications],
  );

  const boardStatuses = useMemo(() => {
    const statuses = sortStatuses(
      Object.fromEntries(
        [...groupedApplications.entries()].map(([status, entries]) => [
          status,
          entries.length,
        ]),
      ),
    );

    return statuses.length > 0 ? statuses : [...groupedApplications.keys()];
  }, [groupedApplications]);

  const handleQueryChange = (nextQuery: TrackerTableQuery) => {
    setTableQuery(nextQuery);
    if (!arraysEqual(nextQuery.statusFilters, statusFilters)) {
      onStatusFiltersChange(nextQuery.statusFilters);
    }
  };

  const handleClearFilters = () => {
    setTableQuery(DEFAULT_TRACKER_TABLE_QUERY);
    onStatusFiltersChange([]);
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
      className="flex max-h-[100dvh] flex-col overflow-hidden"
      contentClassName="flex min-h-0 flex-1 flex-col"
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
    <div className="mt-4 min-h-0 flex-1 overflow-auto">
      <div className="grid gap-4 xl:grid-cols-4">
        {statuses.map((status) => {
          const entries = groupedApplications.get(status) ?? [];

          return (
            <div
              key={status}
              className={cn(glassCardSurfaceClassName, "rounded-xl p-3")}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <h4 className="text-sm font-semibold text-white">{status}</h4>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70">
                  {entries.length}
                </span>
              </div>

              <ul className="space-y-3">
                {entries.map((entry) => (
                  <li
                    key={entry.num}
                    className="rounded-lg border border-white/10 bg-[#15162c] p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-white">
                          {entry.company}
                        </p>
                        <p className="mt-1 text-sm text-white/70">
                          {entry.role}
                        </p>
                      </div>
                      <ScoreBadge score={entry.score} />
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2 text-xs text-white/50">
                      <ApplicationDate value={entry.date} />
                      <ArtifactLink
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
  );
}

function ArtifactLink({
  dataSource,
  defaultBranch,
  value,
}: {
  dataSource: CareerOpsDataSource;
  defaultBranch: string | null;
  value: string;
}) {
  const artifact = resolveArtifactLink(dataSource, value, defaultBranch);

  if (!artifact) {
    return <span className="text-white/40">—</span>;
  }

  if (!artifact.href) {
    return (
      <span className="block truncate text-white/60">{artifact.label}</span>
    );
  }

  return (
    <a
      href={artifact.href}
      target="_blank"
      rel="noreferrer"
      className="block truncate font-medium text-violet-300 underline-offset-2 hover:text-violet-200 hover:underline"
    >
      {artifact.label}
    </a>
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
