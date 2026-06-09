# Next.js + tRPC Migration Implementation Plan

> **For agentic workers:** Implement task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. After EVERY task, the demo must still run (`cd app && npm run dev` for Vite until cutover; `npm run dev:next` for Next once it exists). Consult the skill named in each task before writing code.

**Goal:** Migrate the SolarCycle AI Vite SPA to Next.js 16 (App Router) + tRPC v11, establishing a typed server boundary with SSR-first reads, while keeping the demo green at every step.

**Architecture:** RSC route shells prefetch tRPC queries and hydrate them client-side; all static reads move behind tRPC routers (today returning the existing `data/` constants); the truck simulation stays a client RAF island; one SSE subscription (`health.live`) proves the streaming path. Next.js is scaffolded alongside Vite and Vite is removed only after a verified cutover.

**Tech Stack:** Next.js 16, React 19, tRPC v11, @tanstack/react-query v5, Zod, Tailwind v4, Leaflet.

**Working dir:** All paths relative to repo root `/Users/cobeo/Codes/hackathon`. The app lives in `app/`.

**Spec:** `docs/superpowers/specs/2026-06-08-nextjs-trpc-migration-design.md`

---

## File Structure

```
app/
  next.config.ts                # NEW — cacheComponents: true
  postcss.config.mjs            # NEW — tailwind v4 plugin
  package.json                  # MODIFY — add next/trpc deps, scripts
  tsconfig.json                 # MODIFY — next plugin, paths, jsx preserve
  src/
    app/
      layout.tsx                # NEW — root layout, header nav, TRPCProvider
      page.tsx                  # NEW — / landing (hero)
      problem/page.tsx          # NEW — /problem
      solution/page.tsx         # NEW — /solution
      demo/page.tsx             # NEW — /demo
      api/trpc/[trpc]/route.ts  # NEW — tRPC fetch handler
      globals.css               # NEW — ported from src/index.css
    server/
      trpc.ts                   # NEW — initTRPC, context, sse config
      routers/
        _app.ts sites.ts routes.ts comparison.ts health.ts passport.ts  # NEW
      caller.ts                 # NEW — RSC server caller
    trpc/
      query-client.ts           # NEW — shared QueryClient factory
      client.tsx                # NEW — 'use client' provider + links
      server.ts                 # NEW — prefetch + HydrateClient
    components/                 # MODIFY — add 'use client', split DemoPage
      problem/ solution/ demo/  # NEW — route section components
    hooks/
      useHealthStream.ts        # NEW — SSE subscriber
    data/ lib/                  # UNCHANGED
```

---

## Task 0: Branch + baseline verification

**Files:** none (git only)

- [ ] **Step 1: Create migration branch**

```bash
cd /Users/cobeo/Codes/hackathon
git checkout -b migrate/nextjs-trpc
```

- [ ] **Step 2: Verify the Vite demo currently builds**

```bash
cd app && npm install && npm run build
```
Expected: build succeeds, `dist/` produced. (This is the green baseline we protect.)

- [ ] **Step 3: Commit branch start (no-op marker)**

```bash
cd /Users/cobeo/Codes/hackathon
git commit --allow-empty -m "chore: start nextjs+trpc migration branch"
```

---

## Task 1: Install Next.js + tRPC dependencies

**Skill:** `context7` — query `/vercel/next.js` and `/trpc/trpc` for current install commands/versions before editing.

**Files:**
- Modify: `app/package.json`

- [ ] **Step 1: Add runtime + dev deps**

```bash
cd app
npm install next@latest @trpc/server@next @trpc/client@next @trpc/tanstack-react-query@next @tanstack/react-query@latest zod
npm install -D @types/node
```

- [ ] **Step 2: Add Next scripts to `app/package.json`**

In the `"scripts"` block, add (keep existing Vite scripts for now):

```json
"dev:next": "next dev",
"build:next": "next build",
"start:next": "next start"
```

- [ ] **Step 3: Verify install**

```bash
npx next --version
```
Expected: prints a Next 16.x version.

- [ ] **Step 4: Commit**

```bash
cd /Users/cobeo/Codes/hackathon
git add app/package.json app/package-lock.json
git commit -m "build: add next.js and trpc dependencies"
```

---

## Task 2: Next.js config + TypeScript + PostCSS

**Skill:** `.agents/skills/next-best-practices` (file-conventions, runtime-selection) + `.agents/skills/next-cache-components` (cacheComponents flag).

**Files:**
- Create: `app/next.config.ts`
- Create: `app/postcss.config.mjs`
- Modify: `app/tsconfig.json`

- [ ] **Step 1: Create `app/next.config.ts`**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
};

export default nextConfig;
```

- [ ] **Step 2: Create `app/postcss.config.mjs`** (Tailwind v4)

```js
const config = {
  plugins: ["@tailwindcss/postcss"],
};

