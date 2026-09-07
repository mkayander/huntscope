"use client";

import { clickableLinkClassName } from "~/components/ui/interaction";
import { resolveArtifactLink } from "~/lib/career-ops/links";
import { cn } from "~/lib/utils";
import type { CareerOpsDataSource } from "~/lib/career-ops/data-source";
import { useArtifactViewer } from "~/hooks/use-artifact-viewer";

type ArtifactLinkButtonProps = {
  dataSource: CareerOpsDataSource;
  defaultBranch: string | null;
  value: string;
  className?: string;
};

export function ArtifactLinkButton({
  dataSource,
  defaultBranch,
  value,
  className,
}: ArtifactLinkButtonProps) {
  const { openArtifact } = useArtifactViewer();
  const artifact = resolveArtifactLink(dataSource, value, defaultBranch);

  if (!artifact) {
    return <span className="text-white/40">—</span>;
  }

  if (artifact.path) {
    const path = artifact.path;
    return (
      <button
        type="button"
        className={cn("block truncate", clickableLinkClassName, className)}
        onClick={() =>
          openArtifact({
            path,
            label: artifact.label,
          })
        }
      >
        {artifact.label}
      </button>
    );
  }

  if (!artifact.href) {
    return (
      <span className="block truncate text-white/60">{artifact.label}</span>
    );
  }

  return (
    <a
      href={artifact.href}
      target="_blank"
      rel="noreferrer"
      className={cn("block truncate", clickableLinkClassName, className)}
    >
      {artifact.label}
    </a>
  );
}
