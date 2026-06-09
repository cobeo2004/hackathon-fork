// Digital passport: a tamper-evident lifecycle timeline. We hide the raw hash
// chain (jargon for a pitch) and show a single "verified" signal instead.

import { ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import type { PassportEvent } from "~/data/types";

const EVENT_TONE: Record<string, { dot: string; chip: string }> = {
  manufactured: { dot: "bg-muted", chip: "bg-line/60 text-muted" },
  installed: { dot: "bg-route", chip: "bg-[#dbe6ff] text-route" },
  health_checked: { dot: "bg-solar", chip: "bg-solar-soft text-solar" },
  fault_predicted: { dot: "bg-risk", chip: "bg-[#fbe0d6] text-risk" },
  collection_scheduled: { dot: "bg-recover", chip: "bg-[#d6ecdf] text-recover" },
};

export function PassportPanel({
  events,
  highlightLast = false,
}: {
  events: PassportEvent[];
  highlightLast?: boolean;
}) {
  return (
    <ol className="relative space-y-4 pl-5">
      {/* the spine */}
      <span className="absolute left-[5px] top-1 bottom-1 w-px bg-line" aria-hidden />
      {events.map((e, i) => {
        const isLast = i === events.length - 1;
        const tone = EVENT_TONE[e.event_type] ?? EVENT_TONE.manufactured;
        const hot = highlightLast && isLast;
        return (
          <li key={e.event_id} className="relative">
            <span
              className={`absolute -left-5 top-1 h-2.5 w-2.5 rounded-full ring-4 ring-panel ${tone.dot}`}
              aria-hidden
            />
            <div className="flex items-center justify-between gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide ${tone.chip} ${
                  hot ? "ring-1 ring-recover/40" : ""
                }`}
              >
                {e.event_type.replace(/_/g, " ")}
              </span>
              <span className="font-mono text-[10px] text-muted">
                {e.timestamp.slice(0, 10)}
              </span>
            </div>
            <div className="mt-1 text-[13px] leading-snug text-ink/80">{e.notes}</div>
          </li>
        );
      })}
      <li className="relative pt-1">
        <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-recover">
          <ShieldCheck size={12} weight="bold" /> Tamper-evident · hash-chained
        </div>
      </li>
    </ol>
  );
}
