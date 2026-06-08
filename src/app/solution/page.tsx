import { HydrateClient } from "~/trpc/server";

export default function SolutionPage() {
  // TODO(Task 12): prefetch(trpc.routes.pair...) + prefetch(trpc.comparison.summary...)
  return (
    <HydrateClient>
      <section className="scroll-mt-24">
        <h2 className="font-display text-2xl font-extrabold text-ink">Solution</h2>
        {/* SolutionSection mounts here in Task 12 */}
      </section>
    </HydrateClient>
  );
}
