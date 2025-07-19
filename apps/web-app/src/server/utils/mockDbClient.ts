// Create this file at: apps/web-app/src/server/utils/mockDbClient.ts

import { PrismaClient } from "@prisma/client";

// Create a mock PrismaClient
export const createMockPrismaClient = () => {
    return {
        call: {
            findMany: async () => [],
            findUnique: async () => null,
            create: async (data: any) => ({ id: "mock-id", ...data.data }),
            update: async (data: any) => ({ id: "mock-id", ...data.data }),
            delete: async () => ({ id: "mock-id" }),
            count: async () => 0,
            findFirst: async () => null,
            groupBy: async () => []
        },
        agent: {
            findMany: async () => [],
            findUnique: async () => null,
            upsert: async (data: any) => ({ id: "mock-id", ...data.create }),
            create: async (data: any) => ({ id: "mock-id", ...data.data }),
            update: async (data: any) => ({ id: "mock-id", ...data.data }),
            delete: async () => ({ id: "mock-id" })
        },
        testAgent: {
            findMany: async () => [],
        },
        apiKey: {
            findFirst: async () => ({ apiKey: "mock-api-key" }),
            upsert: async (data: any) => ({ apiKey: "mock-api-key", orgId: data.where.orgId })
        },
        savedSearch: {
            findFirst: async () => null,
            findMany: async () => [],
            create: async (data: any) => ({ id: "mock-id", ...data.data }),
            update: async (data: any) => ({ id: "mock-id", ...data.data }),
            delete: async () => ({ id: "mock-id" })
        },
        // Add other models as needed

        // These methods are necessary
        $connect: async () => { },
        $disconnect: async () => { },
        $transaction: async (fn: any) => Array.isArray(fn) ? Promise.all(fn) : fn(),
        $on: () => { },
        $use: () => { },
        $extends: () => { },
        destroy: () => { } // Add this method to fix the error
    } as unknown as PrismaClient;
};