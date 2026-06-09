import { connection } from "next/server";
import { Suspense } from "react";
import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { ProblemSection } from "./_components/ProblemSection";
import { SectionSkeleton } from "~/components/SectionSkeleton";

export default function ProblemPage() {
  return (
    <Suspense fallback={<SectionSkeleton title="Problem" />}>
      <ProblemData />
    </Suspense>
  );
}

async function ProblemData() {
  await connection();
  await Promise.all([
    prefetch(trpc.stats.problem.queryOptions()),
    prefetch(trpc.stats.topPostcodes.queryOptions()),
  ]);
  return (
    <HydrateClient>
      <ProblemSection />
    </HydrateClient>
  );
}
