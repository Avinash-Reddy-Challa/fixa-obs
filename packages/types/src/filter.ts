// packages/types/src/filter.ts
import { z } from "zod";
import { TimeRangeSchema } from "./db";

export type EvaluationGroupResult = z.infer<typeof EvaluationGroupResultSchema>;
export const EvaluationGroupResultSchema = z.object({
  id: z.string(),
  result: z.boolean().nullable(),
});

// Define lookback periods that can be used for defaults
export const lookbackPeriods = [
  {
    label: "24 hours",
    value: 86400000,
  },
  {
    label: "2 days",
    value: 172800000,
  },
  {
    label: "7 days",
    value: 604800000,
  },
  {
    label: "30 days",
    value: 2592000000,
  },
];

// Updated FilterSchema with defaults and optional fields
export type Filter = z.infer<typeof FilterSchema>;
export const FilterSchema = z.object({
  // Use .default() to provide default values for required fields
  lookbackPeriod: z.object({
    label: z.string(),
    value: z.number(),
  }).default(() => lookbackPeriods[0]),

  timeRange: z.union([TimeRangeSchema, z.null(), z.undefined()]).optional(),

  // Provide empty array as default
  agentId: z.array(z.string()).default([]),

  // Default to 1 hour in milliseconds
  chartPeriod: z.number().default(3600000),

  customerCallId: z.union([z.string(), z.null(), z.undefined()]).optional(),

  metadata: z.union([
    z.record(z.string(), z.string().or(z.array(z.string())).or(z.undefined())),
    z.null(),
    z.undefined(),
  ]).default(() => ({})),

  evaluationGroupResult: z.union([
    EvaluationGroupResultSchema,
    z.null(),
    z.undefined(),
  ]).optional(),
}).passthrough(); // Allow additional properties

// Define a default filter for convenience
export const defaultFilter: Filter = {
  agentId: [],
  lookbackPeriod: lookbackPeriods[0],
  chartPeriod: 3600000, // 1 hour in milliseconds
  metadata: {
    test: "false",
  },
};