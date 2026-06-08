import { HydrateClient } from "~/trpc/server";

export default function ProblemPage() {
  // TODO(Task 12): prefetch(trpc.sites.list...) + prefetch(trpc.health.featured...)
  return (
    <HydrateClient>
      <section className="scroll-mt-24">
        <h2 className="font-display text-2xl font-extrabold text-ink">Problem</h2>
        {/* ProblemSection mounts here in Task 12 */}
      </section>
    </HydrateClient>
  );
}
