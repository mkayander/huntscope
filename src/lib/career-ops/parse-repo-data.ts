import {
  computeApplicationAnalytics,
  type ApplicationAnalytics,
} from "~/lib/career-ops/analytics";
import { parseApplicationsMarkdown } from "~/lib/career-ops/parse-applications";
import { parsePipelineMarkdown } from "~/lib/career-ops/parse-pipeline";
import type { ApplicationEntry, PipelineSummary } from "~/lib/career-ops/types";

export type ParsedCareerOpsRepoData = {
  applications: ApplicationEntry[];
  pipeline: PipelineSummary | null;
  analytics: ApplicationAnalytics;
};

export function parseCareerOpsRepoData(input: {
  applicationsMarkdown: string | null;
  pipelineMarkdown: string | null;
}): ParsedCareerOpsRepoData {
  const applications = input.applicationsMarkdown
    ? parseApplicationsMarkdown(input.applicationsMarkdown)
    : [];
  const pipeline = input.pipelineMarkdown
    ? parsePipelineMarkdown(input.pipelineMarkdown)
    : null;

  return {
    applications,
    pipeline,
    analytics: computeApplicationAnalytics(applications),
  };
}
