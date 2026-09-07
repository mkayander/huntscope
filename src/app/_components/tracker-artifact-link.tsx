import type { CareerOpsDataSource } from "~/lib/career-ops/data-source";
import { resolveArtifactLink } from "~/lib/career-ops/links";

type TrackerArtifactLinkProps = {
  dataSource: CareerOpsDataSource;
  defaultBranch: string | null;
  value: string;
};

export function TrackerArtifactLink({
  dataSource,
  defaultBranch,
  value,
}: TrackerArtifactLinkProps) {
  const artifact = resolveArtifactLink(dataSource, value, defaultBranch);

  if (!artifact) {
    return <span className="text-white/40">—</span>;
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
      className="block truncate font-medium text-violet-300 underline-offset-2 hover:text-violet-200 hover:underline"
    >
      {artifact.label}
    </a>
  );
}
