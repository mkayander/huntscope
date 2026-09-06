import { QueryClient } from "@tanstack/react-query";
import { del } from "idb-keyval";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DATA_SOURCE_PREFERENCE_KEY } from "~/lib/career-ops/data-source";
import { QUERY_PERSIST_KEY } from "~/lib/cache/query-persister";
import {
  clearGitHubViewState,
  isGitHubTrpcQueryKey,
} from "~/lib/auth/sign-out-cleanup";

vi.mock("idb-keyval", () => ({
  del: vi.fn(),
}));

describe("isGitHubTrpcQueryKey", () => {
  it("matches tRPC GitHub procedure keys", () => {
    expect(
      isGitHubTrpcQueryKey([["github", "getRepoData"], { type: "query" }]),
    ).toBe(true);
    expect(
      isGitHubTrpcQueryKey([["local-career-ops"], { type: "query" }]),
    ).toBe(false);
  });
});

describe("clearGitHubViewState", () => {
  beforeEach(() => {
    vi.mocked(del).mockResolvedValue(undefined);
    const store = new Map<string, string>();
    vi.stubGlobal("window", {
      sessionStorage: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => {
          store.set(key, value);
        },
        removeItem: (key: string) => {
          store.delete(key);
        },
        clear: () => {
          store.clear();
        },
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("removes GitHub queries, persisted cache, and github preference", async () => {
    const queryClient = new QueryClient();
    const removeQueries = vi.spyOn(queryClient, "removeQueries");

    window.sessionStorage.setItem(DATA_SOURCE_PREFERENCE_KEY, "github");

    await clearGitHubViewState(queryClient);

    expect(removeQueries).toHaveBeenCalledWith({
      predicate: expect.any(Function) as (query: {
        queryKey: readonly unknown[];
      }) => boolean,
    });

    const predicate = removeQueries.mock.calls[0]?.[0]?.predicate;
    expect(predicate?.({ queryKey: [["github", "listRepos"]] } as never)).toBe(
      true,
    );
    expect(predicate?.({ queryKey: [["local-career-ops"]] } as never)).toBe(
      false,
    );

    expect(del).toHaveBeenCalledWith(QUERY_PERSIST_KEY);
    expect(
      window.sessionStorage.getItem(DATA_SOURCE_PREFERENCE_KEY),
    ).toBeNull();
  });

  it("preserves a local data-source preference", async () => {
    const queryClient = new QueryClient();

    window.sessionStorage.setItem(DATA_SOURCE_PREFERENCE_KEY, "local");

    await clearGitHubViewState(queryClient);

    expect(window.sessionStorage.getItem(DATA_SOURCE_PREFERENCE_KEY)).toBe(
      "local",
    );
  });
});
