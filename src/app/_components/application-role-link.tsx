"use client";

import { clickableLinkClassName } from "~/components/ui/interaction";
import { useRepoFile } from "~/hooks/use-repo-file";
import { getApplicationReportRef } from "~/lib/career-ops/application-reports";
import {
  getRoleDisplayLabel,
  getInlineJobPostingUrl,
  resolveJobPostingUrl,
} from "~/lib/career-ops/application-job-posting";
import type { CareerOpsDataSource } from "~/lib/career-ops/data-source";
import { parseReportMarkdown } from "~/lib/career-ops/parse-report";
import type { ApplicationEntry, RepoDataFile } from "~/lib/career-ops/types";
import { cn } from "~/lib/utils";

type ApplicationRoleLinkProps = {
  application: ApplicationEntry;
  dataSource: CareerOpsDataSource;
  reportFiles: RepoDataFile[];
  className?: string;
};

export function ApplicationRoleLink({
  application,
  dataSource,
  reportFiles,
  className,
}: ApplicationRoleLinkProps) {
  const label = getRoleDisplayLabel(application.role);
  const inlineUrl = getInlineJobPostingUrl(application);
  const reportRef = getApplicationReportRef(application, reportFiles);
  const { data } = useRepoFile(
    dataSource,
    inlineUrl ? null : (reportRef?.path ?? null),
  );

  const reportSourceUrl =
    data?.encoding === "utf-8"
      ? parseReportMarkdown(data.content).sourceUrl
      : null;
  const href = resolveJobPostingUrl(application, reportSourceUrl);

  if (!href) {
    return (
      <span className={cn("truncate", className)} title={label}>
        {label}
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn(clickableLinkClassName, "truncate", className)}
      title={label}
    >
      {label}
    </a>
  );
}
