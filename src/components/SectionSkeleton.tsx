export function SectionSkeleton({ title }: { title: string }) {
  return (
    <section className="scroll-mt-24">
      <h2 className="font-display text-2xl font-extrabold text-ink">{title}</h2>
      <div className="mt-6 h-64 animate-pulse rounded-xl border border-line bg-panel" />
    </section>
  );
}
