// Modified /mnt/e/10xR/playground/fixa-observe/apps/web-app/src/server/utils/serviceFactory.ts

// Import real service implementations from @repo/services
import { db } from "../db"; // Real Prisma client
import {
    SearchService,
    CallService,
    AgentService,
    AlertService,
    ClerkService,
    EvaluationService,
    ScenarioService,

} from "@repo/services/src"; // Import all real services
import { SlackService } from "@repo/services/src/ee/slack";
import { StripeService } from "@repo/services/src/ee/stripe";
// For development debugging
const isDev = process.env.NODE_ENV === 'development';
if (isDev) {
    console.log("Using real database connection and services");
}

// Create service instances with the real Prisma client
export const searchService = new SearchService(db);
export const callService = new CallService(db);
export const agentService = new AgentService(db);
export const alertService = new AlertService(db);
export const clerkService = new ClerkService(db);
export const evaluationService = new EvaluationService(db);
export const scenarioService = new ScenarioService(db);
export const slackService = new SlackService();
export const stripeService = new StripeService(db);

// For PostHog, use mock implementation for now
// This could be replaced with a real PostHog client if available
const mockPostHogClient = {
    capture: () => Promise.resolve(),
    identify: () => Promise.resolve(),
    getFeatureFlag: () => Promise.resolve(true)
};

// Create TestService with real db but mock PostHog
import { TestService } from "@repo/services/src/test";
export const testService = new TestService(db, mockPostHogClient);

// Export for convenience
export const services = {
    searchService,
    callService,
    agentService,
    alertService,
    clerkService,
    evaluationService,
    scenarioService,
    slackService,
    stripeService,
    testService
};