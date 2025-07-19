// File: src/server/api/routers/callMock.ts

import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { generateMockCalls, filterMockCalls } from "./mockData";

// Cache for mock calls
const MOCK_CALLS = generateMockCalls(20);

// Define input schema for the filter
const FilterSchema = z.object({
    agentId: z.array(z.string()).optional(),
    lookbackPeriod: z.object({
        label: z.string(),
        value: z.number()
    }).optional(),
    chartPeriod: z.number().nullable().optional(),
    timeRange: z.object({
        start: z.number(),
        end: z.number()
    }).nullable().optional(),
    metadata: z.record(z.union([z.string(), z.array(z.string())])).optional(),
    evaluationGroupResult: z.object({
        id: z.string(),
        result: z.boolean().nullable()
    }).nullable().optional(),
    customerCallId: z.string().nullable().optional()
}).optional();

// Mock implementation of call router
export const callRouter = createTRPCRouter({
    getCalls: publicProcedure
        .input(
            z.object({
                limit: z.number().optional(),
                filter: FilterSchema,
                orderBy: z.any().optional(),
                direction: z.string().optional(),
            })
        )
        .query(({ input }) => {
            console.log("Mock _call.getCalls called with:", input);
            console.log("Filter metadata:", input.filter?.metadata);

            // Apply filtering based on filter criteria
            let filteredCalls = [...MOCK_CALLS];
            console.log("Total calls before filtering:", filteredCalls.length);

            if (input.filter) {
                // Use try/catch in case filterMockCalls has issues
                try {
                    filteredCalls = filterMockCalls(filteredCalls, input.filter);
                    console.log("Calls after filtering:", filteredCalls.length);
                } catch (error) {
                    console.error("Error filtering calls:", error);
                }
            }

            // Apply sorting if orderBy is provided
            if (input.orderBy) {
                filteredCalls.sort((a, b) => {
                    const aValue = a[input.orderBy.property];
                    const bValue = b[input.orderBy.property];

                    if (aValue < bValue) return input.orderBy.direction === 'desc' ? 1 : -1;
                    if (aValue > bValue) return input.orderBy.direction === 'desc' ? -1 : 1;
                    return 0;
                });
            } else {
                // Default sort by most recent
                filteredCalls.sort((a, b) =>
                    new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
                );
            }

            // Apply limit if provided
            const limitedCalls = input.limit ? filteredCalls.slice(0, input.limit) : filteredCalls;

            // Ensure all required properties exist
            const validCalls = limitedCalls.map(call => ({
                id: call.id || `mock-call-${Math.random().toString(36).substring(2, 9)}`,
                customerCallId: call.customerCallId || call.id || `mock-call-${Math.random().toString(36).substring(2, 9)}`,
                startedAt: call.startedAt || new Date().toISOString(),
                endedAt: call.endedAt || new Date().toISOString(),
                status: call.status || "completed",
                result: call.result || "success",
                ...call,
            }));

            return {
                items: validCalls,
                nextCursor: null,
            };
        }),

    getLatencyInterruptionPercentiles: publicProcedure
        .input(
            z.object({
                filter: FilterSchema,
            })
        )
        .query(({ input }) => {
            console.log("Mock _call.getLatencyInterruptionPercentiles called with:", input);

            // Generate 48 hours of mock data (2 days)
            const now = new Date();
            const twoHoursInMs = 2 * 60 * 60 * 1000;
            const dataPoints = [];

            // Determine chart period (hourly by default)
            const chartPeriod = input.filter?.chartPeriod || 3600000; // Default to 1 hour
            const intervals = 48 * 3600000 / chartPeriod; // Calculate number of intervals

            // Generate data points based on the chart period
            for (let i = 0; i < intervals; i++) {
                const timestamp = new Date(now.getTime() - (intervals - 1 - i) * chartPeriod);
                dataPoints.push({
                    timestamp: timestamp.toISOString(),
                    latencyP50: 1 + Math.random() * 1.5,
                    latencyP90: 2 + Math.random() * 2,
                    latencyP95: 3 + Math.random() * 2.5,
                    interruptionP50: 0.1 + Math.random() * 0.3,
                    interruptionP90: 0.3 + Math.random() * 0.5,
                    interruptionP95: 0.5 + Math.random() * 0.7,
                });
            }

            return dataPoints;
        }),

    updateIsRead: publicProcedure
        .input(
            z.object({
                id: z.string(),
                isRead: z.boolean(),
            })
        )
        .mutation(({ input }) => {
            console.log("Mock _call.updateIsRead called with:", input);

            // Find the call in our mock data and update it
            const callIndex = MOCK_CALLS.findIndex(call => call.id === input.id);
            if (callIndex >= 0) {
                MOCK_CALLS[callIndex].isRead = input.isRead;
            }

            return { success: true };
        }),

    updateNotes: publicProcedure
        .input(
            z.object({
                id: z.string(),
                notes: z.string(),
            })
        )
        .mutation(({ input }) => {
            console.log("Mock _call.updateNotes called with:", input);

            // Find the call in our mock data and update it
            const callIndex = MOCK_CALLS.findIndex(call => call.id === input.id);
            if (callIndex >= 0) {
                MOCK_CALLS[callIndex].notes = input.notes;
            }

            return { success: true };
        }),

    checkIfACallExists: publicProcedure
        .query(() => {
            console.log("Mock _call.checkIfACallExists called");
            return MOCK_CALLS.length > 0;
        }),

    getCallByCustomerCallId: publicProcedure
        .input(
            z.object({
                customerCallId: z.string(),
            })
        )
        .query(({ input }) => {
            console.log("Mock _call.getCallByCustomerCallId called with:", input);
            return MOCK_CALLS.find(call => call.customerCallId === input.customerCallId) || null;
        }),

    getMetadata: publicProcedure
        .query(() => {
            console.log("Mock _call.getMetadata called");
            return [
                { category: "billing", subCategory: "invoice" },
                { type: "question", priority: "high" },
                { language: "en", region: "us" }
            ];
        }),
    getAudioUrl: publicProcedure
        .input(z.object({ callId: z.string() }))
        .query(({ input }) => {
            console.log("Mock _call.getAudioUrl called with:", input);

            // Find the call in our mock data
            const call = MOCK_CALLS.find(call => call.id === input.callId);
            if (!call) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Call not found",
                });
            }

            // If the stereoRecordingUrl is already a full URL, return it
            if (call.stereoRecordingUrl && call.stereoRecordingUrl.startsWith('http')) {
                return { url: call.stereoRecordingUrl };
            }

            // Return a mock audio URL
            return {
                url: `https://tenxrvoiceairecordings.nyc3.digitaloceanspaces.com/mock/calls/${call.id}/recording.wav`
            };
        }),
});