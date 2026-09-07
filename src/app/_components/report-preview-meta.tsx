"use client";

import { ExternalLinkIcon } from "lucide-react";

import { ScoreBadge } from "~/app/_components/score-badge";
import { clickableLinkClassName } from "~/components/ui/interaction";
import { glassCardSurfaceClassName } from "~/components/ui/glass-surface";
import type { ParsedReportMeta } from "~/lib/career-ops/parse-report";
import { cn } from "~/lib/utils";

type ReportPreviewMetaProps = {
  meta: ParsedReportMeta;
  sourceUrl?: string | null;
};

export function ReportPreviewMeta({ meta, sourceUrl }: ReportPreviewMetaProps) {
  return (
    <div
      className={cn(
        glassCardSurfaceClassName,
        "grid gap-4 rounded-xl p-4 sm:grid-cols-[auto_1fr] sm:items-center",
      )}
    >
      <div className="flex flex-col gap-2">
        <span className="text-[0.6875rem] font-medium tracking-[0.14em] text-white/45 uppercase">
          Fit score
        </span>
        {meta.score ? (
          <ScoreBadge score={meta.score} />
        ) : (
          <span className="text-sm text-white/50">—</span>
        )}
      </div>

      <dl className="grid gap-3 sm:grid-cols-2">
        <MetaItem label="Legitimacy" value={meta.legitimacy ?? "—"} />
        <MetaItem
          label="Source"
          value={sourceUrl ? shortenUrl(sourceUrl) : (meta.sourceUrl ?? "—")}
          href={sourceUrl}
        />
      </dl>
    </div>
  );
}

function MetaItem({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string | null;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-[0.6875rem] font-medium tracking-[0.14em] text-white/45 uppercase">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium break-words text-white/90">
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              clickableLinkClassName,
              "inline-flex max-w-full items-center gap-1.5",
            )}
          >
            <span className="truncate">{value}</span>
            <ExternalLinkIcon className="size-3.5 shrink-0 opacity-70" />
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

function shortenUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const path =
      parsed.pathname.length > 28
        ? `${parsed.pathname.slice(0, 25)}…`
        : parsed.pathname;
    return `${parsed.hostname}${path === "/" ? "" : path}`;
  } catch {
    return url;
  }
}
