import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query";
import SuperJSON from "superjson";

import { GITHUB_CACHE_GC_TIME_MS } from "~/lib/cache/github-query-options";

function shouldDehydrateQuery(query: Parameters<typeof defaultShouldDehydrateQuery>[0]) {
  return defaultShouldDehydrateQuery(query) && query.state.status !== "pending";
}

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: GITHUB_CACHE_GC_TIME_MS,
      },
      dehydrate: {
        serializeData: SuperJSON.serialize,
        shouldDehydrateQuery,
      },
      hydrate: {
        deserializeData: SuperJSON.deserialize,
      },
    },
  });
