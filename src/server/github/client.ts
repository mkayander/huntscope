import { TRPCError } from "@trpc/server";

import { buildCareerOpsRepoData } from "~/lib/career-ops/layout";
import {
  repositoryHasCareerOpsLayout,
  resolveCareerOpsLayout,
} from "~/lib/career-ops/resolve-layout";
import type {
  GitHubRepoSummary,
  RawCareerOpsRepoData,
  SelectedRepo,
} from "~/lib/career-ops/types";
import {
  getRepositoryDefaultBranch,
  listRepositoryContents,
  readRepositoryFile,
  readRepositoryFilePayload,
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

async function checkRepositoryHasCareerOpsLayout(
  installationId: number,
  fullName: string,
): Promise<boolean> {
  return repositoryHasCareerOpsLayout({
    readFile: (path) => readRepositoryFile(installationId, fullName, path),
    listDirectory: (path) =>
      listRepositoryContents(installationId, fullName, path),
  });
}

export function isGitHubRateLimitError(error: unknown): boolean {
  return error instanceof Error && /rate limit exceeded/i.test(error.message);
}

export async function listUserRepos(
  userId: string,
): Promise<GitHubRepoSummary[]> {
  const connection = await getAuthorizedInstallation(userId);

  const repos = await Promise.all(
    connection.repositories.map(async (repository) => {
      const parsed = parseRepoFullName(repository.fullName);

      if (!parsed) {
        return null;
      }

      const hasCareerOpsLayout = await checkRepositoryHasCareerOpsLayout(
        connection.installationId,
        repository.fullName,
      );

      const summary: GitHubRepoSummary = {
        id: repository.id,
        owner: parsed.owner,
        name: parsed.name,
        fullName: repository.fullName,
        private: true,
        updatedAt: connection.connectedAt,
        description: null,
        hasCareerOpsLayout,
      };

      return summary;
    }),
  );

  return repos
    .filter((repo): repo is GitHubRepoSummary => repo != null)
    .sort((left, right) => {
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

  const resolved = await resolveCareerOpsLayout({
    readFile: (path) =>
      readRepositoryFile(connection.installationId, repo.fullName, path),
    listDirectory: (path) =>
      listRepositoryContents(connection.installationId, repo.fullName, path),
  });

  if (!resolved) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message:
        "This repository does not look like a career-ops project or companion repo. Expected files such as data/applications.md or data/pipeline.md.",
    });
  }

  const { applicationsMarkdown, pipelineMarkdown, ...layout } = resolved;

  const [dataDirectory, reportsDirectory, outputDirectory, defaultBranch] =
    await Promise.all([
      listRepositoryContents(
        connection.installationId,
        repo.fullName,
        layout.dataDir,
      ),
      listRepositoryContents(
        connection.installationId,
        repo.fullName,
        layout.reportsDir,
      ),
      listRepositoryContents(
        connection.installationId,
        repo.fullName,
        layout.outputDir,
      ),
      getRepositoryDefaultBranch(connection.installationId, repo.fullName),
    ]);

  try {
    return buildCareerOpsRepoData({
      owner: repo.owner,
      name: repo.name,
      fullName: repo.fullName,
      defaultBranch,
      layout,
      applicationsMarkdown,
      pipelineMarkdown,
      dataDirectory,
      reportsDirectory,
      outputDirectory,
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

export async function assertRepoInInstallation(
  userId: string,
  repo: SelectedRepo,
): Promise<void> {
  await getAuthorizedInstallation(userId, repo);
}

export async function fetchRepoFile(
  repo: SelectedRepo,
  userId: string,
  filePath: string,
) {
  const connection = await getAuthorizedInstallation(userId, repo);
  const payload = await readRepositoryFilePayload(
    connection.installationId,
    repo.fullName,
    filePath,
  );

  if (!payload) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Could not read ${filePath} from ${repo.fullName}.`,
    });
  }

  return payload;
}