export default config;
```

- [ ] **Step 3: Install the Tailwind PostCSS plugin**

```bash
cd app && npm install -D @tailwindcss/postcss
```

- [ ] **Step 4: Update `app/tsconfig.json`**

Replace the file with (Next needs `jsx: preserve`, the next plugin, and path alias):

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "moduleDetection": "force",
    "allowJs": true,
    "plugins": [{ "name": "next" }],
    "paths": { "~/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "dist", "data-pipeline", "data-real"]
}
```
Note: `jsx` changed from `react-jsx` to `preserve` (Next requirement). Vite still works — `@vitejs/plugin-react` injects its own transform. If Vite dev complains, it does not block this migration since we cut over to Next.

- [ ] **Step 5: Commit**

```bash
cd /Users/cobeo/Codes/hackathon
git add app/next.config.ts app/postcss.config.mjs app/tsconfig.json app/package.json app/package-lock.json
git commit -m "build: configure next.js, postcss, typescript for app router"
```

---

## Task 3: Port global CSS into App Router

**Skill:** none (verbatim port).

**Files:**
- Create: `app/src/app/globals.css` (copy of `app/src/index.css`)

- [ ] **Step 1: Copy the stylesheet**

```bash
cd app && mkdir -p src/app && cp src/index.css src/app/globals.css
```

- [ ] **Step 2: Adjust the height selector for Next**

In `app/src/app/globals.css`, find the `html, body, #root { height: 100%; }` rule and change `#root` to the Next root. Replace:

```css
html,
body,
#root {
  height: 100%;
}
```
with:

```css
html,
body {
  height: 100%;
}
```
(Next renders into `<body>` directly; there is no `#root`.)

- [ ] **Step 3: Commit**

```bash
cd /Users/cobeo/Codes/hackathon
git add app/src/app/globals.css
git commit -m "style: port global stylesheet into app router"
```

---

## Task 4: tRPC server init + context

**Skill:** `context7` `/trpc/trpc` (initTRPC, context, sse config) + `.agents/skills/next-best-practices/rsc-boundaries`.

**Files:**
- Create: `app/src/server/trpc.ts`

- [ ] **Step 1: Create `app/src/server/trpc.ts`**

```ts
import { initTRPC } from "@trpc/server";
import superjsonless from "@trpc/server"; // placeholder import removed below

export interface TRPCContext {
  // Today empty; later: db client, auth/session, request headers.
}

export async function createTRPCContext(_opts: {
  headers: Headers;
}): Promise<TRPCContext> {
  return {};
}

const t = initTRPC.context<TRPCContext>().create({
  sse: {
    ping: { enabled: true, intervalMs: 2000 },
    client: { reconnectAfterInactivityMs: 5000 },
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;
```
Remove the `superjsonless` placeholder line — it is intentionally invalid to force you to delete it; the real file has no such import.

- [ ] **Step 2: Typecheck**

```bash
cd app && npx tsc --noEmit -p tsconfig.json
```
Expected: no errors referencing `server/trpc.ts` (other app-wide errors from missing files are fine at this stage).

- [ ] **Step 3: Commit**

```bash
cd /Users/cobeo/Codes/hackathon
git add app/src/server/trpc.ts
git commit -m "feat(trpc): add server init and request context"
```

---

## Task 5: Query routers (sites, routes, comparison, health, passport)

**Skill:** `context7` `/trpc/trpc` (query procedures, zod input).

**Files:**
- Create: `app/src/server/routers/sites.ts`
- Create: `app/src/server/routers/routes.ts`
- Create: `app/src/server/routers/comparison.ts`
- Create: `app/src/server/routers/health.ts`
- Create: `app/src/server/routers/passport.ts`

Before writing, confirm the exact exports these read from. Run:

```bash
cd app && grep -n "export" src/data/demo.ts src/data/asset.ts src/lib/cost.ts | head -40
```
Use the real exported names (`SITES`, `NODES`, `BASELINE_ROUTE`, `OPTIMIZED_ROUTE`, `FEATURED_ASSET`, `buildComparison`). If any differ from what is shown below, prefer the actual export.

- [ ] **Step 1: `app/src/server/routers/sites.ts`**

```ts
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

- [ ] **Step 2: `app/src/server/routers/routes.ts`**

```ts
import { publicProcedure, router } from "../trpc";
import { BASELINE_ROUTE, NODES, OPTIMIZED_ROUTE } from "~/data/demo";

export const routesRouter = router({
  pair: publicProcedure.query(() => ({
    baseline: BASELINE_ROUTE,
    optimized: OPTIMIZED_ROUTE,
  })),
  nodes: publicProcedure.query(() => NODES),
});
```

- [ ] **Step 3: `app/src/server/routers/comparison.ts`**

```ts
import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { buildComparison } from "~/lib/cost";

