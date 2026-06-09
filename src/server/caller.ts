import { headers } from "next/headers";
import { createCallerFactory, createTRPCContext } from "./trpc";
import { appRouter } from "./routers/_app";

const createCaller = createCallerFactory(appRouter);

/** RSC server-side caller — invokes procedures directly without an HTTP round-trip. */
export const caller = createCaller(async () =>
  createTRPCContext({ headers: await headers() }),
);
