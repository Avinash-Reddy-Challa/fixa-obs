// /mnt/e/10xR/playground/fixa-observe/apps/node-server/src/utils/mocks/StripeService.ts

export class StripeService {
    constructor(private db: any) {
        console.log("Running Stripe service in mock mode");
    }

    checkEnv() {
        // Do nothing for mock
    }

    async createCheckoutUrl({ orgId, origin, redirectUrl }: { orgId: string, origin: string, redirectUrl?: string }) {
        console.log("Mock StripeService.createCheckoutUrl called with:", { orgId, origin, redirectUrl });
        return "https://example.com/mock-checkout-url";
    }

    async getCustomerId(orgId: string) {
        console.log("Mock StripeService.getCustomerId called with:", { orgId });
        return "mock-customer-id";
    }

    // Add other methods that might be used in node-server
}