export const comparisonRouter = router({
  summary: publicProcedure
    .input(z.object({ stops: z.number().int().positive() }).optional())
    .query(({ input }) => buildComparison(input?.stops ?? 4)),
});
```
Confirm `buildComparison`'s argument: `grep -n "export function buildComparison" src/lib/cost.ts`. If it takes no argument or a different shape, match it and drop the `input`.

- [ ] **Step 4: `app/src/server/routers/health.ts`** (query only for now; SSE added in Task 6)

```ts
import { publicProcedure, router } from "../trpc";
import { FEATURED_ASSET } from "~/data/asset";

export const healthRouter = router({
  featured: publicProcedure.query(() => FEATURED_ASSET),
});
```
Confirm `FEATURED_ASSET` exists: `grep -n "export" src/data/asset.ts`. Use the actual exported name/shape.

- [ ] **Step 5: `app/src/server/routers/passport.ts`**

```ts
import { publicProcedure, router } from "../trpc";
import { FEATURED_ASSET } from "~/data/asset";

export const passportRouter = router({
  events: publicProcedure.query(() => {
    // Passport events currently live on the featured asset record.
    return (FEATURED_ASSET as { passport?: unknown[] }).passport ?? [];
  }),
});
```
Check where passport events actually come from: `grep -rn "PassportEvent\|passport" src/data src/components/PassportPanel.tsx`. Wire the router to that real source and type the return as `PassportEvent[]` from `~/data/types`.

- [ ] **Step 6: Typecheck**

```bash
cd app && npx tsc --noEmit
```
Expected: no errors in `src/server/routers/*`.

- [ ] **Step 7: Commit**

```bash
cd /Users/cobeo/Codes/hackathon
git add app/src/server/routers
git commit -m "feat(trpc): add query routers for sites, routes, comparison, health, passport"
```

---

## Task 6: Health SSE subscription

**Skill:** `context7` `/trpc/trpc` (subscriptions, `tracked`, async generator).

**Files:**
- Modify: `app/src/server/routers/health.ts`

- [ ] **Step 1: Add the `live` subscription to `health.ts`**

Replace the file with:

```ts
import { tracked } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { FEATURED_ASSET } from "~/data/asset";

export interface HealthTick {
  seq: number;
  timestamp: string;
  risk_score: number;
}

// Deterministic synthetic stream. Today: a timer. Later: swap for a real IoT
// EventEmitter — the client (useHealthStream) does not change.
async function* healthTicks(startSeq: number, signal: AbortSignal) {
  let seq = startSeq;
  while (!signal.aborted) {
    await new Promise<void>((resolve) => {
      const id = setTimeout(resolve, 1500);
      signal.addEventListener("abort", () => clearTimeout(id), { once: true });
    });
    if (signal.aborted) return;
    seq += 1;
    // Bounded wobble around the featured asset's baseline risk score.
    const base = 0.6;
    const risk = Math.min(1, Math.max(0, base + ((seq % 7) - 3) * 0.03));
    yield { seq, risk };
  }
}

export const healthRouter = router({
  featured: publicProcedure.query(() => FEATURED_ASSET),
  live: publicProcedure
    .input(z.object({ lastEventId: z.string().nullish() }).optional())
    .subscription(async function* (opts) {
      const startSeq = opts.input?.lastEventId
        ? Number(opts.input.lastEventId)
        : 0;
      for await (const tick of healthTicks(startSeq, opts.signal)) {
        const payload: HealthTick = {
          seq: tick.seq,
          // Stable timestamp derived from seq (no Date.now — keeps it deterministic).
          timestamp: `T+${tick.seq * 1500}ms`,
          risk_score: Math.round(tick.risk * 100) / 100,
        };
        yield tracked(String(tick.seq), payload);
      }
    }),
});
```

- [ ] **Step 2: Typecheck**

```bash
cd app && npx tsc --noEmit
```
Expected: no errors in `health.ts`.

- [ ] **Step 3: Commit**

```bash
cd /Users/cobeo/Codes/hackathon
git add app/src/server/routers/health.ts
git commit -m "feat(trpc): add health.live SSE subscription (synthetic ticks)"
```

---

## Task 7: App router + RSC caller

**Skill:** `context7` `/trpc/trpc` (createCallerFactory, app router merge).

**Files:**
- Create: `app/src/server/routers/_app.ts`
- Create: `app/src/server/caller.ts`

- [ ] **Step 1: Create `app/src/server/routers/_app.ts`**

```ts
import { router } from "../trpc";
import { comparisonRouter } from "./comparison";
import { healthRouter } from "./health";
import { passportRouter } from "./passport";
import { routesRouter } from "./routes";
import { sitesRouter } from "./sites";

export const appRouter = router({
  sites: sitesRouter,
  routes: routesRouter,
  comparison: comparisonRouter,
  health: healthRouter,
  passport: passportRouter,
});

export type AppRouter = typeof appRouter;
```

- [ ] **Step 2: Create `app/src/server/caller.ts`**

```ts
import { headers } from "next/headers";
import { createCallerFactory, createTRPCContext } from "./trpc";
import { appRouter } from "./routers/_app";

const createCaller = createCallerFactory(appRouter);

export const caller = createCaller(async () =>
  createTRPCContext({ headers: await headers() }),
);
```

- [ ] **Step 3: Typecheck**

```bash
cd app && npx tsc --noEmit
```
Expected: no errors in `server/`.

- [ ] **Step 4: Commit**

```bash
cd /Users/cobeo/Codes/hackathon
git add app/src/server/routers/_app.ts app/src/server/caller.ts
git commit -m "feat(trpc): merge app router and add rsc server caller"
```

---

## Task 8: tRPC fetch route handler

**Skill:** `context7` `/trpc/trpc` (fetchRequestHandler, App Router route).

**Files:**
- Create: `app/src/app/api/trpc/[trpc]/route.ts`

- [ ] **Step 1: Create the handler**

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

- [ ] **Step 2: Commit**

```bash
cd /Users/cobeo/Codes/hackathon
git add "app/src/app/api/trpc/[trpc]/route.ts"
git commit -m "feat(trpc): add fetch route handler at /api/trpc"
```

---

## Task 9: tRPC client wiring (batch + SSE, provider, server helpers)

**Skill:** `context7` `/trpc/trpc` (tanstack-react-query setup, httpBatchLink, httpSubscriptionLink, splitLink, server-components prefetch/HydrateClient).

**Files:**
- Create: `app/src/trpc/query-client.ts`
- Create: `app/src/trpc/client.tsx`
- Create: `app/src/trpc/server.ts`

- [ ] **Step 1: Create `app/src/trpc/query-client.ts`**

```ts
import { QueryClient } from "@tanstack/react-query";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30 * 1000 },
    },
  });
}
```

- [ ] **Step 2: Create `app/src/trpc/client.tsx`** (provider + links)

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
  const base =
    typeof window !== "undefined" ? "" : "http://localhost:3000";
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
If `context7` shows a different current API shape for `createTRPCContext`/`TRPCProvider` props in `@trpc/tanstack-react-query`, follow the docs — the names above match v11 at time of writing but verify.

- [ ] **Step 3: Create `app/src/trpc/server.ts`** (RSC prefetch + hydrate)

```ts
import "server-only";
import {
  dehydrate,
  HydrationBoundary,
  type FetchQueryOptions,
} from "@tanstack/react-query";
import { makeQueryClient } from "./query-client";
import { caller } from "~/server/caller";

// Reuse one query client per request.
import { cache } from "react";
export const getQueryClient = cache(makeQueryClient);

export async function prefetch<T>(opts: FetchQueryOptions<T>) {
  const qc = getQueryClient();
  await qc.prefetchQuery(opts);
}

export function HydrateClient({ children }: { children: React.ReactNode }) {
  const qc = getQueryClient();
  return (
    <HydrationBoundary state={dehydrate(qc)}>{children}</HydrationBoundary>
  );
}

export { caller };
```
Note: `prefetch` here uses `FetchQueryOptions`. In components you will pass the result of `useTRPC()`-derived `queryOptions`. If `context7` shows the recommended server-side `trpc` proxy pattern (`createTRPCOptionsProxy`), prefer that exact pattern from the docs and adjust the page-level prefetch calls in Task 11 accordingly. The contract that must hold: server prefetches the same query key the client `useQuery` reads.

- [ ] **Step 4: Typecheck**

```bash
cd app && npx tsc --noEmit
```
Expected: no errors in `src/trpc/*`.

- [ ] **Step 5: Commit**

```bash
cd /Users/cobeo/Codes/hackathon
git add app/src/trpc
git commit -m "feat(trpc): add client provider (batch+sse) and rsc prefetch helpers"
```

---

## Task 10: Root layout + header navigation

**Skill:** `.agents/skills/next-best-practices` (file-conventions, metadata) + `.agents/skills/vercel-composition-patterns` (react19 patterns).

**Files:**
- Create: `app/src/app/layout.tsx`

Reference the current header markup in `app/src/App.tsx:17-46` and the hero in `:48-67` — copy the exact Tailwind classes so the look is preserved. The hero moves to `page.tsx` (Task 11); only the header + chrome go in the layout.

- [ ] **Step 1: Create `app/src/app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { TRPCReactProvider } from "~/trpc/client";

export const metadata: Metadata = {
  title: "SolarCycle AI",
  description: "Predict · Plan · Recover — solar lifecycle & recovery",
};

const SECTIONS = [
  { href: "/problem", label: "Problem" },
  { href: "/solution", label: "Solution" },
  { href: "/demo", label: "Demo" },
] as const;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <TRPCReactProvider>
          <div className="min-h-full">
            <header className="sticky top-0 z-[1000] border-b border-line bg-paper/85 backdrop-blur-md">
              <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3">
                <Link href="/" className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink text-lg">
                    🔆
                  </span>
                  <div className="leading-none">
                    <div className="font-display text-[17px] font-extrabold tracking-tight text-ink">
                      SolarCycle<span className="text-solar"> AI</span>
                    </div>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                      Predict · Plan · Recover
                    </div>
                  </div>
                </Link>
                <nav className="flex items-center gap-1 rounded-lg border border-line bg-panel p-1">
                  {SECTIONS.map((s, i) => (
                    <Link
                      key={s.href}
                      href={s.href}
                      className="rounded-md px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-wide text-muted transition-colors hover:bg-ink hover:text-paper"
                    >
                      <span className="mr-1.5 text-solar">{i + 1}</span>
                      {s.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </header>
            <main className="mx-auto max-w-6xl px-5 py-14">{children}</main>
            <footer className="mx-auto max-w-6xl px-5 pb-10 text-center font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
              SolarCycle AI · Hackathon MVP · deterministic demo data
            </footer>
          </div>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/cobeo/Codes/hackathon
git add app/src/app/layout.tsx
git commit -m "feat(next): add root layout with header navigation and trpc provider"
```

---

## Task 11: Route pages (landing + problem/solution/demo) with prefetch

**Skill:** `.agents/skills/next-best-practices/async-patterns` + `.agents/skills/vercel-react-best-practices` (`async-parallel`, `server-serialization`) + `context7` for the exact prefetch proxy API confirmed in Task 9.

> These pages are thin RSC shells. They prefetch the relevant queries, then render the route's section components (built in Task 12) wrapped in `HydrateClient`. Until Task 12 exists, render a placeholder so the route compiles and SSR can be verified.

**Files:**
- Create: `app/src/app/page.tsx`
- Create: `app/src/app/problem/page.tsx`
- Create: `app/src/app/solution/page.tsx`
- Create: `app/src/app/demo/page.tsx`

- [ ] **Step 1: Landing `app/src/app/page.tsx`** (hero, ported from `App.tsx:48-67`)

```tsx
export default function LandingPage() {
  return (
    <section>
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-solar">
        Solar lifecycle &amp; recovery, Melbourne west &amp; north
      </p>
      <h1 className="mt-3 max-w-4xl font-display text-4xl font-extrabold leading-[1.05] tracking-[-0.02em] text-ink md:text-[56px]">
        We predict which solar assets fail next —
        <span className="text-solar">
          {" "}
          and recover them on the cheapest possible route.
        </span>
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
        Aging panels and inverters fail unpredictably. Today collection is
        reactive and wasteful. SolarCycle AI turns health data into a plan — in
        three steps.
      </p>
    </section>
  );
}
```

- [ ] **Step 2: `app/src/app/problem/page.tsx`** (prefetch sites + featured health)

```tsx
import { HydrateClient } from "~/trpc/server";

export default async function ProblemPage() {
  // TODO(Task 12): prefetch(trpc.sites.list...) + prefetch(trpc.health.featured...)
  return (
    <HydrateClient>
      <section className="scroll-mt-24">
        <h2 className="font-display text-2xl font-extrabold text-ink">
          Problem
        </h2>
        {/* ProblemSection mounts here in Task 12 */}
      </section>
    </HydrateClient>
  );
}
```

- [ ] **Step 3: `app/src/app/solution/page.tsx`**

```tsx
import { HydrateClient } from "~/trpc/server";

