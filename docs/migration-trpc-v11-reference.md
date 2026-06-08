# tRPC v11 + TanStack React Query + Next 16 — Authoritative API Reference

> Verified via context7 (`/trpc/trpc`) on 2026-06-08 for `@trpc/*@11.13`,
> `@tanstack/react-query@5.101`, `next@16.2.7`, `zod@4.4`. This OVERRIDES any
> conflicting snippet in `docs/migration-nextjs-trpc-plan.md`. When the plan and
> this file disagree, follow THIS file. The plan's task ordering still applies.

## Project layout (ROOT app — NOT `app/`)

The Vite app now lives in `legacy/`. The Next.js app is the **repo root**.

- Source of truth to PORT FROM: `legacy/src/...` (App.tsx, pages/, components/, index.css)
- New Next app files: repo-root `src/...`
- `data/` + `lib/` already copied to root `src/data` + `src/lib` (routers consume these)
- Path alias: `~/*` → `./src/*` (tsconfig `paths`)
- Demo-green check until cutover: `cd legacy && npm run dev` (Vite). New app: `npm run dev` (Next, at root).

## 1. Server init — `src/server/trpc.ts`

```ts
import { initTRPC } from "@trpc/server";

export const createTRPCContext = async (_opts: { headers: Headers }) => {
  // Today empty; later: db client, auth/session.
  return {};
};

const t = initTRPC
  .context<Awaited<ReturnType<typeof createTRPCContext>>>()
  .create({
    sse: {
      ping: { enabled: true, intervalMs: 2000 },
      client: { reconnectAfterInactivityMs: 5000 },
    },
  });

export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;
```

## 2. Query routers — `src/server/routers/*.ts`

Read from `~/data` and `~/lib`. REAL export names (verified):
- `~/data/demo`: `SITES`, `NODES`, `BASELINE_ROUTE`, `OPTIMIZED_ROUTE`, `COSTS`, `POINTS_BY_ID`, `VEHICLE`, `COLLECTION_SITE_IDS`
- `~/data/asset`: `FEATURED_ASSET`, `HEALTH_SERIES`, `LATEST_READING`, `LATEST_RISK`, `PASSPORT_EVENTS`, `collectionScheduledEvent()`
- `~/lib/cost`: `buildComparison(collectionStops = 4)` returns `Comparison`
- `~/data/types`: `Site`, `LogisticsNode`, `Route`, `HealthReading`, `PassportEvent`, etc.

Passport events come from `PASSPORT_EVENTS` (NOT `FEATURED_ASSET.passport` — that does not exist).

```ts
// sites.ts
import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { SITES } from "~/data/demo";

export const sitesRouter = router({
  list: publicProcedure.query(() => SITES),
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      const site = SITES.find((s) => s.site_id === input.id);
      if (!site) throw new Error(`Unknown site: ${input.id}`);
      return site;
    }),
});
```

```ts
// passport.ts
import { publicProcedure, router } from "../trpc";
import { PASSPORT_EVENTS } from "~/data/asset";

export const passportRouter = router({
  events: publicProcedure.query(() => PASSPORT_EVENTS),
});
```

```ts
// health.ts featured query
import { publicProcedure, router } from "../trpc";
import { FEATURED_ASSET, HEALTH_SERIES } from "~/data/asset";

export const healthRouter = router({
  featured: publicProcedure.query(() => ({
    asset: FEATURED_ASSET,
    readings: HEALTH_SERIES,
  })),
  // live: see §3
});
```

## 3. SSE subscription — `health.live` (in `src/server/routers/health.ts`)

`tracked()` from `@trpc/server`. Async generator + `opts.signal`. Deterministic — NO `Date.now()`.

```ts
import { tracked } from "@trpc/server";
import { z } from "zod";

export interface HealthTick {
  seq: number;
  timestamp: string;
  risk_score: number;
}

// in the router:
live: publicProcedure
  .input(z.object({ lastEventId: z.string().nullish() }).optional())
  .subscription(async function* (opts) {
    let seq = opts.input?.lastEventId ? Number(opts.input.lastEventId) : 0;
    while (!opts.signal?.aborted) {
      await new Promise<void>((resolve) => {
        const id = setTimeout(resolve, 1500);
        opts.signal?.addEventListener("abort", () => clearTimeout(id), { once: true });
      });
      if (opts.signal?.aborted) return;
      seq += 1;
      const base = 0.6;
      const risk = Math.min(1, Math.max(0, base + ((seq % 7) - 3) * 0.03));
      const payload: HealthTick = {
        seq,
        timestamp: `T+${seq * 1500}ms`,
        risk_score: Math.round(risk * 100) / 100,
      };
      yield tracked(String(seq), payload);
    }
  }),
```

## 4. App router + RSC context — `src/server/routers/_app.ts`, `src/server/caller.ts`

