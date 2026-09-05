import { TRPCError } from "@trpc/server";

import type {
  RawCareerOpsRepoData,
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
    readonly isRateLimited = false,
  ) {
    super(message);
    this.name = "GitHubApiError";
  }
}

export function isGitHubRateLimitError(error: unknown): boolean {
  return error instanceof GitHubApiError && error.isRateLimited;
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
    const isRateLimited =
      response.status === 403 && /rate limit exceeded/i.test(message);

    throw new GitHubApiError(
      response.status,
      isRateLimited
        ? "GitHub API rate limit reached. Please wait a few minutes and try again."
        : message || `GitHub API request failed (${response.status})`,
      isRateLimited,
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

export async function listUserRepos(headers: Headers): Promise<GitHubRepoSummary[]> {
  const accessToken = await getGitHubAccessToken(headers);
  const repos = await githubRequest<GitHubRepoResponse[]>(
    "/user/repos?affiliation=owner&sort=updated&per_page=100",
    accessToken,
  );

  return repos
    .map((repo) => ({
      id: repo.id,
      owner: repo.owner.login,
      name: repo.name,
      fullName: repo.full_name,
      private: repo.private,
      updatedAt: repo.updated_at,
      description: repo.description,
    }))
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export async function fetchCareerOpsRepoData(
  repo: SelectedRepo,
  headers: Headers,
): Promise<RawCareerOpsRepoData> {
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
    applicationsMarkdown: applicationsContent,
    pipelineMarkdown: pipelineContent,
    dataFiles: dataDirectory
      .map(toRepoDataFile)
      .filter((item): item is RepoDataFile => item !== null),
    reportsCount: reportsDirectory.filter((item) => item.type === "file").length,
  };
}
