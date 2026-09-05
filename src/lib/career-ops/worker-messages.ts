import type { ActivityHeatmap, ActivityHeatmapPeriod } from "~/lib/career-ops/activity-heatmap";
import type { ApplicationEntry } from "~/lib/career-ops/types";
import type { ParsedCareerOpsRepoData } from "~/lib/career-ops/parse-repo-data";

export type CareerOpsWorkerParseRequest = {
  type: "parse";
  id: number;
  payload: {
    applicationsMarkdown: string | null;
    pipelineMarkdown: string | null;
  };
};

export type CareerOpsWorkerHeatmapRequest = {
  type: "heatmap";
  id: number;
  payload: {
    applications: ApplicationEntry[];
    periodWeeks: ActivityHeatmapPeriod;
    locale?: string;
  };
};

export type CareerOpsWorkerRequest =
  | CareerOpsWorkerParseRequest
  | CareerOpsWorkerHeatmapRequest;

export type CareerOpsWorkerParseResponse = {
  type: "parse";
  id: number;
  payload: ParsedCareerOpsRepoData;
};

export type CareerOpsWorkerHeatmapResponse = {
  type: "heatmap";
  id: number;
  payload: ActivityHeatmap;
};

export type CareerOpsWorkerErrorResponse = {
  type: "error";
  id: number;
  message: string;
};

export type CareerOpsWorkerResponse =
  | CareerOpsWorkerParseResponse
  | CareerOpsWorkerHeatmapResponse
  | CareerOpsWorkerErrorResponse;
