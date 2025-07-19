// Create a new file: src/server/api/routers/agentMock.ts

import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

// Create mock agent data
const MOCK_AGENTS = [
    {
        id: "agent_mock0",
        name: "Customer Service Bot",
        customerAgentId: "cs_bot_1",
        phoneNumber: "+15551234567",
        systemPrompt: "You are a helpful customer service assistant.",
        ownerId: "org_mock123456",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: "agent_mock1",
        name: "Sales Assistant",
        customerAgentId: "sales_assistant_1",
        phoneNumber: "+15557654321",
        systemPrompt: "You are a friendly sales assistant.",
        ownerId: "org_mock123456",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: "agent_mock2",
        name: "Technical Support",
        customerAgentId: "tech_support_1",
        phoneNumber: "+15559876543",
        systemPrompt: "You are a technical support specialist.",
        ownerId: "org_mock123456",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
];

// Mock implementation of agent router
export const agentRouter = createTRPCRouter({
    getAll: publicProcedure
        .query(() => {
            console.log("Mock agent.getAll called");
            return MOCK_AGENTS;
        }),

    getById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(({ input }) => {
            console.log("Mock agent.getById called with:", input);
            return MOCK_AGENTS.find(agent => agent.id === input.id) || null;
        }),

    create: publicProcedure
        .input(
            z.object({
                name: z.string(),
                customerAgentId: z.string().optional(),
                phoneNumber: z.string().optional(),
                systemPrompt: z.string().optional(),
            })
        )
        .mutation(({ input }) => {
            console.log("Mock agent.create called with:", input);
            const newAgent = {
                id: `agent_mock${MOCK_AGENTS.length}`,
                name: input.name,
                customerAgentId: input.customerAgentId || `custom_${Math.random().toString(36).substring(2, 9)}`,
                phoneNumber: input.phoneNumber || `+1555${Math.floor(Math.random() * 10000000)}`,
                systemPrompt: input.systemPrompt || "You are a helpful assistant.",
                ownerId: "org_mock123456",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            MOCK_AGENTS.push(newAgent);
            return newAgent;
        }),

    update: publicProcedure
        .input(
            z.object({
                id: z.string(),
                name: z.string().optional(),
                customerAgentId: z.string().optional(),
                phoneNumber: z.string().optional(),
                systemPrompt: z.string().optional(),
            })
        )
        .mutation(({ input }) => {
            console.log("Mock agent.update called with:", input);
            const agentIndex = MOCK_AGENTS.findIndex(agent => agent.id === input.id);

            if (agentIndex >= 0) {
                MOCK_AGENTS[agentIndex] = {
                    ...MOCK_AGENTS[agentIndex],
                    ...input,
                    updatedAt: new Date().toISOString(),
                };
                return MOCK_AGENTS[agentIndex];
            }

            return null;
        }),
});