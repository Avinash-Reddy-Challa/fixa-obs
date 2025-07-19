// apps/node-server/src/env.ts
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

// Mock values for development
const mockEnv = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "sk-mock-key",
  VAPI_API_KEY: "mock-vapi-key",
  HOST: process.env.HOST || "localhost",
  PORT: process.env.PORT || "3000",
  ENVIRONMENT: process.env.ENVIRONMENT || "development",
  DEBUG: process.env.DEBUG || "true",
  LOCAL_STORAGE_PATH: process.env.LOCAL_STORAGE_PATH || "uploads",
  AUDIO_SERVICE_URL: process.env.AUDIO_SERVICE_URL || "http://localhost:8000",
  GCP_CREDENTIALS: process.env.GCP_CREDENTIALS || "{}",
  GOOGLE_CLOUD_BUCKET_NAME: process.env.GOOGLE_CLOUD_BUCKET_NAME || "mock-bucket",
  NEXT_BASE_URL: process.env.NEXT_BASE_URL || "http://localhost:3000",
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY || "mock-clerk-key",
  NODE_SERVER_URL: process.env.NODE_SERVER_URL || "http://localhost:3000",
  DATABASE_URL: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/fixa",
  DIRECT_URL: process.env.DIRECT_URL || "postgresql://postgres:postgres@localhost:5432/fixa",
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "mock-stripe-key",
  TESTING_MINUTES_PRICE_ID: process.env.TESTING_MINUTES_PRICE_ID || "mock-price-id",
  TESTING_MINUTES_EVENT_NAME: process.env.TESTING_MINUTES_EVENT_NAME || "testing.minutes",
  OBSERVABILITY_MINUTES_PRICE_ID: process.env.OBSERVABILITY_MINUTES_PRICE_ID || "mock-price-id",
  OBSERVABILITY_MINUTES_EVENT_NAME: process.env.OBSERVABILITY_MINUTES_EVENT_NAME || "observability.minutes",
  SLACK_ANALYTICS_BOT_WEBHOOK_URL: process.env.SLACK_ANALYTICS_BOT_WEBHOOK_URL || "http://localhost:8000/mock/webhook",
  NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY || "mock-posthog-key",
  NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST || "http://localhost:8000",
  OFONE_KIOSK_ENDPOINT: process.env.OFONE_KIOSK_ENDPOINT || "http://localhost:8000/mock/kiosk",
  NODE_SERVER_SECRET: process.env.NODE_SERVER_SECRET || "mock-server-secret",
  PYTHON_SERVER_SECRET: process.env.PYTHON_SERVER_SECRET || "mock-python-secret",
  KEYWORDSAI_API_KEY: process.env.KEYWORDSAI_API_KEY || "mock-keywords-key",
  FIXA_DEMO_API_KEY: process.env.FIXA_DEMO_API_KEY || "mock-demo-key"
};

// Override process.env with mock values for development
if (process.env.NODE_ENV !== 'production') {
  Object.keys(mockEnv).forEach(key => {
    if (!process.env[key]) {
      process.env[key] = mockEnv[key as keyof typeof mockEnv];
    }
  });
}

const envSchema = z.object({
  OPENAI_API_KEY: z.string(),
  VAPI_API_KEY: z.string(),
  HOST: z.string().min(1),
  PORT: z.string().transform((val) => parseInt(val)),
  ENVIRONMENT: z.enum(["development", "production", "test"]),
  DEBUG: z.string().transform((val) => val === "true"),
  // Remove AWS S3 specific vars
  // AWS_BUCKET_NAME: z.string().min(1),
  // AWS_BUCKET_REGION: z.string().min(1),
  // AWS_ACCESS_KEY_ID: z.string().min(1),
  // AWS_SECRET_ACCESS_KEY: z.string().min(1),

  // Add local storage configuration
  LOCAL_STORAGE_PATH: z.string().default("uploads"),

  AUDIO_SERVICE_URL: z.string().min(1),
  GCP_CREDENTIALS: z.string().min(1),
  GOOGLE_CLOUD_BUCKET_NAME: z.string().min(1),
  NEXT_BASE_URL: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),
  // SQS_QUEUE_URL: z.string().min(1),
  NODE_SERVER_URL: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().min(1),
  TESTING_MINUTES_PRICE_ID: z.string().min(1),
  TESTING_MINUTES_EVENT_NAME: z.string().min(1),
  OBSERVABILITY_MINUTES_PRICE_ID: z.string().min(1),
  OBSERVABILITY_MINUTES_EVENT_NAME: z.string().min(1),
  SLACK_ANALYTICS_BOT_WEBHOOK_URL: z.string().min(1),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().min(1),
  OFONE_KIOSK_ENDPOINT: z.string().min(1),
  NODE_SERVER_SECRET: z.string().min(1),
  PYTHON_SERVER_SECRET: z.string().min(1),
  KEYWORDSAI_API_KEY: z.string().min(1),
  FIXA_DEMO_API_KEY: z.string().min(1),
});

// Validate and transform environment variables
const validateEnv = () => {
  // Skip validation in development
  if (process.env.SKIP_ENV_VALIDATION || process.env.NODE_ENV !== 'production') {
    return process.env as unknown as z.infer<typeof envSchema>;
  }

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("❌ Invalid environment variables:");

    // Get all required env vars
    const requiredVars = Object.keys(envSchema.shape);

    // Check which ones are missing or invalid
    requiredVars.forEach((varName) => {
      if (!(varName in process.env)) {
        console.error(`Missing ${varName}`);
      } else if (
        result.error.formErrors.fieldErrors[
        varName as keyof typeof envSchema.shape
        ]
      ) {
        console.error(
          `Invalid ${varName}: ${result.error.formErrors.fieldErrors[varName as keyof typeof envSchema.shape]}`,
        );
      }
    });

    throw new Error("Invalid environment variables");
  }

  return result.data;
};

export const env = validateEnv();