"use client";

import type { LucideIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
import { clickableLinkClassName } from "~/components/ui/interaction";
import type { ApplicationArtifactRef } from "~/lib/career-ops/application-artifacts";
import type { CareerOpsDataSource } from "~/lib/career-ops/data-source";
import { resolveArtifactLink } from "~/lib/career-ops/links";
import { useArtifactViewer } from "~/hooks/use-artifact-viewer";
import { cn } from "~/lib/utils";

type ApplicationArtifactKind = "pdf" | "report";

const ARTIFACT_KIND_LABELS: Record<
  ApplicationArtifactKind,
  { generic: string; noun: string }
> = {
  pdf: { generic: "pdf", noun: "PDF" },
  report: { generic: "report", noun: "report" },
};

type ApplicationArtifactButtonProps = {
  artifactRef: ApplicationArtifactRef | null;
  dataSource: CareerOpsDataSource;
  defaultBranch: string | null;
  icon: LucideIcon;
  kind: ApplicationArtifactKind;
  className?: string;
  compact?: boolean;
};

export function ApplicationArtifactButton({
  artifactRef,
  dataSource,
  defaultBranch,
  icon: Icon,
  kind,
  className,
  compact = false,
}: ApplicationArtifactButtonProps) {
  const { openArtifact } = useArtifactViewer();
  const labels = ARTIFACT_KIND_LABELS[kind];

  if (!artifactRef) {
    return <span className="text-white/40">—</span>;
  }

  const artifact = resolveArtifactLink(
    dataSource,
    artifactRef.value,
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
        <Icon className="size-3.5 shrink-0" />
        <span className="truncate">{artifact.label}</span>
      </a>
    );
  }

  const path = artifact.path;
  const label =
    artifact.label.toLowerCase() === labels.generic ? "Open" : artifact.label;
  const title =
    artifactRef.source === "inferred"
      ? `Open matched ${labels.noun}: ${artifactRef.path}`
      : `Open ${labels.noun}: ${artifactRef.path}`;

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
          label: artifactRef.label,
        })
      }
    >
      <Icon className="size-3.5 shrink-0" />
      <span className="truncate">{label}</span>
    </Button>
  );
}
