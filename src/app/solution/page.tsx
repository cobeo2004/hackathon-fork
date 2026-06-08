import { connection } from "next/server";
import { Suspense } from "react";
import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { SolutionSection } from "~/components/solution/SolutionSection";
import { SectionSkeleton } from "~/components/SectionSkeleton";

export default function SolutionPage() {
  return (
    <Suspense fallback={<SectionSkeleton title="Solution" />}>
      <SolutionData />
    </Suspense>
  );
}

async function SolutionData() {
  await connection();
  await Promise.all([
    prefetch(trpc.health.featured.queryOptions()),
    prefetch(trpc.passport.events.queryOptions()),
  ]);
  return (
    <HydrateClient>
      <SolutionSection />
    </HydrateClient>
  );
}
