export type ApplicationEntry = {
  num: number;
  date: string;
  company: string;
  role: string;
  score: string;
  status: string;
  pdf: string;
  report: string;
  notes: string;
};

export type PipelineSummary = {
  pendingCount: number;
  processedCount: number;
  pendingPreview: string[];
};

export type RepoDataFile = {
  path: string;
  name: string;
  type: "file" | "dir";
};

export type RawCareerOpsRepoData = {
  owner: string;
  name: string;
  fullName: string;
  applicationsMarkdown: string | null;
  pipelineMarkdown: string | null;
  dataFiles: RepoDataFile[];
  reportsCount: number;
};

/** @deprecated Use RawCareerOpsRepoData on the server and ParsedCareerOpsRepoData in the client worker. */
export type CareerOpsRepoData = RawCareerOpsRepoData;

export type GitHubRepoSummary = {
  id: number;
  owner: string;
  name: string;
  fullName: string;
  private: boolean;
  updatedAt: string;
  description: string | null;
  isCompanionRepo: boolean;
};

export type SelectedRepo = {
  owner: string;
  name: string;
  fullName: string;
};
