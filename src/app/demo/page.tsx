import { connection } from "next/server";
import { Suspense } from "react";
import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { DemoSection } from "./_components/DemoSection";
import { SectionSkeleton } from "~/components/SectionSkeleton";

export default function DemoPage() {
  return (
    <Suspense fallback={<SectionSkeleton title="Demo" />}>
      <DemoData />
    </Suspense>
  );
}

async function DemoData() {
  // Mark this hole dynamic so the React-Query dehydrate (which stamps Date.now)
  // runs at request time; the static skeleton shell still prerenders (PPR).
  await connection();
  await Promise.all([
    prefetch(trpc.routes.pair.queryOptions()),
    prefetch(trpc.routes.nodes.queryOptions()),
    prefetch(trpc.comparison.summary.queryOptions()),
    prefetch(trpc.health.featured.queryOptions()),
  ]);
  return (
    <HydrateClient>
      <DemoSection />
    </HydrateClient>
  );
}
