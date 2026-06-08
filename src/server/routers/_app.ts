import { router } from "../trpc";
import { comparisonRouter } from "./comparison";
import { healthRouter } from "./health";
import { passportRouter } from "./passport";
import { routesRouter } from "./routes";
import { sitesRouter } from "./sites";
import { statsRouter } from "./stats";

export const appRouter = router({
  sites: sitesRouter,
  routes: routesRouter,
  comparison: comparisonRouter,
  health: healthRouter,
  passport: passportRouter,
  stats: statsRouter,
});

export type AppRouter = typeof appRouter;
