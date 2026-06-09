import { publicProcedure, router } from "../trpc";
import { BASELINE_ROUTE, NODES, OPTIMIZED_ROUTE } from "~/data/demo";

export const routesRouter = router({
  pair: publicProcedure.query(() => ({
    baseline: BASELINE_ROUTE,
    optimized: OPTIMIZED_ROUTE,
  })),
  nodes: publicProcedure.query(() => NODES),
});
