"use client";

import { FileTextIcon } from "lucide-react";

import { ApplicationArtifactButton } from "~/app/_components/application-artifact-button";
import type { CareerOpsDataSource } from "~/lib/career-ops/data-source";
import { getApplicationReportRef } from "~/lib/career-ops/application-reports";
import type { ApplicationEntry, RepoDataFile } from "~/lib/career-ops/types";

type ApplicationReportButtonProps = {
  application: ApplicationEntry;
  dataSource: CareerOpsDataSource;
  defaultBranch: string | null;
  reportFiles: RepoDataFile[];
  className?: string;
  compact?: boolean;
};

export function ApplicationReportButton({
  application,
  dataSource,
  defaultBranch,
  reportFiles,
  className,
  compact = false,
}: ApplicationReportButtonProps) {
  const artifactRef = getApplicationReportRef(application, reportFiles);

  return (
    <ApplicationArtifactButton
      artifactRef={artifactRef}
      dataSource={dataSource}
      defaultBranch={defaultBranch}
      icon={FileTextIcon}
      kind="report"
      className={className}
      compact={compact}
    />
  );
}
