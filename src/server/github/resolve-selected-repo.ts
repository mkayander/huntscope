import "server-only";

import type { SelectedRepo } from "~/lib/career-ops/types";
import { getInstallationConnection } from "~/server/github/installation-store";
import {
  clearSelectedRepoCookie,
  getSelectedRepoFromCookies,
} from "~/server/github/selected-repo";

type ResolveSelectedRepoOptions = {
  clearIfInvalid?: boolean;
};

export async function resolveSelectedRepoForUser(
  userId: string,
  options: ResolveSelectedRepoOptions = {},
): Promise<SelectedRepo | null> {
  const { clearIfInvalid = false } = options;
  const saved = await getSelectedRepoFromCookies();

  if (!saved) {
    return null;
  }

  const connection = await getInstallationConnection(userId);

  if (!connection) {
    return saved;
  }

  const isAccessible = connection.repositories.some(
    (repository) => repository.fullName === saved.fullName,
  );

  if (!isAccessible) {
    if (clearIfInvalid) {
      await clearSelectedRepoCookie();
    }
    return null;
  }

  return saved;
}

export function readSelectedRepoForUser(userId: string) {
  return resolveSelectedRepoForUser(userId, { clearIfInvalid: false });
}
