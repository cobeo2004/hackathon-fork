import { publicProcedure, router } from "../trpc";
import { buildComparison } from "~/lib/cost";

export const comparisonRouter = router({
  summary: publicProcedure.query(() => buildComparison()),
});
