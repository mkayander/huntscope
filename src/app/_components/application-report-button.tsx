"use client";

import { FileTextIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
import { clickableLinkClassName } from "~/components/ui/interaction";
import type { CareerOpsDataSource } from "~/lib/career-ops/data-source";
import { getApplicationReportRef } from "~/lib/career-ops/application-reports";
import { resolveArtifactLink } from "~/lib/career-ops/links";
import type { ApplicationEntry, RepoDataFile } from "~/lib/career-ops/types";
import { useArtifactViewer } from "~/hooks/use-artifact-viewer";
import { cn } from "~/lib/utils";

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
  const { openArtifact } = useArtifactViewer();
  const reportRef = getApplicationReportRef(application, reportFiles);

  if (!reportRef) {
    return <span className="text-white/40">—</span>;
  }

  const artifact = resolveArtifactLink(
    dataSource,
    reportRef.value,
    defaultBranch,
  );

  if (!artifact?.path) {
    if (!artifact?.href) {
      return <span className="text-white/40">—</span>;
    }

    return (
      <a
        href={artifact.href}
        target="_blank"
        rel="noreferrer"
        className={cn(
          clickableLinkClassName,
          "inline-flex max-w-full items-center gap-1.5 text-xs",
          className,
        )}
      >
        <FileTextIcon className="size-3.5 shrink-0" />
        <span className="truncate">{artifact.label}</span>
      </a>
    );
  }

  const path = artifact.path;
  const label =
    artifact.label.toLowerCase() === "report" ? "Open" : artifact.label;
  const title =
    reportRef.source === "inferred"
      ? `Open matched report: ${reportRef.path}`
      : `Open report: ${reportRef.path}`;

  return (
    <Button
      type="button"
      variant="brandSecondary"
      size="pillSm"
      title={title}
      className={cn(
        "max-w-full min-w-0 gap-1.5 px-2.5",
        compact ? "h-7 text-xs" : undefined,
        className,
      )}
      onClick={() =>
        openArtifact({
          path,
          label: reportRef.label,
        })
      }
    >
      <FileTextIcon className="size-3.5 shrink-0" />
      <span className="truncate">{label}</span>
    </Button>
  );
}
