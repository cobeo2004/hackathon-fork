import { connection } from "next/server";
import { Suspense } from "react";
import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { ProblemSection } from "~/components/problem/ProblemSection";
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
  await prefetch(trpc.stats.problem.queryOptions());
  return (
    <HydrateClient>
      <ProblemSection />
    </HydrateClient>
  );
}
