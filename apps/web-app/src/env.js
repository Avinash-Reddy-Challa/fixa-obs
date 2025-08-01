import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

// Helper function to make fields optional in development
const optionalInDev = (schema) => {
  if (process.env.NODE_ENV === "development" || process.env.SKIP_ENV_VALIDATION === "true") {
    return schema.optional().default("");
  }
  return schema;
};

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    CLERK_SECRET_KEY: optionalInDev(z.string()),
    CLERK_WEBHOOK_SECRET: optionalInDev(z.string()),
    // LISTMONK_USERNAME: optionalInDev(z.string()),
    // LISTMONK_PASSWORD: optionalInDev(z.string()),
    // LISTMONK_URL: optionalInDev(z.string().url()),
    // LISTMONK_LIST_ID: z.number().optional().default(1),
    ANTHROPIC_KEY: optionalInDev(z.string()),
    OPENAI_KEY: optionalInDev(z.string()),
    GCLOUD_CREDS: optionalInDev(z.string()),
    RETELL_API_KEY: optionalInDev(z.string()),
    VAPI_API_KEY: optionalInDev(z.string()),
    SLACK_CLIENT_SECRET: optionalInDev(z.string()),
    STRIPE_SECRET_KEY: optionalInDev(z.string()),
    STRIPE_WEBHOOK_SECRET: optionalInDev(z.string()),
    TESTING_MINUTES_PRICE_ID: optionalInDev(z.string()),
    TESTING_MINUTES_EVENT_NAME: optionalInDev(z.string()),
    OBSERVABILITY_MINUTES_PRICE_ID: optionalInDev(z.string()),
    OBSERVABILITY_MINUTES_EVENT_NAME: optionalInDev(z.string()),
    SLACK_ANALYTICS_BOT_WEBHOOK_URL: optionalInDev(z.string()),
    NODE_SERVER_SECRET: optionalInDev(z.string()),
    KEYWORDSAI_API_KEY: optionalInDev(z.string()),
    DEMO_ORG_ID: optionalInDev(z.string()),
    ADMIN_ORG_ID: optionalInDev(z.string()),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_POSTHOG_KEY: optionalInDev(z.string()),
    NEXT_PUBLIC_POSTHOG_HOST: optionalInDev(z.string()),
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: optionalInDev(z.string()),
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: optionalInDev(z.string()),
    NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL: optionalInDev(z.string()),
    NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL: optionalInDev(z.string()),
    NEXT_PUBLIC_SOCKET_URL: optionalInDev(z.string()),
    NEXT_PUBLIC_SERVER_URL: optionalInDev(z.string()),
    NEXT_PUBLIC_SLACK_CLIENT_ID: optionalInDev(z.string()),
    NEXT_PUBLIC_SLACK_REDIRECT_URI: optionalInDev(z.string()),
    NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_URL: optionalInDev(z.string()),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
    NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL:
      process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL,
    NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL:
      process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL,
    CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    // LISTMONK_USERNAME: process.env.LISTMONK_USERNAME,
    // LISTMONK_PASSWORD: process.env.LISTMONK_PASSWORD,
    // // LISTMONK_URL: process.env.LISTMONK_URL,
    // LISTMONK_LIST_ID: parseInt(process.env.LISTMONK_LIST_ID ?? "1"),
    ANTHROPIC_KEY: process.env.ANTHROPIC_KEY,
    OPENAI_KEY: process.env.OPENAI_KEY,
    GCLOUD_CREDS: process.env.GCLOUD_CREDS,
    RETELL_API_KEY: process.env.RETELL_API_KEY,
    VAPI_API_KEY: process.env.VAPI_API_KEY,
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
    NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL,
    NEXT_PUBLIC_SLACK_CLIENT_ID: process.env.NEXT_PUBLIC_SLACK_CLIENT_ID,
    NEXT_PUBLIC_SLACK_REDIRECT_URI: process.env.NEXT_PUBLIC_SLACK_REDIRECT_URI,
    SLACK_CLIENT_SECRET: process.env.SLACK_CLIENT_SECRET,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    TESTING_MINUTES_PRICE_ID: process.env.TESTING_MINUTES_PRICE_ID,
    TESTING_MINUTES_EVENT_NAME: process.env.TESTING_MINUTES_EVENT_NAME,
    NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_URL:
      process.env.NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_URL,
    OBSERVABILITY_MINUTES_PRICE_ID: process.env.OBSERVABILITY_MINUTES_PRICE_ID,
    OBSERVABILITY_MINUTES_EVENT_NAME:
      process.env.OBSERVABILITY_MINUTES_EVENT_NAME,
    SLACK_ANALYTICS_BOT_WEBHOOK_URL:
      process.env.SLACK_ANALYTICS_BOT_WEBHOOK_URL,
    NODE_SERVER_SECRET: process.env.NODE_SERVER_SECRET,
    KEYWORDSAI_API_KEY: process.env.KEYWORDSAI_API_KEY,
    DEMO_ORG_ID: process.env.DEMO_ORG_ID,
    ADMIN_ORG_ID: process.env.ADMIN_ORG_ID,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});