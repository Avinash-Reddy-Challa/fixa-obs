// /mnt/e/10xR/playground/fixa-observe/apps/web-app/src/server/utils/mocks/Schemas.ts
import { z } from "zod";

// Agent Schema
export const AgentSchema = z.object({
    id: z.string().optional(),
    name: z.string(),
    phoneNumber: z.string(),
    systemPrompt: z.string(),
    customerAgentId: z.string().optional(),
});

// Filter Schema
export const FilterSchema = z.object({
    agentId: z.array(z.string()).optional(),
    lookbackPeriod: z.any().optional(),
    chartPeriod: z.number().optional(),
    timeRange: z.object({
        start: z.number(),
        end: z.number(),
    }).optional(),
    metadata: z.record(z.union([z.string(), z.array(z.string())])).optional(),
    evaluationGroupResult: z.object({
        id: z.string(),
        result: z.boolean().nullable(),
    }).optional(),
    customerCallId: z.string().optional(),
});

// SavedSearch Schema
export const SavedSearchWithIncludesSchema = z.object({
    id: z.string(),
    name: z.string(),
    filter: FilterSchema,
    ownerId: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
    default: z.boolean().optional(),
});

// Order By Schema
export const OrderBySchema = z.object({
    field: z.string(),
    direction: z.enum(["asc", "desc"]),
});

// Block Change Schema
export const BlockChangeSchema = z.object({
    id: z.string().optional(),
    callId: z.string().optional(),
    start: z.number(),
    end: z.number(),
    type: z.enum(["latency", "interruption"]),
    data: z.any(),
});

// Evaluation Schema
export const EvaluationSchema = z.object({
    id: z.string().optional(),
    name: z.string(),
    prompt: z.string(),
    enabled: z.boolean().optional(),
    agentId: z.string(),
});

// General Evaluation Schema
export const GeneralEvaluationWithIncludesSchema = z.object({
    id: z.string().optional(),
    name: z.string(),
    prompt: z.string(),
    agentId: z.string(),
    enabled: z.boolean().optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});

// Evaluation Template Schema
export const EvaluationTemplateSchema = z.object({
    id: z.string().optional(),
    name: z.string(),
    description: z.string().optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});

// Evaluation Group Schema
export const EvaluationGroupWithIncludesSchema = z.object({
    id: z.string().optional(),
    name: z.string(),
    description: z.string().optional(),
    evaluations: z.array(z.any()).optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});

// Alert Schema
export const AlertWithDetailsSchema = z.object({
    id: z.string().optional(),
    name: z.string(),
    enabled: z.boolean(),
    type: z.enum(["latency", "evalset"]),
    details: z.any(),
    lastAlerted: z.date().nullable().optional(),
    cooldownMinutes: z.number(),
    savedSearchId: z.string().optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});

// Scenario Schema
export const ScenarioWithIncludesSchema = z.object({
    id: z.string().optional(),
    name: z.string(),
    description: z.string().optional(),
    agentId: z.string().optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});

// Public Metadata
export interface PublicMetadata {
    stripeCustomerId?: string;
    freeTestsLeft?: number;
    freeObservabilityCallsLeft?: number;
    slackWebhookUrl?: string;
}