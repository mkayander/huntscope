import { createGitHubAppJwt } from "~/server/github/app-auth";
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
    throw new Error(
      `GitHub API ${method} ${path} failed (${response.status}): ${text}`,
    );
  }

  return (await response.json()) as T;
}

export async function createInstallationAccessToken(installationId: number) {
  const appJwt = await createGitHubAppJwt();

  return githubFetch<{ token: string; expires_at: string }>({
    token: appJwt,
    path: `/app/installations/${installationId}/access_tokens`,
    method: "POST",
    body: {},
  });
}

export async function listInstallationRepositories(
  installationId: number,
): Promise<ConnectedRepository[]> {
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

export async function readRepositoryFile(
  installationId: number,
  repositoryFullName: string,
  filePath: string,
): Promise<string | null> {
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

    return Buffer.from(data.content, "base64").toString("utf8");
  } catch {
    return null;
  }
}