export default async function SolutionPage() {
  // TODO(Task 12): prefetch routes.pair + comparison.summary
  return (
    <HydrateClient>
      <section className="scroll-mt-24">
        <h2 className="font-display text-2xl font-extrabold text-ink">
          Solution
        </h2>
      </section>
    </HydrateClient>
  );
}
```

- [ ] **Step 4: `app/src/app/demo/page.tsx`**

```tsx
import { HydrateClient } from "~/trpc/server";

export default async function DemoPage() {
  // TODO(Task 12): prefetch routes.pair + routes.nodes + comparison.summary
  return (
    <HydrateClient>
      <section className="scroll-mt-24">
        <h2 className="font-display text-2xl font-extrabold text-ink">Demo</h2>
      </section>
    </HydrateClient>
  );
}
```

- [ ] **Step 5: Run the Next dev server and verify SSR**

```bash
cd app && npm run dev:next
```
In another terminal:
```bash
curl -s http://localhost:3000/ | grep -c "cheapest possible route"
curl -s http://localhost:3000/problem | grep -c "Problem"
```
Expected: each `grep -c` prints `1` or more (content is in the server-rendered HTML, proving SSR). Stop the dev server.

- [ ] **Step 6: Commit**

```bash
cd /Users/cobeo/Codes/hackathon
git add app/src/app/page.tsx app/src/app/problem app/src/app/solution app/src/app/demo
git commit -m "feat(next): add route shells for landing, problem, solution, demo"
```

---

## Task 12: Port components, wire tRPC reads, client islands

**Skill:** `.agents/skills/vercel-react-best-practices` (`bundle-dynamic-imports`, `rsc-boundaries`) + `.agents/skills/vercel-composition-patterns` (react19 `use()` not `useContext`, no `forwardRef`, `architecture-avoid-boolean-props` for the DemoPage variant split) + `frontend-design:frontend-design` for parity.

> This is the largest task. Do it sub-component by sub-component, verifying the route after each. The rule: components read data via `useTRPC()` + `useQuery`, NOT by importing `data/`. Leaflet and the simulation are `'use client'` islands.

**Files:**
- Modify: `app/src/components/ui.tsx` (likely no change; verify it has no Vite-only imports)
- Modify: `app/src/components/MapView.tsx` (add `'use client'`, dynamic Leaflet)
- Modify: `app/src/components/Pipeline.tsx`, `HealthChart.tsx`, `InstallWaveChart.tsx`, `LineChart.tsx`, `PassportPanel.tsx` (add `'use client'` where they use hooks/state/refs/SVG interactivity)
- Create: `app/src/components/problem/ProblemSection.tsx`
- Create: `app/src/components/solution/SolutionSection.tsx`
- Create: `app/src/components/demo/DemoSection.tsx`
- Create: `app/src/components/demo/CompareTable.tsx`
- Create: `app/src/components/demo/TruckStat.tsx`
- Create: `app/src/hooks/useHealthStream.ts`
- Modify: `app/src/app/problem/page.tsx`, `solution/page.tsx`, `demo/page.tsx` (real prefetch + render sections)

- [ ] **Step 1: Make MapView a client island with dynamic Leaflet**

At the top of `app/src/components/MapView.tsx` add `"use client";`. Leaflet touches `window`, so it must not run on the server. In the page/section that uses the map, import it via `next/dynamic` with `ssr: false`:

```tsx
import dynamic from "next/dynamic";
const MapView = dynamic(
  () => import("~/components/MapView").then((m) => m.MapView),
  { ssr: false },
);
```
Keep the existing `MapView` implementation otherwise unchanged.

- [ ] **Step 2: Mark interactive components `'use client'`**

For each of `Pipeline.tsx`, `HealthChart.tsx`, `InstallWaveChart.tsx`, `LineChart.tsx`, `PassportPanel.tsx`: if the file uses `useState`/`useEffect`/`useRef`/event handlers/`subscribe`, add `"use client";` as the first line. If a chart is purely presentational (props in, SVG out, no hooks), leave it as a server component. Verify by reading each file's imports first:

```bash
cd app && grep -l "useState\|useEffect\|useRef\|onClick\|onMouse" src/components/*.tsx
```
Add `'use client'` to exactly the files this lists.

- [ ] **Step 3: Create `useHealthStream` hook**

`app/src/hooks/useHealthStream.ts`:

```ts
"use client";

import { useQuery } from "@tanstack/react-query"; // not used directly; see note
import { useEffect, useState } from "react";
import { useTRPC } from "~/trpc/client";
import type { HealthTick } from "~/server/routers/health";

export function useHealthStream() {
  const trpc = useTRPC();
  const [ticks, setTicks] = useState<HealthTick[]>([]);

  useEffect(() => {
    const sub = trpc.health.live.subscribe(
      { lastEventId: null },
      {
        onData: (data: { id: string; data: HealthTick }) => {
          setTicks((prev) => [...prev.slice(-19), data.data]);
        },
      },
    );
    return () => sub.unsubscribe();
  }, [trpc]);

  return ticks;
}
```
The exact subscription API on the tanstack-react-query integration may be `useSubscription(trpc.health.live.subscriptionOptions(...))`. Confirm with `context7` `/trpc/trpc` (subscriptions with tanstack-react-query) and use that hook form if available; the contract is: receive `HealthTick` payloads and keep the last ~20. Remove the unused `useQuery` import.

- [ ] **Step 4: Build `ProblemSection` reading via tRPC**

`app/src/components/problem/ProblemSection.tsx`. Read the current `app/src/pages/ProblemPage.tsx` and port its JSX, but replace any direct `data/` imports with tRPC reads:

```tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/client";

export function ProblemSection() {
  const trpc = useTRPC();
  const { data: sites } = useQuery(trpc.sites.list.queryOptions());
  const { data: featured } = useQuery(trpc.health.featured.queryOptions());
  // Port the JSX from src/pages/ProblemPage.tsx, sourcing from `sites`/`featured`.
  // Keep all existing Tailwind classes for visual parity.
  return <section>{/* ...ported markup... */}</section>;
}
```
Confirm the `queryOptions` accessor shape against `context7`. If the integration exposes `trpc.sites.list.queryOptions()`, use it; otherwise use the documented equivalent.

- [ ] **Step 5: Wire `problem/page.tsx` to prefetch + render**

```tsx
import { HydrateClient, getQueryClient } from "~/trpc/server";
import { caller } from "~/trpc/server";
import { ProblemSection } from "~/components/problem/ProblemSection";

