import "server-only";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import {
  createTRPCOptionsProxy,
  type TRPCQueryOptions,
} from "@trpc/tanstack-react-query";
import { cache } from "react";
import { createTRPCContext } from "~/server/trpc";
import { appRouter } from "~/server/routers/_app";
import { makeQueryClient } from "./query-client";

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

// Typed against the tRPC option-proxy's queryOptions return shape so call sites
// stay fully type-checked. Mirrors the tRPC server-components reference helper.
// Returns the promise so multiple prefetches can be awaited together via
// `Promise.all` (run concurrently, no waterfall).
export function prefetch<T extends ReturnType<TRPCQueryOptions<any>>>(
  queryOptions: T,
) {
  const queryClient = getQueryClient();
  return queryClient.prefetchQuery(queryOptions);
}
