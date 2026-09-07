"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

import { ErrorAlert } from "~/app/_components/error-alert";
import { Button } from "~/components/ui/button";
import { clickableLinkClassName } from "~/components/ui/interaction";
import { GlowPanel } from "~/components/ui/glow-panel";
import { useArtifactViewer } from "~/hooks/use-artifact-viewer";
import type { ArtifactPreviewRequest } from "~/hooks/use-artifact-viewer";
import { useRepoFile } from "~/hooks/use-repo-file";
import { useCareerOpsDataSource } from "~/hooks/use-career-ops-data-source";
import { parseReportMarkdown } from "~/lib/career-ops/parse-report";
import { cn } from "~/lib/utils";

const DRAWER_ANIMATION_MS = 300;

export function ArtifactPreviewSheet() {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { activeArtifact, closeArtifact } = useArtifactViewer();
  const { activeSource } = useCareerOpsDataSource();
  const [displayedArtifact, setDisplayedArtifact] =
    useState<ArtifactPreviewRequest | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const { data, isLoading, error } = useRepoFile(
    activeSource,
    displayedArtifact?.path ?? null,
  );

  const handleClose = useCallback(() => {
    if (isClosing || !displayedArtifact) {
      return;
    }

    closeArtifact();
  }, [closeArtifact, displayedArtifact, isClosing]);

  useEffect(() => {
    if (activeArtifact) {
      setDisplayedArtifact(activeArtifact);
      setIsClosing(false);
      return;
    }

    if (!displayedArtifact) {
      return;
    }

    setIsClosing(true);
    const timer = window.setTimeout(() => {
      setDisplayedArtifact(null);
      setIsClosing(false);
    }, DRAWER_ANIMATION_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [activeArtifact, displayedArtifact]);

  useEffect(() => {
    if (!displayedArtifact || isClosing) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [displayedArtifact, isClosing]);

  if (!displayedArtifact) {
    return null;
  }

  const isPdf = displayedArtifact.path.toLowerCase().endsWith(".pdf");
  const meta =
    data?.encoding === "utf-8" ? parseReportMarkdown(data.content) : null;
  const pdfSrc =
    data?.encoding === "base64"
      ? `data:application/pdf;base64,${data.content}`
      : null;
  const sourceUrl =
    meta?.sourceUrl && /^https?:\/\//i.test(meta.sourceUrl)
      ? meta.sourceUrl
      : null;

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-label={isPdf ? "PDF preview" : "Report preview"}
    >
      <button
        type="button"
        aria-label="Close preview"
        className={cn(
          "absolute inset-0 cursor-pointer bg-black/60 backdrop-blur-sm motion-reduce:animate-none",
          isClosing
            ? "animate-out fade-out-0 duration-200"
            : "animate-in fade-in-0 duration-200",
        )}
        onClick={handleClose}
      />

      <aside
        className={cn(
          "cursor-surface absolute inset-y-0 right-0 flex h-full w-full max-w-3xl flex-col border-l border-white/10 bg-[#0f1024] shadow-2xl motion-reduce:animate-none",
          isClosing
            ? "animate-out fade-out-0 slide-out-to-right duration-300"
            : "animate-in fade-in-0 slide-in-from-right duration-300",
        )}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs tracking-wide text-white/45 uppercase">
              {isPdf ? "PDF preview" : "Report preview"}
            </p>
            <h2 className="truncate text-lg font-semibold text-white">
              {displayedArtifact.label ?? displayedArtifact.path}
            </h2>
            <p className="mt-1 truncate text-xs text-white/50">
              {displayedArtifact.path}
            </p>
          </div>
          <Button
            ref={closeButtonRef}
            type="button"
            variant="brandSecondary"
            size="pillSm"
            onClick={handleClose}
          >
            Close
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto px-5 py-4">
          {isLoading ? (
            <p className="text-sm text-white/60">Loading file…</p>
          ) : null}

          {error ? (
            <ErrorAlert title="Could not open file" message={error.message} />
          ) : null}

          {meta ? (
            <GlowPanel className="mb-4">
              <dl className="grid gap-3 sm:grid-cols-3">
                <Metric label="Score" value={meta.score ?? "—"} />
                <Metric label="Legitimacy" value={meta.legitimacy ?? "—"} />
                <Metric
                  label="Source"
                  value={meta.sourceUrl ?? "—"}
                  href={sourceUrl}
                />
              </dl>
            </GlowPanel>
          ) : null}

          {pdfSrc ? (
            <iframe
              title={displayedArtifact.label ?? displayedArtifact.path}
              src={pdfSrc}
              className="h-[75vh] w-full rounded-xl border border-white/10 bg-white"
            />
          ) : null}

          {data?.encoding === "utf-8" ? (
            <article className="prose prose-invert prose-headings:text-white prose-p:text-white/85 prose-a:text-violet-300 prose-strong:text-white prose-code:text-violet-200 max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSanitize]}
              >
                {data.content}
              </ReactMarkdown>
            </article>
          ) : null}
        </div>
      </aside>
    </div>
  );
}

function Metric({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string | null;
}) {
  return (
    <div>
      <dt className="text-xs tracking-wide text-white/45 uppercase">{label}</dt>
      <dd className="mt-1 text-sm font-medium break-words text-white">
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={clickableLinkClassName}
          >
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}
