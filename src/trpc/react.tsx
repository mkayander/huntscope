"use client";

import { type QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { httpBatchLink, httpBatchStreamLink, splitLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import { useState } from "react";
import SuperJSON from "superjson";

import {
  isPersistedGitHubQuery,
  QUERY_PERSIST_MAX_AGE_MS,
  queryPersister,
} from "~/lib/cache/query-persister";
import type { AppRouter } from "~/server/api/router-type";
import { createQueryClient } from "./query-client";

let clientQueryClientSingleton: QueryClient | undefined = undefined;
const getQueryClient = () => {
  if (typeof window === "undefined") {
    return createQueryClient();
  }

  clientQueryClientSingleton ??= createQueryClient();
  return clientQueryClientSingleton;
};

export const api = createTRPCReact<AppRouter>();

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

export function TRPCReactProvider(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  const [trpcClient] = useState(() => {
    const url = getBaseUrl() + "/api/trpc";
    const headers = () => {
      const nextHeaders = new Headers();
      nextHeaders.set("x-trpc-source", "nextjs-react");
      return nextHeaders;
    };

    return api.createClient({
      links: [
        splitLink({
          // Streaming responses commit headers before procedures run, so mutations
          // that set cookies (e.g. selectRepo) must use the non-streaming link.
          condition: (operation) => operation.type === "mutation",
          true: httpBatchLink({
            transformer: SuperJSON,
            url,
            headers,
          }),
          false: httpBatchStreamLink({
            transformer: SuperJSON,
            url,
            headers,
          }),
        }),
      ],
    });
  });

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: queryPersister,
        maxAge: QUERY_PERSIST_MAX_AGE_MS,
        dehydrateOptions: {
          shouldDehydrateQuery: (query) =>
            isPersistedGitHubQuery(query) && query.state.status === "success",
          serializeData: SuperJSON.serialize,
        },
      }}
    >
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {props.children}
      </api.Provider>
    </PersistQueryClientProvider>
  );
}

function getBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}