```ts
// _app.ts
import { router } from "../trpc";
import { sitesRouter } from "./sites";
import { routesRouter } from "./routes";
import { comparisonRouter } from "./comparison";
import { healthRouter } from "./health";
import { passportRouter } from "./passport";

export const appRouter = router({
  sites: sitesRouter,
  routes: routesRouter,
  comparison: comparisonRouter,
  health: healthRouter,
  passport: passportRouter,
});
export type AppRouter = typeof appRouter;
```

## 5. Fetch route handler — `src/app/api/trpc/[trpc]/route.ts`

```ts
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createTRPCContext } from "~/server/trpc";
import { appRouter } from "~/server/routers/_app";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ headers: req.headers }),
  });

export { handler as GET, handler as POST };
```

## 6. Client provider — `src/trpc/client.tsx` (`'use client'`)

`createTRPCContext` → `{ TRPCProvider, useTRPC }`. `splitLink` routes subscriptions to SSE.

```tsx
"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import {
  createTRPCClient,
  httpBatchLink,
  httpSubscriptionLink,
  splitLink,
} from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import { useState } from "react";
import type { AppRouter } from "~/server/routers/_app";
import { makeQueryClient } from "./query-client";

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

let browserQueryClient: ReturnType<typeof makeQueryClient> | undefined;
function getQueryClient() {
  if (typeof window === "undefined") return makeQueryClient();
  return (browserQueryClient ??= makeQueryClient());
}

function getUrl() {
  const base = typeof window !== "undefined" ? "" : "http://localhost:3000";
  return `${base}/api/trpc`;
}

export function TRPCReactProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        splitLink({
          condition: (op) => op.type === "subscription",
          true: httpSubscriptionLink({ url: getUrl() }),
          false: httpBatchLink({ url: getUrl() }),
        }),
      ],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
```

```ts
// src/trpc/query-client.ts
import { QueryClient } from "@tanstack/react-query";
export function makeQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { staleTime: 30 * 1000 } } });
}
```

## 7. Server prefetch — `src/trpc/server.tsx` (USE THE OPTIONS PROXY)

THIS is the corrected pattern. `createTRPCOptionsProxy` makes server prefetch and
client `useQuery` derive the SAME query key automatically. Do NOT hand-write
`queryKey` arrays. File is `.tsx` (it returns JSX in `HydrateClient`).

```tsx
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

export const getQueryClient = cache(makeQueryClient);

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
```

## 8. Page prefetch pattern — RSC `page.tsx`

Parallel prefetch (no waterfall), then render the client section in `HydrateClient`.

```tsx
import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { ProblemSection } from "~/components/problem/ProblemSection";

export default function ProblemPage() {
  prefetch(trpc.sites.list.queryOptions());
  prefetch(trpc.health.featured.queryOptions());
  return (
    <HydrateClient>
      <ProblemSection />
    </HydrateClient>
  );
}
```

`prefetch` is fire-and-forget (`void prefetchQuery`); calling several back-to-back
runs them concurrently — no `await` waterfall. The page does NOT need to be `async`.

## 9. Client read — section components (`'use client'`)

```tsx
"use client";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/client";

export function ProblemSection() {
  const trpc = useTRPC();
  const { data: sites } = useQuery(trpc.sites.list.queryOptions());
  const { data: featured } = useQuery(trpc.health.featured.queryOptions());
  // ...port JSX from legacy/src/pages/ProblemPage.tsx, sourcing from sites/featured
}
```

## 10. SSE client hook — `src/hooks/useHealthStream.ts` (`'use client'`)

Use `useSubscription` + `subscriptionOptions`. `onData` receives the PAYLOAD
DIRECTLY (tracked id is unwrapped by the integration) — it is a `HealthTick`,
NOT `{ id, data }`.

```ts
"use client";
import { useSubscription } from "@trpc/tanstack-react-query";
import { useState } from "react";
import { useTRPC } from "~/trpc/client";
import type { HealthTick } from "~/server/routers/health";

export function useHealthStream() {
  const trpc = useTRPC();
  const [ticks, setTicks] = useState<HealthTick[]>([]);

  useSubscription(
    trpc.health.live.subscriptionOptions(
      { lastEventId: null },
      {
        onData: (tick: HealthTick) => {
          setTicks((prev) => [...prev.slice(-19), tick]);
        },
        onError: (err) => console.error("health.live error", err),
      },
    ),
  );

  return ticks;
}
```

## Hard rules (RSC boundaries)

- Components read via `useTRPC()` + `useQuery`, NEVER import `~/data` directly.
  EXCEPTION: `useSimulation` keeps importing `~/data/demo` geometry — it is client
  animation math, explicitly exempt per spec.
- `'use client'` on: provider, every section, MapView, all chart/interactive
  components using hooks/state/refs/events, useHealthStream.
- MapView: `'use client'` + imported via `next/dynamic` with `{ ssr: false }`
  (Leaflet touches `window`).
- Only JSON-serializable props cross server→client (no Date/Map/class/function).
- `next.config.ts`: `cacheComponents: true`. Do NOT wrap tRPC prefetch in `'use cache'`.
```
