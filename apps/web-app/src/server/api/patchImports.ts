// File: src/server/api/patchImports.ts
import { createTRPCRouter } from "./trpc";
import { callRouter } from "./routers/callMock";
import { searchRouter } from "./routers/searchMock";

// Create a patched appRouter with mock implementations
export const createMockAppRouter = () => {
    console.log("Creating tRPC router");

    // Create a new router with mock implementations
    const appRouter = createTRPCRouter({
        _call: callRouter,
        search: searchRouter,
        // Add more mock routers as needed
    });

    console.log("tRPC router initialized with mocks");

    return appRouter;
};