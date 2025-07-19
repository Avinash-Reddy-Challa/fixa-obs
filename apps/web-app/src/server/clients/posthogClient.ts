// Enhanced MockPostHog implementation
class MockPostHog {
  constructor(public apiKey: string, public options: any = {}) {
    console.log("Mock PostHog initialized with:", { apiKey, options });
  }

  // Add these methods to match the real PostHog SDK
  capture(params: any) {
    console.log("Mock PostHog capture:", params);
    return Promise.resolve({ status: "success" });
  }

  identify(params: any) {
    console.log("Mock PostHog identify:", params);
    return Promise.resolve({ status: "success" });
  }

  // Add additional mock methods
  init() {
    console.log("Mock PostHog init");
    return this;
  }

  reset() {
    console.log("Mock PostHog reset");
    return this;
  }

  register(properties: any) {
    console.log("Mock PostHog register:", properties);
    return this;
  }

  reloadFeatureFlags() {
    console.log("Mock PostHog reloadFeatureFlags");
    return Promise.resolve();
  }

  onFeatureFlags(callback: Function) {
    console.log("Mock PostHog onFeatureFlags");
    // Call the callback immediately with empty flags
    setTimeout(() => callback({}), 0);
    return this;
  }

  // Plus all your existing methods...

  shutdown() {
    console.log("Mock PostHog shutdown");
    return Promise.resolve();
  }
}

export const posthogClient = new MockPostHog("mock-posthog-key", { host: "https://app.posthog.com" });