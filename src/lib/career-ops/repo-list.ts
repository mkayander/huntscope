import type { GitHubRepoSummary } from "~/lib/career-ops/types";

function getRepoSearchHaystack(repo: GitHubRepoSummary): string {
  return [
    repo.fullName,
    repo.owner,
    repo.name,
    repo.private ? "private" : "public",
    repo.description ?? "",
  ]
    .join(" ")
    .toLowerCase();
}

export function filterRepos(
  repos: GitHubRepoSummary[],
  searchQuery: string,
  options?: { alwaysIncludeFullName?: string | null },
): GitHubRepoSummary[] {
  const query = searchQuery.trim().toLowerCase();
  const pinnedFullName = options?.alwaysIncludeFullName?.trim();

  if (!query) {
    return repos;
  }

  const filtered = repos.filter((repo) => getRepoSearchHaystack(repo).includes(query));

  if (!pinnedFullName) {
    return filtered;
  }

  const pinned = repos.find((repo) => repo.fullName === pinnedFullName);
  if (!pinned || filtered.some((repo) => repo.fullName === pinnedFullName)) {
    return filtered;
  }

  return [pinned, ...filtered];
}

export function hasActiveRepoFilter(searchQuery: string): boolean {
  return searchQuery.trim().length > 0;
}