export default async function ProblemPage() {
  const qc = getQueryClient();
  await Promise.all([
    qc.prefetchQuery({
      queryKey: ["sites", "list"],
      queryFn: () => caller.sites.list(),
    }),
    qc.prefetchQuery({
      queryKey: ["health", "featured"],
      queryFn: () => caller.health.featured(),
    }),
  ]);
  return (
    <HydrateClient>
      <ProblemSection />
    </HydrateClient>
  );
}
```
IMPORTANT — query key alignment: the client `useQuery(trpc.sites.list.queryOptions())` generates a specific query key. The server prefetch MUST use the same key. The clean way is the tRPC server option proxy (`createTRPCOptionsProxy` from `@trpc/tanstack-react-query`) so both sides derive the key identically. Confirm this pattern in `context7` and use it for prefetch instead of hand-written `queryKey` arrays if available. Hand-written keys are a fallback only and must match exactly. Run `async-parallel`: prefetches run together via `Promise.all` (already shown).

- [ ] **Step 6: Build `SolutionSection` + wire `solution/page.tsx`**

Port `app/src/pages/SolutionPage.tsx` into `app/src/components/solution/SolutionSection.tsx` using `trpc.routes.pair` and `trpc.comparison.summary` reads (same pattern as Step 4). Wire `solution/page.tsx` to prefetch `routes.pair` and `comparison.summary` (same pattern as Step 5).

- [ ] **Step 7: Split + build the Demo section**

The current `app/src/pages/DemoPage.tsx` (221 lines) contains `DemoSection`, `CompareTable`, and `TruckStat`. Split them:
- `app/src/components/demo/CompareTable.tsx` — the `CompareTable` component, props-only (no boolean-mode props; if it had a `preview` boolean driving layout, prefer explicit content per `architecture-avoid-boolean-props`).
- `app/src/components/demo/TruckStat.tsx` — the `TruckStat` component.
- `app/src/components/demo/DemoSection.tsx` — `"use client"`; owns `useSimulation()` (the RAF engine stays client-side, unchanged) and renders `MapView` (dynamic, `ssr:false`), `CompareTable`, `TruckStat`. Replace its direct `BASELINE_ROUTE`/`OPTIMIZED_ROUTE`/`buildComparison` imports with `trpc.routes.pair` + `trpc.comparison.summary` reads. The simulation hook keeps importing route geometry from `~/data/demo` directly — it is client animation math, explicitly exempt from the tRPC boundary per the spec.

Wire `demo/page.tsx` to prefetch `routes.pair`, `routes.nodes`, `comparison.summary`, then render `<DemoSection />` inside `HydrateClient`.

- [ ] **Step 8: Verify the full Next demo end-to-end**

```bash
cd app && npm run dev:next
```
Manually (or via the `run` skill / playwright already in devDeps): open `http://localhost:3000`, click Problem → Solution → Demo. Confirm: charts render, map renders, `Run`/`Start` simulation animates both trucks and settles on canonical totals (baseline 142km/$312, optimized 102km/$212), comparison metrics readable, health stream ticks update. Stop the server.

