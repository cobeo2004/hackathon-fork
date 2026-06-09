import { initTRPC } from "@trpc/server";

export const createTRPCContext = async (_opts: { headers: Headers }) => {
  return {};
};

const t = initTRPC
  .context<Awaited<ReturnType<typeof createTRPCContext>>>()
  .create({
    sse: {
      ping: { enabled: true, intervalMs: 2000 },
      client: { reconnectAfterInactivityMs: 5000 },
    },
  });

export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;
