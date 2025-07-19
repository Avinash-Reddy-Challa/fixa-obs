// /mnt/e/10xR/playground/fixa-observe/apps/web-app/src/server/utils/mocks/StripeService.ts
import { PrismaClient } from "@repo/db/src/index";

export class StripeService {
    constructor(private db: PrismaClient) { }

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

    async getCustomer(orgId: string) {
        console.log("Mock StripeService.getCustomer called with:", { orgId });
        return {
            id: "mock-customer-id",
            name: "Mock Customer",
            email: "mock@example.com",
            deleted: false
        };
    }

    async getSubscriptions(orgId: string) {
        console.log("Mock StripeService.getSubscriptions called with:", { orgId });
        return {
            data: [
                {
                    id: "mock-subscription-id",
                    items: {
                        data: [
                            {
                                id: "mock-subscription-item-id",
                                price: {
                                    id: "mock-price-id"
                                },
                                plan: {
                                    meter: "mock-meter-id"
                                }
                            }
                        ]
                    },
                    current_period_start: Math.floor(Date.now() / 1000) - 86400 * 15,
                    current_period_end: Math.floor(Date.now() / 1000) + 86400 * 15
                }
            ]
        };
    }

    async getMeterSummary({ orgId, meterId, start, end }: { orgId: string, meterId: string, start: Date, end: Date }) {
        console.log("Mock StripeService.getMeterSummary called with:", { orgId, meterId, start, end });
        return {
            data: [
                {
                    aggregated_value: 30,
                    timestamp: new Date().toISOString()
                }
            ]
        };
    }

    async accrueTestMinutes({ orgId, minutes }: { orgId: string, minutes: number }) {
        console.log("Mock StripeService.accrueTestMinutes called with:", { orgId, minutes });
        return;
    }

    async accrueObservabilityMinutes({ orgId, minutes }: { orgId: string, minutes: number }) {
        console.log("Mock StripeService.accrueObservabilityMinutes called with:", { orgId, minutes });
        return;
    }
}