- [ ] **Step 9: Typecheck + build**

```bash
cd app && npx tsc --noEmit && npm run build:next
```
Expected: no type errors; `next build` succeeds with the four routes prerendered (look for `○ (Static)` / `ƒ (Dynamic)` markers, no RSC boundary errors).

- [ ] **Step 10: Commit**

```bash
cd /Users/cobeo/Codes/hackathon
git add app/src/components app/src/hooks/useHealthStream.ts app/src/app/problem app/src/app/solution app/src/app/demo
git commit -m "feat(next): port sections to app router with trpc reads and client islands"
```

---

## Task 13: Route view transitions (visual movement)

**Skill:** `.agents/skills/vercel-react-view-transitions` (references/nextjs.md).

**Files:**
- Modify: `app/next.config.ts` (enable view transitions if required by the skill)
- Modify: `app/src/app/layout.tsx` or a small client wrapper

- [ ] **Step 1: Follow the skill's Next.js recipe**

Read `.agents/skills/vercel-react-view-transitions/references/nextjs.md` and apply its exact pattern (React `<ViewTransition>` and/or the Next config flag) to animate navigation between `/problem`, `/solution`, `/demo`. Keep it subtle — a cross-fade/slide on `<main>`.

- [ ] **Step 2: Verify transitions + no regression**

