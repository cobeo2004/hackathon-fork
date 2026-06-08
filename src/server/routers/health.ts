import { tracked } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { FEATURED_ASSET, HEALTH_SERIES } from "~/data/asset";

export interface HealthTick {
  seq: number;
  timestamp: string;
  risk_score: number;
}

export const healthRouter = router({
  featured: publicProcedure.query(() => ({
    asset: FEATURED_ASSET,
    readings: HEALTH_SERIES,
  })),

  /**
   * SSE subscription proving the realtime path. Today: a deterministic synthetic
   * timer (no Date.now). Later: swap the timer for a real IoT EventEmitter — the
   * client `useHealthStream` hook does not change.
   */
  live: publicProcedure
    .input(z.object({ lastEventId: z.string().nullish() }).optional())
    .subscription(async function* (opts) {
      let seq = opts.input?.lastEventId ? Number(opts.input.lastEventId) : 0;
      while (!opts.signal?.aborted) {
        await new Promise<void>((resolve) => {
          const id = setTimeout(resolve, 1500);
          opts.signal?.addEventListener("abort", () => clearTimeout(id), {
            once: true,
          });
        });
        if (opts.signal?.aborted) return;
        seq += 1;
        // Bounded wobble around the featured asset's baseline risk score.
        const base = 0.6;
        const risk = Math.min(1, Math.max(0, base + ((seq % 7) - 3) * 0.03));
        const payload: HealthTick = {
          seq,
          timestamp: `T+${seq * 1500}ms`,
          risk_score: Math.round(risk * 100) / 100,
        };
        yield tracked(String(seq), payload);
      }
    }),
});
