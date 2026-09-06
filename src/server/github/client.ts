import { TRPCError } from "@trpc/server";

import {
  buildCareerOpsRepoData,
  CAREER_OPS_PATHS,
} from "~/lib/career-ops/layout";
import type {
  GitHubRepoSummary,
  RawCareerOpsRepoData,
  SelectedRepo,
} from "~/lib/career-ops/types";
import {
  listRepositoryContents,
  readRepositoryFile,
} from "~/server/github/api";
import { isGitHubAppConfigured } from "~/server/github/config";
import { getInstallationConnection } from "~/server/github/installation-store";

function parseRepoFullName(fullName: string) {
  const [owner, name] = fullName.split("/");

  if (!owner || !name) {
    return null;
  }

  return { owner, name };
}

async function getAuthorizedInstallation(userId: string, repo?: SelectedRepo) {
  if (!isGitHubAppConfigured()) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "GitHub App is not configured on this deployment.",
    });
  }

  const connection = await getInstallationConnection(userId);

  if (!connection) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message:
        "Connect a GitHub repository through the Huntscope GitHub App first.",
    });
  }

  if (
    repo &&
    !connection.repositories.some(
      (repository) => repository.fullName === repo.fullName,
    )
  ) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message:
        "That repository is not available in your GitHub App installation.",
    });
  }

  return connection;
}

async function repositoryHasCareerOpsLayout(
  installationId: number,
  fullName: string,
): Promise<boolean> {
  const [applicationsContent, pipelineContent] = await Promise.all([
    readRepositoryFile(installationId, fullName, CAREER_OPS_PATHS.applications),
    readRepositoryFile(installationId, fullName, CAREER_OPS_PATHS.pipeline),
  ]);

  return Boolean(applicationsContent ?? pipelineContent);
}

export function isGitHubRateLimitError(error: unknown): boolean {
  return error instanceof Error && /rate limit exceeded/i.test(error.message);
}

export async function listUserRepos(
  userId: string,
): Promise<GitHubRepoSummary[]> {
  const connection = await getAuthorizedInstallation(userId);

  const repos: GitHubRepoSummary[] = [];

  for (const repository of connection.repositories) {
    const parsed = parseRepoFullName(repository.fullName);

    if (!parsed) {
      continue;
    }

    const hasCareerOpsLayout = await repositoryHasCareerOpsLayout(
      connection.installationId,
      repository.fullName,
    );

    repos.push({
      id: repository.id,
      owner: parsed.owner,
      name: parsed.name,
      fullName: repository.fullName,
      private: true,
      updatedAt: connection.connectedAt,
      description: null,
      hasCareerOpsLayout,
    });
  }

  return repos.sort((left, right) => {
    if (left.hasCareerOpsLayout !== right.hasCareerOpsLayout) {
      return left.hasCareerOpsLayout ? -1 : 1;
    }

    return right.updatedAt.localeCompare(left.updatedAt);
  });
}

export async function fetchCareerOpsRepoData(
  repo: SelectedRepo,
  userId: string,
): Promise<RawCareerOpsRepoData> {
  const connection = await getAuthorizedInstallation(userId, repo);

  const [
    applicationsContent,
    pipelineContent,
    dataDirectory,
    reportsDirectory,
  ] = await Promise.all([
    readRepositoryFile(
      connection.installationId,
      repo.fullName,
      CAREER_OPS_PATHS.applications,
    ),
    readRepositoryFile(
      connection.installationId,
      repo.fullName,
      CAREER_OPS_PATHS.pipeline,
    ),
    listRepositoryContents(
      connection.installationId,
      repo.fullName,
      CAREER_OPS_PATHS.dataDir,
    ),
    listRepositoryContents(
      connection.installationId,
      repo.fullName,
      CAREER_OPS_PATHS.reportsDir,
    ),
  ]);

  try {
    return buildCareerOpsRepoData({
      owner: repo.owner,
      name: repo.name,
      fullName: repo.fullName,
      applicationsMarkdown: applicationsContent,
      pipelineMarkdown: pipelineContent,
      dataDirectory,
      reportsDirectory,
    });
  } catch (error) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message:
        error instanceof Error
          ? error.message
          : "This repository does not look like a career-ops data repo.",
    });
  }
}