```bash
cd app && npm run dev:next
```
Navigate between routes; confirm a smooth transition and that all content from Task 12 still renders. Stop the server.

- [ ] **Step 3: Commit**

```bash
cd /Users/cobeo/Codes/hackathon
git add app/next.config.ts app/src/app
git commit -m "feat(next): add view transitions on route navigation"
```

---

## Task 14: Type-safety proof

**Skill:** none (verification).

**Files:** none (temporary edit, reverted).

- [ ] **Step 1: Introduce a deliberate type mismatch**

In `app/src/server/routers/sites.ts`, temporarily change `list` to return a wrong shape:

```ts
list: publicProcedure.query(() => SITES.map((s) => ({ ...s, site_id: 123 }))),
```

- [ ] **Step 2: Confirm the client surfaces a type error**

```bash
cd app && npx tsc --noEmit
```
Expected: a type error where `ProblemSection` consumes `sites[i].site_id` as a string. This proves the end-to-end typed boundary.

- [ ] **Step 3: Revert**

```bash
cd /Users/cobeo/Codes/hackathon
git checkout app/src/server/routers/sites.ts
```
Confirm `npx tsc --noEmit` is clean again.

---

## Task 15: Cutover — remove Vite

**Skill:** `superpowers:verification-before-completion` (final green gate before deletion).

