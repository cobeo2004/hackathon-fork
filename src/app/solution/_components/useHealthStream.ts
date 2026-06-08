"use client";

// Subscribes to the `health.live` tRPC SSE stream and keeps the last ~20 ticks.
// Because the server yields `tracked(id, payload)`, onData receives an envelope
// `{ id, data }` where `data` is the HealthTick.

import { useSubscription } from "@trpc/tanstack-react-query";
import { useState } from "react";
import { useTRPC } from "~/trpc/client";
import type { HealthTick } from "~/server/routers/health";

export function useHealthStream() {
  const trpc = useTRPC();
  const [ticks, setTicks] = useState<HealthTick[]>([]);

  const sub = useSubscription(
    trpc.health.live.subscriptionOptions(
      { lastEventId: null },
      {
        onData: (envelope: { id: string; data: HealthTick }) => {
          setTicks((prev) => [...prev.slice(-19), envelope.data]);
        },
        onError: (err) => console.error("health.live error", err),
      },
    ),
  );

  return { ticks, status: sub.status };
}
