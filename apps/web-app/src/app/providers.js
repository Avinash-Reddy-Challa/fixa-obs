"use client";
import { useState, useEffect } from "react";
import { PostHogProvider } from "posthog-js/react";

// Create a mock PostHog client for development
const createMockPostHog = () => ({
  init: () => mockPostHog,
  capture: () => mockPostHog,
  identify: () => mockPostHog,
  register: (properties) => {
    console.log("[MockPostHog] Register:", properties);
    return mockPostHog;
  },
  reset: () => {
    console.log("[MockPostHog] Reset");
    return mockPostHog;
  },
  reloadFeatureFlags: () => {
    console.log("[MockPostHog] Reload feature flags");
    return Promise.resolve({});
  },
  onFeatureFlags: (callback) => {
    console.log("[MockPostHog] On feature flags");
    setTimeout(() => callback({}), 0);
    return mockPostHog;
  },
  isFeatureEnabled: (flag) => {
    console.log("[MockPostHog] Is feature enabled:", flag);
    return false;
  },
  getFeatureFlag: (flag) => {
    console.log("[MockPostHog] Get feature flag:", flag);
    return null;
  },
  getAllFlags: () => {
    console.log("[MockPostHog] Get all flags");
    return {};
  },
  // Add any other methods PostHog uses
});

// Create initial mock instance
const mockPostHog = createMockPostHog();

export function CSPostHogProvider({ children }) {
  const [posthogClient, setPosthogClient] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY || "mock_posthog_key";

    try {
      // Use mock in development
      if (process.env.NODE_ENV === "development") {
        console.log("[PostHog] Using mock client in development");
        setPosthogClient(mockPostHog);
      } else {
        import("posthog-js").then((posthogModule) => {
          const posthog = posthogModule.default;
          posthog.init(posthogKey, {
            api_host: "https://app.posthog.com",
          });
          setPosthogClient(posthog);
        });
      }
    } catch (error) {
      console.error("[PostHog] Initialization error:", error);
      setPosthogClient(mockPostHog);
    }
  }, []);

  if (!posthogClient) return children;

  return <PostHogProvider client={posthogClient}>{children}</PostHogProvider>;
}