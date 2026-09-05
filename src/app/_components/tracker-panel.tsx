"use client";

import { useMemo, useState } from "react";

import { ScoreBadge } from "~/app/_components/score-badge";
import {
  filterApplications,
  groupApplicationsByStatus,
} from "~/lib/career-ops/analytics";
import { extractMarkdownLink, resolveRepoFileUrl } from "~/lib/career-ops/links";
import { sortStatuses } from "~/lib/career-ops/status-meta";
import type { ApplicationEntry } from "~/lib/career-ops/types";

type TrackerView = "table" | "board";

type TrackerPanelProps = {
  repoFullName: string;
  applications: ApplicationEntry[];
  statusFilter: string | null;
  onStatusFilterChange: (status: string | null) => void;
};

export function TrackerPanel({
  repoFullName,
  applications,
  statusFilter,
  onStatusFilterChange,
}: TrackerPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<TrackerView>("table");

  const filteredApplications = useMemo(
    () => filterApplications(applications, { statusFilter, searchQuery }),
    [applications, searchQuery, statusFilter],
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

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Application tracker</h3>
          <p className="mt-1 text-sm text-white/60">
            Filter by status, search company or role, or switch to a read-only board view.
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

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wide text-white/50">
            Search
          </span>
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Company, role, status, notes…"
            className="rounded-lg border border-white/15 bg-[#15162c] px-3 py-2 text-sm text-white outline-none focus:border-violet-400"
          />
        </label>

        {statusFilter != null || searchQuery !== "" ? (
          <button
            type="button"
            onClick={() => {
              onStatusFilterChange(null);
              setSearchQuery("");
            }}
            className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/15 transition hover:bg-white/15"
          >
            Clear filters
          </button>
        ) : null}
      </div>

      <p className="mt-3 text-sm text-white/50">
        Showing {filteredApplications.length} of {applications.length} applications
        {statusFilter ? ` · filtered to ${statusFilter}` : ""}
      </p>

      {filteredApplications.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-white/15 px-4 py-6 text-center text-sm text-white/60">
          No applications match the current filters.
        </p>
      ) : view === "table" ? (
        <TrackerTable applications={filteredApplications} repoFullName={repoFullName} />
      ) : (
        <TrackerBoard
          statuses={boardStatuses}
          groupedApplications={groupedApplications}
          repoFullName={repoFullName}
        />
      )}
    </section>
  );
}

function TrackerTable({
  applications,
  repoFullName,
}: {
  applications: ApplicationEntry[];
  repoFullName: string;
}) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 text-white/60">
            <th className="px-3 py-2 font-medium">#</th>
            <th className="px-3 py-2 font-medium">Date</th>
            <th className="px-3 py-2 font-medium">Company</th>
            <th className="px-3 py-2 font-medium">Role</th>
            <th className="px-3 py-2 font-medium">Score</th>
            <th className="px-3 py-2 font-medium">Status</th>
            <th className="px-3 py-2 font-medium">Report</th>
            <th className="px-3 py-2 font-medium">Notes</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((entry) => (
            <tr key={entry.num} className="border-b border-white/5 text-white/90">
              <td className="px-3 py-2">{entry.num}</td>
              <td className="px-3 py-2 text-white/70">{entry.date}</td>
              <td className="px-3 py-2">{entry.company}</td>
              <td className="px-3 py-2">{entry.role}</td>
              <td className="px-3 py-2">
                <ScoreBadge score={entry.score} />
              </td>
              <td className="px-3 py-2">{entry.status}</td>
              <td className="px-3 py-2">
                <ArtifactLink repoFullName={repoFullName} value={entry.report} />
              </td>
              <td className="max-w-xs px-3 py-2 text-white/70">
                <span className="line-clamp-2">{entry.notes || "—"}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TrackerBoard({
  statuses,
  groupedApplications,
  repoFullName,
}: {
  statuses: string[];
  groupedApplications: Map<string, ApplicationEntry[]>;
  repoFullName: string;
}) {
  return (
    <div className="mt-4 grid gap-4 xl:grid-cols-4">
      {statuses.map((status) => {
        const entries = groupedApplications.get(status) ?? [];

        return (
          <div
            key={status}
            className="rounded-xl border border-white/10 bg-black/20 p-3"
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
                      <p className="font-medium text-white">{entry.company}</p>
                      <p className="mt-1 text-sm text-white/70">{entry.role}</p>
                    </div>
                    <ScoreBadge score={entry.score} />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2 text-xs text-white/50">
                    <span>{entry.date}</span>
                    <ArtifactLink repoFullName={repoFullName} value={entry.report} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
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
        className="font-medium text-violet-300 underline-offset-2 hover:text-violet-200 hover:underline"
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
        className="font-medium text-violet-300 underline-offset-2 hover:text-violet-200 hover:underline"
      >
        Report
      </a>
    );
  }

  return <span className="text-white/40">—</span>;
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
    <button
      type="button"
      onClick={onClick}
      className={
        isActive
          ? "rounded-full bg-violet-500 px-4 py-2 text-sm font-semibold text-white ring-1 ring-violet-300/40"
          : "rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/80 ring-1 ring-white/15 hover:bg-white/15"
      }
    >
      {label}
    </button>
  );
}
