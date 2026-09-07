"use client";

import { FileIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
import { clickableLinkClassName } from "~/components/ui/interaction";
import type { CareerOpsDataSource } from "~/lib/career-ops/data-source";
import { getApplicationPdfRef } from "~/lib/career-ops/application-pdfs";
import { resolveArtifactLink } from "~/lib/career-ops/links";
import type { ApplicationEntry, RepoDataFile } from "~/lib/career-ops/types";
import { useArtifactViewer } from "~/hooks/use-artifact-viewer";
import { cn } from "~/lib/utils";

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
  const { openArtifact } = useArtifactViewer();
  const pdfRef = getApplicationPdfRef(application, outputFiles);

  if (!pdfRef) {
    return <span className="text-white/40">—</span>;
  }

  const artifact = resolveArtifactLink(dataSource, pdfRef.value, defaultBranch);

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
        <FileIcon className="size-3.5 shrink-0" />
        <span className="truncate">{artifact.label}</span>
      </a>
    );
  }

  const path = artifact.path;
  const label =
    artifact.label.toLowerCase() === "pdf" ? "Open" : artifact.label;
  const title =
    pdfRef.source === "inferred"
      ? `Open matched PDF: ${pdfRef.path}`
      : `Open PDF: ${pdfRef.path}`;

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
          label: pdfRef.label,
        })
      }
    >
      <FileIcon className="size-3.5 shrink-0" />
      <span className="truncate">{label}</span>
    </Button>
  );
}
