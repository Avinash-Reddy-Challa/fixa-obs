// File: src/server/api/root.ts
import { createTRPCRouter, createCallerFactory } from "./trpc";
import { callRouter } from "./routers/callMock";
import { searchRouter } from "./routers/searchMock";
import { agentRouter } from "./routers/agentMock";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  _call: callRouter,
  search: searchRouter,
  agent: agentRouter,
  // Add more mock routers as needed
});

// Export the router type
export type AppRouter = typeof appRouter;

// Export the router caller factory
export const createCaller = createCallerFactory(appRouter);

export default appRouter;