**Files:**
- Delete: `app/vite.config.ts`, `app/index.html`, `app/src/main.tsx`, `app/src/App.tsx`, `app/src/index.css`, `app/src/vite-env.d.ts`, `app/src/pages/` (old page components now ported)
- Modify: `app/package.json` (drop Vite scripts/deps, rename `dev:next`→`dev` etc.)

- [ ] **Step 1: Final verification BEFORE deleting anything**

```bash
cd app && npm run build:next && npm run start:next
```
Open `http://localhost:3000`, walk the full Problem→Solution→Demo flow, run the simulation to completion, confirm metrics + map + charts + health stream. Only proceed if everything is green. Stop the server.

- [ ] **Step 2: Remove Vite entry/config files**

```bash
cd app
git rm vite.config.ts index.html src/main.tsx src/App.tsx src/index.css src/vite-env.d.ts
git rm -r src/pages
```

- [ ] **Step 3: Clean `app/package.json`**

Remove `"dev": "vite"`, `"build": "tsc -b && vite build"`, `"preview": "vite preview"`. Rename `dev:next`→`dev`, `build:next`→`build`, `start:next`→`start`. Remove Vite-only deps: `vite`, `@vitejs/plugin-react`, `@tailwindcss/vite` (keep `@tailwindcss/postcss`). Keep `tsx`, `playwright`, `exceljs`, pipeline scripts.

```bash
cd app && npm install
```

- [ ] **Step 4: Final build with cleaned config**

```bash
cd app && npm run build && npm run start
```
Open `http://localhost:3000`, confirm the full flow once more. Stop the server.

- [ ] **Step 5: Commit**

```bash
cd /Users/cobeo/Codes/hackathon
git add app/package.json app/package-lock.json
git commit -m "chore: remove vite, next.js is now the only frontend"
```

---

## Task 16: Update docs

**Files:**
- Modify: `app/README.md`

- [ ] **Step 1: Update `app/README.md`**

Replace Vite run instructions with Next: `npm run dev` (Next dev), `npm run build`, `npm run start`. Document the architecture: `app/` routes prefetch tRPC queries, routers in `src/server/routers/`, mock data in `src/data/` consumed only by routers, `health.live` is the SSE example. Note the mock→real swap is a router-body change.

- [ ] **Step 2: Commit**

```bash
cd /Users/cobeo/Codes/hackathon
git add app/README.md
git commit -m "docs: update readme for next.js + trpc architecture"
```

---

## Self-Review Notes (covered)

- **Spec §3–6 boundary:** Tasks 4–9 build the typed boundary; Task 12 Step 7 documents the simulation exemption.
- **Spec §5 procedures:** all 8 procedures map to Tasks 5–6; query-key alignment risk called out explicitly in Task 11/12 with the `createTRPCOptionsProxy` recommendation.
- **Spec §7 phases:** Tasks map 1:1 to phases 1–7; demo-green gate is a step in Tasks 11, 12, 13, 15.
- **Spec §8 skills:** each task names its skill.
- **Known tension (`use cache` vs hydration):** handled by NOT wrapping prefetch in `use cache`; PPR still applies to static shell.
- **Risk:** the precise `@trpc/tanstack-react-query` v11 API (provider props, `queryOptions`/`subscriptionOptions`, server proxy) must be confirmed via `context7` at Tasks 9/12 — the plan states the contract and flags the exact spots to verify rather than guessing a frozen signature.
