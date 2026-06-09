"use client";

// Proves the realtime path: subscribes to the `health.live` tRPC SSE stream and
// shows the latest risk tick. Until the first tick arrives it reads "connecting".

import { useHealthStream } from "./useHealthStream";

export function LiveHealthBadge() {
  const { ticks, status } = useHealthStream();
  const latest = ticks[ticks.length - 1];

  const live = status === "pending" && latest;
  const dotColor = live ? "bg-recover" : "bg-muted";
  const label = live
    ? `live risk ${latest.risk_score.toFixed(2)} · ${latest.timestamp}`
    : status === "error"
      ? "stream offline"
      : "connecting…";

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
      <span
        className={`inline-block h-2 w-2 rounded-full ${dotColor} ${live ? "animate-pulse" : ""}`}
        aria-hidden
      />
      {label}
    </span>
  );
}
