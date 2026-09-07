"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ErrorAlert } from "~/app/_components/error-alert";
import { ReportMarkdown } from "~/app/_components/report-markdown";
import { ReportPreviewMeta } from "~/app/_components/report-preview-meta";
import { Button } from "~/components/ui/button";
import { glassCardSurfaceClassName } from "~/components/ui/glass-surface";
import {
  animatedExitClassName,
  useAnimatedPresence,
} from "~/hooks/use-animated-presence";
import { useBodyScrollLock } from "~/hooks/use-body-scroll-lock";
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
  const isOpen = activeArtifact != null;
  const { isRendered, isClosing } = useAnimatedPresence(isOpen, {
    durationMs: DRAWER_ANIMATION_MS,
  });
  const { data, isLoading, error } = useRepoFile(
    activeSource,
    displayedArtifact?.path ?? null,
  );

  useEffect(() => {
    if (activeArtifact) {
      setDisplayedArtifact(activeArtifact);
    }
  }, [activeArtifact]);

  const handleClose = useCallback(() => {
    if (isClosing || !displayedArtifact) {
      return;
    }

    closeArtifact();
  }, [closeArtifact, displayedArtifact, isClosing]);

  useBodyScrollLock(isRendered);

  useEffect(() => {
    if (!isRendered || isClosing) {
      return;
    }

    closeButtonRef.current?.focus();
  }, [isClosing, isRendered]);

  if (!isRendered || !displayedArtifact) {
    return null;
  }

  const isPdf = displayedArtifact.path.toLowerCase().endsWith(".pdf");
  const isMarkdownReport =
    !isPdf && displayedArtifact.path.toLowerCase().endsWith(".md");
  const meta =
    data?.encoding === "utf-8" && isMarkdownReport
      ? parseReportMarkdown(data.content)
      : null;
  const pdfSrc =
    data?.encoding === "base64"
      ? `data:application/pdf;base64,${data.content}`
      : null;
  const sourceUrl =
    meta?.sourceUrl && /^https?:\/\//i.test(meta.sourceUrl)
      ? meta.sourceUrl
      : null;
  const displayTitle =
    meta?.title ??
    displayedArtifact.label ??
    displayedArtifact.path.split("/").pop() ??
    displayedArtifact.path;

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
          "absolute inset-0 cursor-pointer bg-black/60 backdrop-blur-sm",
          isClosing
            ? cn(animatedExitClassName, "animate-out fade-out-0 duration-300")
            : "animate-in fade-in-0 duration-300 motion-reduce:animate-none",
        )}
        onClick={handleClose}
      />

      <aside
        className={cn(
          "cursor-surface absolute inset-y-0 right-0 flex h-full w-full max-w-3xl flex-col border-l border-white/10 bg-[#0f1024] shadow-2xl",
          isClosing
            ? cn(
                animatedExitClassName,
                "animate-out fade-out-0 slide-out-to-right duration-300",
              )
            : "animate-in fade-in-0 slide-in-from-right duration-300 motion-reduce:animate-none",
        )}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs tracking-wide text-white/45 uppercase">
              {isPdf ? "PDF preview" : "Report preview"}
            </p>
            <h2 className="mt-1 text-lg leading-snug font-semibold text-white">
              {displayTitle}
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

        <div className="min-h-0 flex-1 overflow-auto px-5 py-5">
          {isLoading ? (
            <div className="space-y-3">
              <div
                className={cn(
                  glassCardSurfaceClassName,
                  "h-24 animate-pulse rounded-xl",
                )}
              />
              <div
                className={cn(
                  glassCardSurfaceClassName,
                  "h-48 animate-pulse rounded-xl",
                )}
              />
            </div>
          ) : null}

          {error ? (
            <ErrorAlert title="Could not open file" message={error.message} />
          ) : null}

          {!isLoading && !error && meta ? (
            <ReportPreviewMeta meta={meta} sourceUrl={sourceUrl} />
          ) : null}

          {pdfSrc ? (
            <iframe
              title={displayedArtifact.label ?? displayedArtifact.path}
              src={pdfSrc}
              className="mt-4 h-[75vh] w-full rounded-xl border border-white/10 bg-white"
            />
          ) : null}

          {!isLoading && !error && data?.encoding === "utf-8" ? (
            <div
              className={cn(
                glassCardSurfaceClassName,
                "mt-4 rounded-xl px-4 py-5 sm:px-5 sm:py-6",
                meta ? undefined : "mt-0",
              )}
            >
              {isMarkdownReport ? (
                <ReportMarkdown content={data.content} />
              ) : (
                <ReportMarkdown
                  content={data.content}
                  stripFrontmatter={false}
                />
              )}
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
