import type { Query } from "@tanstack/react-query";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { del, get, set } from "idb-keyval";

export const QUERY_PERSIST_KEY = "huntscope-query-cache";
export const QUERY_PERSIST_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export const queryPersister = createAsyncStoragePersister({
  key: QUERY_PERSIST_KEY,
  throttleTime: 1000,
  storage: {
    getItem: async (key) => {
      const value = await get<string>(key);
      return value ?? null;
    },
    setItem: async (key, value) => {
      await set(key, value);
    },
    removeItem: async (key) => {
      await del(key);
    },
  },
});

export function isPersistedGitHubQuery(query: Query): boolean {
  const path = query.queryKey[0];
  if (!Array.isArray(path) || path[0] !== "github") {
    return false;
  }

  const procedure = path[1];
  return procedure === "listRepos" || procedure === "getRepoData";
}
