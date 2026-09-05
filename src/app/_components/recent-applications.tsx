import type { ApplicationEntry } from "~/lib/career-ops/types";
import { ScoreBadge } from "~/app/_components/score-badge";

type RecentApplicationsProps = {
  applications: ApplicationEntry[];
};

export function RecentApplications({ applications }: RecentApplicationsProps) {
  if (applications.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-white">Recent applications</h3>
        <span className="text-sm text-white/50">Latest {applications.length}</span>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-white/60">
              <th className="px-3 py-2 font-medium">Company</th>
              <th className="px-3 py-2 font-medium">Role</th>
              <th className="px-3 py-2 font-medium">Score</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((entry) => (
              <tr key={entry.num} className="border-b border-white/5 text-white/90">
                <td className="px-3 py-2">{entry.company}</td>
                <td className="px-3 py-2">{entry.role}</td>
                <td className="px-3 py-2">
                  <ScoreBadge score={entry.score} />
                </td>
                <td className="px-3 py-2">{entry.status}</td>
                <td className="px-3 py-2 text-white/70">{entry.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
