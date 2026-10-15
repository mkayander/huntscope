export type ApplicationEntry = {
  num: number;
  date: string;
  company: string;
  via: string;
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

export type CareerOpsResolvedLayout = {
  dataRoot: string;
  applicationsPath: string;
  pipelinePath: string;
  applicationsWritePath: string;
  pipelineWritePath: string;
  dataDir: string;
  reportsDir: string;
  outputDir: string;
};

export type RawCareerOpsRepoData = {
  owner: string;
  name: string;
  fullName: string;
  defaultBranch: string | null;
  layout: CareerOpsResolvedLayout;
  applicationsMarkdown: string | null;
  pipelineMarkdown: string | null;
  dataFiles: RepoDataFile[];
  reportFiles: RepoDataFile[];
  outputFiles: RepoDataFile[];
  reportsCount: number;
};

export type GitHubRepoSummary = {
  id: number;
  owner: string;
  name: string;
  fullName: string;
  private: boolean;
  updatedAt: string;
  description: string | null;
  hasCareerOpsLayout: boolean;
};

export type SelectedRepo = {
  owner: string;
  name: string;
  fullName: string;
};
