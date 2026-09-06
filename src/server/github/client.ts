import { TRPCError } from "@trpc/server";

import type {
  GitHubRepoSummary,
  RawCareerOpsRepoData,
  RepoDataFile,
  SelectedRepo,
} from "~/lib/career-ops/types";
import {
  listRepositoryContents,
  readRepositoryFile,
} from "~/server/github/api";
import { isGitHubAppConfigured } from "~/server/github/config";
import { getInstallationConnection } from "~/server/github/installation-store";

function toRepoDataFile(item: {
  path: string;
  name: string;
  type: string;
}): RepoDataFile | null {
  if (item.type !== "file" && item.type !== "dir") {
    return null;
  }

  return {
    path: item.path,
    name: item.name,
    type: item.type,
  };
}

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

export function isGitHubRateLimitError(error: unknown): boolean {
  return error instanceof Error && /rate limit exceeded/i.test(error.message);
}

export async function listUserRepos(
  userId: string,
): Promise<GitHubRepoSummary[]> {
  const connection = await getAuthorizedInstallation(userId);

  return connection.repositories.flatMap((repository) => {
    const parsed = parseRepoFullName(repository.fullName);

    if (!parsed) {
      return [];
    }

    return [
      {
        id: repository.id,
        owner: parsed.owner,
        name: parsed.name,
        fullName: repository.fullName,
        private: true,
        updatedAt: connection.connectedAt,
        description: null,
      },
    ];
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
      "data/applications.md",
    ),
    readRepositoryFile(
      connection.installationId,
      repo.fullName,
      "data/pipeline.md",
    ),
    listRepositoryContents(connection.installationId, repo.fullName, "data"),
    listRepositoryContents(connection.installationId, repo.fullName, "reports"),
  ]);

  if (!applicationsContent && !pipelineContent && dataDirectory.length === 0) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message:
        "This repository does not look like a career-ops data repo. Expected files such as data/applications.md or data/pipeline.md.",
    });
  }

  return {
    owner: repo.owner,
    name: repo.name,
    fullName: repo.fullName,
    applicationsMarkdown: applicationsContent,
    pipelineMarkdown: pipelineContent,
    dataFiles: dataDirectory
      .map(toRepoDataFile)
      .filter((item): item is RepoDataFile => item !== null),
    reportsCount: reportsDirectory.filter((item) => item.type === "file")
      .length,
  };
}
