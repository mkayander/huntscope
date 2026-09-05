"use client";

import { ErrorAlert } from "~/app/_components/error-alert";
import { api } from "~/trpc/react";

export function RepoDataView() {
  const selectedRepoQuery = api.github.getSelectedRepo.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  if (selectedRepoQuery.isLoading) {
    return (
      <section className="w-full max-w-5xl rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="text-sm text-white/70">Loading saved repository…</p>
      </section>
    );
  }

  if (selectedRepoQuery.error) {
    return (
      <section className="w-full max-w-5xl rounded-2xl border border-white/10 bg-white/5 p-6">
        <ErrorAlert
          title="Could not read your saved repository"
          message={selectedRepoQuery.error.message}
        />
      </section>
    );
  }

  if (!selectedRepoQuery.data) {
    return (
      <section className="w-full max-w-5xl rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-center">
        <p className="text-white/70">
          Select a career-ops data repository above to load tracker and pipeline
          data.
        </p>
      </section>
    );
  }

  return <RepoDataContent />;
}

function RepoDataContent() {
  const { data, error, isLoading } = api.github.getRepoData.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <section className="w-full max-w-5xl rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="text-sm text-white/70">Loading repository data…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full max-w-5xl rounded-2xl border border-white/10 bg-white/5 p-6">
        <ErrorAlert title="Could not load repository data" message={error.message} />
      </section>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <section className="flex w-full max-w-5xl flex-col gap-6">
      <header className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-2xl font-semibold text-white">{data.fullName}</h2>
        <p className="mt-2 text-sm text-white/60">
          Read-only snapshot from your GitHub repository.
        </p>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3">
          <Stat label="Applications" value={String(data.applications.length)} />
          <Stat
            label="Pipeline pending"
            value={data.pipeline ? String(data.pipeline.pendingCount) : "—"}
          />
          <Stat label="Reports" value={String(data.reportsCount)} />
        </dl>
      </header>

      {data.dataFiles.length > 0 ? (
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-lg font-semibold text-white">data/ directory</h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {data.dataFiles.map((file) => (
              <li
                key={file.path}
                className="rounded-full bg-black/30 px-3 py-1 text-xs text-white/80"
              >
                {file.name}
                {file.type === "dir" ? "/" : ""}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {data.pipeline ? (
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-lg font-semibold text-white">Pipeline inbox</h3>
          <p className="mt-2 text-sm text-white/60">
            {data.pipeline.pendingCount} pending · {data.pipeline.processedCount} processed
          </p>
          {data.pipeline.pendingPreview.length > 0 ? (
            <ul className="mt-4 space-y-2 text-sm text-white/80">
              {data.pipeline.pendingPreview.map((entry) => (
                <li
                  key={entry}
                  className="overflow-hidden text-ellipsis whitespace-nowrap rounded-lg bg-black/20 px-3 py-2"
                >
                  {entry}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-white/50">No pending URLs in the pipeline.</p>
          )}
        </section>
      ) : null}

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-white">Application tracker</h3>
          <span className="text-sm text-white/50">
            {data.applications.length} row{data.applications.length === 1 ? "" : "s"}
          </span>
        </div>

        {data.applications.length > 0 ? (
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
                </tr>
              </thead>
              <tbody>
                {data.applications.slice(0, 25).map((entry) => (
                  <tr key={entry.num} className="border-b border-white/5 text-white/90">
                    <td className="px-3 py-2">{entry.num}</td>
                    <td className="px-3 py-2">{entry.date}</td>
                    <td className="px-3 py-2">{entry.company}</td>
                    <td className="px-3 py-2">{entry.role}</td>
                    <td className="px-3 py-2">{entry.score}</td>
                    <td className="px-3 py-2">{entry.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.applications.length > 25 ? (
              <p className="mt-3 text-xs text-white/50">
                Showing the first 25 of {data.applications.length} applications.
              </p>
            ) : null}
          </div>
        ) : (
          <p className="mt-4 text-sm text-white/50">
            No application rows found in{" "}
            <code className="rounded bg-black/30 px-1.5 py-0.5 text-xs">
              data/applications.md
            </code>
            .
          </p>
        )}
      </section>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-black/20 px-4 py-3">
      <dt className="text-xs uppercase tracking-wide text-white/50">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold text-white">{value}</dd>
    </div>
  );
}
