"use client";

import { FileIcon } from "lucide-react";

import { ApplicationArtifactButton } from "~/app/_components/application-artifact-button";
import type { CareerOpsDataSource } from "~/lib/career-ops/data-source";
import { getApplicationPdfRef } from "~/lib/career-ops/application-pdfs";
import type { ApplicationEntry, RepoDataFile } from "~/lib/career-ops/types";

type ApplicationPdfButtonProps = {
  application: ApplicationEntry;
  dataSource: CareerOpsDataSource;
  defaultBranch: string | null;
  outputFiles: RepoDataFile[];
  className?: string;
  compact?: boolean;
};

export function ApplicationPdfButton({
  application,
  dataSource,
  defaultBranch,
  outputFiles,
  className,
  compact = false,
}: ApplicationPdfButtonProps) {
  const artifactRef = getApplicationPdfRef(application, outputFiles);

  return (
    <ApplicationArtifactButton
      artifactRef={artifactRef}
      dataSource={dataSource}
      defaultBranch={defaultBranch}
      icon={FileIcon}
      kind="pdf"
      className={className}
      compact={compact}
    />
  );
}
