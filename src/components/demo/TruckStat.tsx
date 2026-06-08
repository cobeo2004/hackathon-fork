import { Card } from "~/components/ui";

export function TruckStat({
  color,
  title,
  distance,
  cost,
}: {
  color: string;
  title: string;
  distance: number;
  cost: number;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 font-display text-sm font-extrabold tracking-tight text-ink">
        <span
          className="inline-block h-3 w-3 rounded-full"
          style={{ background: color }}
        />
        {title}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
            Distance
          </div>
          <div className="font-display text-2xl font-extrabold tabular-nums text-ink">
            {distance}{" "}
            <span className="text-base text-muted">km</span>
          </div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
            Cost
          </div>
          <div className="font-display text-2xl font-extrabold tabular-nums text-ink">
            A${cost}
          </div>
        </div>
      </div>
    </Card>
  );
}
