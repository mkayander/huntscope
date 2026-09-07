import type { ApplicationEntry, RepoDataFile } from "~/lib/career-ops/types";
import { ApplicationDate } from "~/components/application-date";
import { ApplicationRoleLink } from "~/app/_components/application-role-link";
import { ScoreBadge } from "~/app/_components/score-badge";
import { GlowPanel } from "~/components/ui/glow-panel";
import { DASHBOARD_SECTION_IDS } from "~/lib/dashboard/sections";
import {
  getReportSourceUrlForApplication,
  useReportSourceUrlMap,
} from "~/hooks/use-report-source-url-map";
import type { CareerOpsDataSource } from "~/lib/career-ops/data-source";

type RecentApplicationsProps = {
  applications: ApplicationEntry[];
  dataSource: CareerOpsDataSource;
  reportFiles: RepoDataFile[];
};

export function RecentApplications({
  applications,
  dataSource,
  reportFiles,
}: RecentApplicationsProps) {
  const reportSourceUrlByPath = useReportSourceUrlMap(
    applications,
    reportFiles,
    dataSource,
  );

  if (applications.length === 0) {
    return null;
  }

  return (
    <GlowPanel accent={DASHBOARD_SECTION_IDS.recent}>
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-white">
          Recent applications
        </h3>
        <span className="text-sm text-white/50">
          Latest {applications.length}
        </span>
      </div>

      <div className="mt-4 min-w-0">
        <table className="w-full table-fixed border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-white/60">
              <th className="w-[24%] px-2 py-2 font-medium">Company</th>
              <th className="w-[28%] px-2 py-2 font-medium">Role</th>
              <th className="w-16 px-2 py-2 font-medium">Score</th>
              <th className="w-[18%] px-2 py-2 font-medium">Status</th>
              <th className="px-2 py-2 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((entry) => (
              <tr
                key={entry.num}
                className="border-b border-white/5 text-white/90"
              >
                <td className="truncate px-2 py-2" title={entry.company}>
                  {entry.company}
                </td>
                <td className="truncate px-2 py-2">
                  <ApplicationRoleLink
                    application={entry}
                    reportSourceUrl={getReportSourceUrlForApplication(
                      entry,
                      reportFiles,
                      reportSourceUrlByPath,
                    )}
                  />
                </td>
                <td className="px-2 py-2">
                  <ScoreBadge score={entry.score} />
                </td>
                <td className="truncate px-2 py-2" title={entry.status}>
                  {entry.status}
                </td>
                <td className="truncate px-2 py-2 text-white/70">
                  <ApplicationDate value={entry.date} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlowPanel>
  );
}
