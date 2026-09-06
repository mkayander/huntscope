import type { GitHubRepoSummary, SelectedRepo } from "~/lib/career-ops/types";

export function toSelectedRepo(repo: GitHubRepoSummary): SelectedRepo {
  return {
    owner: repo.owner,
    name: repo.name,
    fullName: repo.fullName,
  };
}

export function isSameSelectedRepo(
  left: SelectedRepo | null | undefined,
  right: SelectedRepo | null | undefined,
): boolean {
  if (!left || !right) {
    return false;
  }

  return left.fullName === right.fullName;
}
