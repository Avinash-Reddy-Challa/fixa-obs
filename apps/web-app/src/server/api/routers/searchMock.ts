// File: src/server/api/routers/searchMock.ts
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

// Mock saved searches
const MOCK_SAVED_SEARCHES = [
    {
        id: "default-search",
        name: "All Calls",
        filter: {
            agentId: [],
            lookbackPeriod: {
                label: "2 days",
                value: 172800000
            },
            chartPeriod: 3600000, // 1 hour
            metadata: {
                test: "false"
            },
        },
        isDefault: true,
        ownerId: "org_mock123456",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: "high-latency-search",
        name: "High Latency Calls",
        filter: {
            agentId: [],
            lookbackPeriod: {
                label: "7 days",
                value: 604800000
            },
            chartPeriod: 86400000, // 24 hours
            metadata: {
                test: "false",
                latencyP90: ">3"
            },
        },
        isDefault: false,
        ownerId: "org_mock123456",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: "test-calls-search",
        name: "Test Calls Only",
        filter: {
            agentId: [],
            lookbackPeriod: {
                label: "24 hours",
                value: 86400000
            },
            chartPeriod: 3600000, // 1 hour
            metadata: {
                test: "true"
            },
        },
        isDefault: false,
        ownerId: "org_mock123456",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
];

// Mock implementation of search router
export const searchRouter = createTRPCRouter({
    getAll: publicProcedure
        .input(z.object({
            includeDefault: z.boolean().optional()
        }).optional())
        .query(({ input }) => {
            console.log("Mock search.getAll called with:", input);
            if (input?.includeDefault === false) {
                return MOCK_SAVED_SEARCHES.filter(search => !search.isDefault);
            }
            return MOCK_SAVED_SEARCHES;
        }),

    getDefault: publicProcedure
        .query(() => {
            console.log("Mock search.getDefault called");
            return MOCK_SAVED_SEARCHES.find(search => search.isDefault) || MOCK_SAVED_SEARCHES[0];
        }),

    save: publicProcedure
        .input(
            z.object({
                id: z.string().optional(),
                name: z.string(),
                filter: z.any(),
                isDefault: z.boolean().optional(),
            })
        )
        .mutation(({ input }) => {
            console.log("Mock search.save called with:", input);

            const newSearch = {
                id: input.id || `search-${Date.now()}`,
                name: input.name,
                filter: input.filter,
                isDefault: input.isDefault || false,
                ownerId: "org_mock123456",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            // If this is set as default, unset others
            if (newSearch.isDefault) {
                MOCK_SAVED_SEARCHES.forEach(search => {
                    search.isDefault = false;
                });
            }

            // If updating existing search
            const existingIndex = MOCK_SAVED_SEARCHES.findIndex(search => search.id === newSearch.id);
            if (existingIndex >= 0) {
                MOCK_SAVED_SEARCHES[existingIndex] = newSearch;
            } else {
                // Add new search
                MOCK_SAVED_SEARCHES.push(newSearch);
            }

            return newSearch;
        }),
});