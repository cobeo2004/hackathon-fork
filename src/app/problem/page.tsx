import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { ProblemSection } from "~/components/problem/ProblemSection";

export default function ProblemPage() {
  prefetch(trpc.stats.problem.queryOptions());
  return (
    <HydrateClient>
      <ProblemSection />
    </HydrateClient>
  );
}
