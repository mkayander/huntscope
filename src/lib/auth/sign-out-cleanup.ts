import type { QueryClient } from "@tanstack/react-query";
import { del } from "idb-keyval";

import { DATA_SOURCE_PREFERENCE_KEY } from "~/lib/career-ops/data-source";
import { QUERY_PERSIST_KEY } from "~/lib/cache/query-persister";

function isGitHubTrpcQuery(queryKey: readonly unknown[]) {
  const path = queryKey[0];
  return Array.isArray(path) && path[0] === "github";
}

/** Clears client-side GitHub view state after sign-out. */
export async function clearGitHubViewState(queryClient: QueryClient) {
  queryClient.removeQueries({
    predicate: (query) => isGitHubTrpcQuery(query.queryKey),
  });

  await del(QUERY_PERSIST_KEY);

  if (typeof window === "undefined") {
    return;
  }

  const preference = window.sessionStorage.getItem(DATA_SOURCE_PREFERENCE_KEY);
  if (preference === "github") {
    window.sessionStorage.removeItem(DATA_SOURCE_PREFERENCE_KEY);
  }
}
