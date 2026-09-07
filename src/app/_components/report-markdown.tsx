"use client";

import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

import { clickableLinkClassName } from "~/components/ui/interaction";
import { stripReportFrontmatter } from "~/lib/career-ops/parse-report";
import { cn } from "~/lib/utils";

const markdownComponents: Components = {
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={clickableLinkClassName}
    >
      {children}
    </a>
  ),
};

type ReportMarkdownProps = {
  content: string;
  className?: string;
  stripFrontmatter?: boolean;
};

export function ReportMarkdown({
  content,
  className,
  stripFrontmatter = true,
}: ReportMarkdownProps) {
  const markdown = stripFrontmatter
    ? stripReportFrontmatter(content)
    : content.trim();

  return (
    <article className={cn("report-markdown", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={markdownComponents}
      >
        {markdown}
      </ReactMarkdown>
    </article>
  );
}
