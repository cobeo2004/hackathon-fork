import "server-only";
import {
  dehydrate,
  HydrationBoundary,
  type FetchQueryOptions,
} from "@tanstack/react-query";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { cache } from "react";
import { createTRPCContext } from "~/server/trpc";
import { appRouter } from "~/server/routers/_app";
import { makeQueryClient } from "./query-client";

// One query client per request.
export const getQueryClient = cache(makeQueryClient);

/**
 * Server-side options proxy. Generates the SAME query keys the client `useQuery`
 * reads, so an RSC `prefetch(trpc.x.queryOptions())` hydrates straight into the
 * client cache with no refetch.
 */
export const trpc = createTRPCOptionsProxy({
  ctx: () => createTRPCContext({ headers: new Headers() }),
  router: appRouter,
  queryClient: getQueryClient,
});

export function HydrateClient(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {props.children}
    </HydrationBoundary>
  );
}

export function prefetch(queryOptions: FetchQueryOptions) {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(queryOptions);
}
