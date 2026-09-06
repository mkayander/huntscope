"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

import { ErrorAlert } from "~/app/_components/error-alert";
import { Button } from "~/components/ui/button";
import { GlowPanel } from "~/components/ui/glow-panel";
import { useArtifactViewer } from "~/hooks/use-artifact-viewer";
import { useRepoFile } from "~/hooks/use-repo-file";
import { useCareerOpsDataSource } from "~/hooks/use-career-ops-data-source";
import { parseReportMarkdown } from "~/lib/career-ops/parse-report";

export function ArtifactPreviewSheet() {
  const { activeArtifact, closeArtifact } = useArtifactViewer();
  const { activeSource } = useCareerOpsDataSource();
  const { data, isLoading, error } = useRepoFile(
    activeSource,
    activeArtifact?.path ?? null,
  );

  if (!activeArtifact) {
    return null;
  }

  const isPdf = activeArtifact.path.toLowerCase().endsWith(".pdf");
  const meta =
    data?.encoding === "utf-8" ? parseReportMarkdown(data.content) : null;
  const pdfSrc =
    data?.encoding === "base64"
      ? `data:application/pdf;base64,${data.content}`
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/60 backdrop-blur-sm">
      <div className="flex h-full w-full max-w-3xl flex-col border-l border-white/10 bg-[#0f1024] shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs tracking-wide text-white/45 uppercase">
              {isPdf ? "PDF preview" : "Report preview"}
            </p>
            <h2 className="truncate text-lg font-semibold text-white">
              {activeArtifact.label ?? activeArtifact.path}
            </h2>
            <p className="mt-1 truncate text-xs text-white/50">
              {activeArtifact.path}
            </p>
          </div>
          <Button
            type="button"
            variant="brandSecondary"
            size="pillSm"
            onClick={closeArtifact}
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
                <Metric label="Source" value={meta.sourceUrl ?? "—"} />
              </dl>
            </GlowPanel>
          ) : null}

          {pdfSrc ? (
            <iframe
              title={activeArtifact.label ?? activeArtifact.path}
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
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs tracking-wide text-white/45 uppercase">{label}</dt>
      <dd className="mt-1 text-sm font-medium break-words text-white">
        {value}
      </dd>
    </div>
  );
}
