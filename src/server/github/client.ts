import { TRPCError } from "@trpc/server";

import { parseApplicationsMarkdown } from "~/lib/career-ops/parse-applications";
import { parsePipelineMarkdown } from "~/lib/career-ops/parse-pipeline";
import type {
  CareerOpsRepoData,
  GitHubRepoSummary,
  RepoDataFile,
  SelectedRepo,
} from "~/lib/career-ops/types";
import { auth } from "~/server/auth";

const GITHUB_API_BASE = "https://api.github.com";

type GitHubRepoResponse = {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  updated_at: string;
  description: string | null;
  owner: {
    login: string;
  };
};

type GitHubContentResponse = {
  name: string;
  path: string;
  type: "file" | "dir" | "submodule" | "symlink";
  content?: string;
  encoding?: string;
  download_url?: string | null;
};

class GitHubApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "GitHubApiError";
  }
}

async function getGitHubAccessToken(headers: Headers): Promise<string> {
  try {
    const tokenResponse = await auth.api.getAccessToken({
      body: { useAccountCookie: true },
      headers,
    });

    if (!tokenResponse.accessToken) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "GitHub access token is unavailable. Sign in again with GitHub.",
      });
    }

    return tokenResponse.accessToken;
  } catch {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Could not read your GitHub access token. Sign in again with GitHub.",
    });
  }
}

async function githubRequest<T>(
  path: string,
  accessToken: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${GITHUB_API_BASE}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${accessToken}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new GitHubApiError(
      response.status,
      message || `GitHub API request failed (${response.status})`,
    );
  }

  return (await response.json()) as T;
}

async function fetchRepoFileContent(
  repo: SelectedRepo,
  filePath: string,
  accessToken: string,
): Promise<string | null> {
  try {
    const response = await githubRequest<GitHubContentResponse>(
      `/repos/${repo.owner}/${repo.name}/contents/${filePath}`,
      accessToken,
    );

    if (!response.content || response.encoding !== "base64") {
      return null;
    }

    return Buffer.from(response.content, "base64").toString("utf-8");
  } catch (error) {
    if (error instanceof GitHubApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

function toRepoDataFile(item: GitHubContentResponse): RepoDataFile | null {
  if (item.type !== "file" && item.type !== "dir") {
    return null;
  }

  return {
    path: item.path,
    name: item.name,
    type: item.type,
  };
}

async function repoHasCompanionData(
  owner: string,
  name: string,
  accessToken: string,
): Promise<boolean> {
  const checks = ["data/applications.md", "data/pipeline.md"] as const;

  for (const filePath of checks) {
    try {
      await githubRequest<GitHubContentResponse>(
        `/repos/${owner}/${name}/contents/${filePath}`,
        accessToken,
      );
      return true;
    } catch (error) {
      if (!(error instanceof GitHubApiError) || error.status !== 404) {
        throw error;
      }
    }
  }

  return false;
}

export async function listUserRepos(headers: Headers): Promise<GitHubRepoSummary[]> {
  const accessToken = await getGitHubAccessToken(headers);
  const repos = await githubRequest<GitHubRepoResponse[]>(
    "/user/repos?affiliation=owner&sort=updated&per_page=100",
    accessToken,
  );

  const companionChecks = await Promise.all(
    repos.map(async (repo) => ({
      repo,
      isCompanionRepo: await repoHasCompanionData(
        repo.owner.login,
        repo.name,
        accessToken,
      ),
    })),
  );

  return companionChecks
    .map(({ repo, isCompanionRepo }) => ({
      id: repo.id,
      owner: repo.owner.login,
      name: repo.name,
      fullName: repo.full_name,
      private: repo.private,
      updatedAt: repo.updated_at,
      description: repo.description,
      isCompanionRepo,
    }))
    .sort((left, right) => {
      if (left.isCompanionRepo !== right.isCompanionRepo) {
        return left.isCompanionRepo ? -1 : 1;
      }

      return right.updatedAt.localeCompare(left.updatedAt);
    });
}

export async function fetchCareerOpsRepoData(
  repo: SelectedRepo,
  headers: Headers,
): Promise<CareerOpsRepoData> {
  const accessToken = await getGitHubAccessToken(headers);

  const [applicationsContent, pipelineContent, dataDirectory, reportsDirectory] =
    await Promise.all([
      fetchRepoFileContent(repo, "data/applications.md", accessToken),
      fetchRepoFileContent(repo, "data/pipeline.md", accessToken),
      githubRequest<GitHubContentResponse[]>(
        `/repos/${repo.owner}/${repo.name}/contents/data`,
        accessToken,
      ).catch((error: unknown) => {
        if (error instanceof GitHubApiError && error.status === 404) {
          return [];
        }

        throw error;
      }),
      githubRequest<GitHubContentResponse[]>(
        `/repos/${repo.owner}/${repo.name}/contents/reports`,
        accessToken,
      ).catch((error: unknown) => {
        if (error instanceof GitHubApiError && error.status === 404) {
          return [];
        }

        throw error;
      }),
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
    applications: applicationsContent
      ? parseApplicationsMarkdown(applicationsContent)
      : [],
    pipeline: pipelineContent ? parsePipelineMarkdown(pipelineContent) : null,
    dataFiles: dataDirectory
      .map(toRepoDataFile)
      .filter((item): item is RepoDataFile => item !== null),
    reportsCount: reportsDirectory.filter((item) => item.type === "file").length,
  };
}
