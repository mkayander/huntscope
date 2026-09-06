import { createGitHubAppJwt } from "~/server/github/app-auth";
import { requireGitHubAppConfig } from "~/server/github/config";
import {
  getCachedInstallationToken,
  setCachedInstallationToken,
} from "~/server/github/installation-token-cache";
import type { ConnectedRepository } from "~/server/github/types";

type GitHubFetchOptions = {
  token: string;
  path: string;
  method?: "GET" | "POST";
  body?: unknown;
};

async function githubFetch<T>({
  token,
  path,
  method = "GET",
  body,
}: GitHubFetchOptions): Promise<T> {
  const response = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "huntscope",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new GitHubApiError(method, path, response.status, text);
  }

  return (await response.json()) as T;
}

class GitHubApiError extends Error {
  constructor(
    method: string,
    path: string,
    readonly status: number,
    body: string,
  ) {
    super(`GitHub API ${method} ${path} failed (${status}): ${body}`);
    this.name = "GitHubApiError";
  }
}

function isGitHubApiError(error: unknown): error is GitHubApiError {
  return error instanceof GitHubApiError;
}

function decodeGitHubBase64Content(content: string): string {
  const normalized = content.replace(/\s/g, "");
  return Buffer.from(normalized, "base64").toString("utf8");
}

async function getInstallationToken(installationId: number): Promise<string> {
  const cachedToken = getCachedInstallationToken(installationId);

  if (cachedToken) {
    return cachedToken;
  }

  const appJwt = await createGitHubAppJwt();
  const { token, expires_at } = await githubFetch<{
    token: string;
    expires_at: string;
  }>({
    token: appJwt,
    path: `/app/installations/${installationId}/access_tokens`,
    method: "POST",
    body: {},
  });

  setCachedInstallationToken(installationId, token, expires_at);
  return token;
}

export async function getGitHubUserProfile(userAccessToken: string) {
  return githubFetch<{ id: number; login: string }>({
    token: userAccessToken,
    path: "/user",
  });
}

type AppInstallationAccount = {
  login: string;
  id: number;
  type: string;
};

export type AppInstallation = {
  id: number;
  app_id: number;
  app_slug: string;
  account: AppInstallationAccount;
};

async function githubFetchWithAppJwt<T>(path: string): Promise<T> {
  const appJwt = await createGitHubAppJwt();
  return githubFetch<T>({
    token: appJwt,
    path,
  });
}

export async function getAppInstallationForUser(
  username: string,
): Promise<AppInstallation | null> {
  try {
    return await githubFetchWithAppJwt<AppInstallation>(
      `/users/${encodeURIComponent(username)}/installation`,
    );
  } catch (error) {
    if (isGitHubApiError(error) && error.status === 404) {
      return null;
    }

    throw error;
  }
}

export async function getAppInstallation(
  installationId: number,
): Promise<AppInstallation> {
  return githubFetchWithAppJwt<AppInstallation>(
    `/app/installations/${installationId}`,
  );
}

async function isOrganizationMember(
  organizationLogin: string,
  username: string,
  userAccessToken: string,
): Promise<boolean> {
  const response = await fetch(
    `https://api.github.com/orgs/${encodeURIComponent(organizationLogin)}/members/${encodeURIComponent(username)}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${userAccessToken}`,
        "User-Agent": "huntscope",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
  );

  return response.status === 204;
}

export async function verifyUserCanAccessInstallation(
  installationId: number,
  githubLogin: string,
  userAccessToken: string,
): Promise<boolean> {
  const installation = await getAppInstallation(installationId);
  const normalizedLogin = githubLogin.toLowerCase();

  if (installation.account.type === "User") {
    return installation.account.login.toLowerCase() === normalizedLogin;
  }

  if (installation.account.type === "Organization") {
    return isOrganizationMember(
      installation.account.login,
      githubLogin,
      userAccessToken,
    );
  }

  return false;
}

export async function createInstallationAccessToken(installationId: number) {
  const token = await getInstallationToken(installationId);
  return { token };
}

export async function listInstallationRepositories(
  installationId: number,
): Promise<ConnectedRepository[]> {
  requireGitHubAppConfig();
  const { token } = await createInstallationAccessToken(installationId);

  const data = await githubFetch<{
    repositories: Array<{ id: number; full_name: string }>;
  }>({
    token,
    path: "/installation/repositories?per_page=100",
  });

  return data.repositories.map((repository) => ({
    id: repository.id,
    fullName: repository.full_name,
  }));
}

export async function getRepositoryDefaultBranch(
  installationId: number,
  repositoryFullName: string,
): Promise<string | null> {
  requireGitHubAppConfig();
  const { token } = await createInstallationAccessToken(installationId);

  try {
    const data = await githubFetch<{ default_branch: string }>({
      token,
      path: `/repos/${repositoryFullName}`,
    });

    return data.default_branch ?? null;
  } catch (error) {
    if (error instanceof Error && error.message.includes("(404)")) {
      return null;
    }

    throw error;
  }
}

export async function readRepositoryFile(
  installationId: number,
  repositoryFullName: string,
  filePath: string,
): Promise<string | null> {
  requireGitHubAppConfig();
  const { token } = await createInstallationAccessToken(installationId);

  try {
    const data = await githubFetch<{
      content: string;
      encoding: string;
    }>({
      token,
      path: `/repos/${repositoryFullName}/contents/${filePath}`,
    });

    if (data.encoding !== "base64") {
      return null;
    }

    return decodeGitHubBase64Content(data.content);
  } catch (error) {
    if (error instanceof Error && error.message.includes("(404)")) {
      return null;
    }

    throw error;
  }
}

type GitHubContentItem = {
  name: string;
  path: string;
  type: "file" | "dir" | "submodule" | "symlink";
};

export async function listRepositoryContents(
  installationId: number,
  repositoryFullName: string,
  directoryPath: string,
): Promise<GitHubContentItem[]> {
  requireGitHubAppConfig();
  const { token } = await createInstallationAccessToken(installationId);

  try {
    const data = await githubFetch<GitHubContentItem | GitHubContentItem[]>({
      token,
      path: `/repos/${repositoryFullName}/contents/${directoryPath}`,
    });

    return Array.isArray(data) ? data : [];
  } catch (error) {
    if (error instanceof Error && error.message.includes("(404)")) {
      return [];
    }

    throw error;
  }
}
