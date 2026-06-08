import { VIC_TOP_POSTCODES } from "../data/victoria";

export function TopPostcodesChart() {
  const maxInstalls = Math.max(...VIC_TOP_POSTCODES.map((d) => d.installs));

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
            Top 15 Victorian postcodes by all-time total
          </div>
          <div className="mt-1 text-[12px] leading-snug text-muted">
            CER rooftop solar systems, 2001 to Apr 2026
          </div>
        </div>
        <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-solar">
          3029 ranks #1
        </div>
      </div>

      <div className="grid gap-1.5">
        {VIC_TOP_POSTCODES.map((row, index) => {
          const width = Math.max(6, (row.installs / maxInstalls) * 100);
          const isLead = index === 0;

          return (
            <div
              key={row.postcode}
              className="grid grid-cols-[42px_44px_1fr_68px] items-center gap-2 text-[12px]"
            >
              <div className="font-mono text-[10px] text-muted">
                #{String(index + 1).padStart(2, "0")}
              </div>
              <div className={`font-mono font-semibold ${isLead ? "text-risk" : "text-ink"}`}>
                {row.postcode}
              </div>
              <div className="h-5 overflow-hidden rounded-sm bg-line/70">
                <div
                  className={`h-full rounded-sm transition-all duration-300 ${
                    isLead ? "bg-risk" : "bg-solar"
                  }`}
                  style={{ width: `${width}%` }}
                />
              </div>
              <div className="text-right font-mono text-[11px] font-semibold tabular-nums text-ink">
                {row.installs.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
