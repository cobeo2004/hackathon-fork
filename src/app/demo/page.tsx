import { HydrateClient } from "~/trpc/server";

export default function DemoPage() {
  // TODO(Task 12): prefetch routes.pair + routes.nodes + comparison.summary
  return (
    <HydrateClient>
      <section className="scroll-mt-24">
        <h2 className="font-display text-2xl font-extrabold text-ink">Demo</h2>
        {/* DemoSection mounts here in Task 12 */}
      </section>
    </HydrateClient>
  );
}
