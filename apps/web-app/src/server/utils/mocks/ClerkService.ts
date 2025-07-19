// /mnt/e/10xR/playground/fixa-observe/apps/web-app/src/server/utils/mocks/ClerkService.ts
import { PrismaClient } from "@repo/db/src/index";

export class ClerkService {
    readonly clerkClient: any;

    constructor(private db: PrismaClient) {
        this.clerkClient = {
            organizations: {
                getOrganization: async () => ({
                    id: 'mock-org-id',
                    name: 'Mock Organization',
                    publicMetadata: { freeTestsLeft: 5, freeObservabilityCallsLeft: 5 },
                    privateMetadata: {}
                }),
                getOrganizationList: async () => ({ data: [] }),
                updateOrganizationMetadata: async (orgId: string, metadata: any) => ({
                    id: orgId,
                    ...metadata
                })
            },
            users: {
                getUser: async (userId: string) => ({
                    id: userId,
                    firstName: 'Mock',
                    lastName: 'User',
                    publicMetadata: {},
                    privateMetadata: {}
                }),
                updateUserMetadata: async (userId: string, metadata: any) => ({
                    id: userId,
                    ...metadata
                })
            }
        };
    }

    async getOrg(orgId: string) {
        console.log("Mock ClerkService.getOrg called with:", { orgId });
        return {
            id: orgId,
            name: "Mock Organization",
            publicMetadata: { freeTestsLeft: 5, freeObservabilityCallsLeft: 5, stripeCustomerId: "mock-customer-id" },
            privateMetadata: {}
        };
    }

    async getUser(userId: string) {
        console.log("Mock ClerkService.getUser called with:", { userId });
        return {
            id: userId,
            firstName: "Mock",
            lastName: "User",
            emailAddresses: [{ emailAddress: "mock@example.com" }]
        };
    }

    async createApiKey({ orgId }: { orgId: string }) {
        console.log("Mock ClerkService.createApiKey called with:", { orgId });
        return { apiKey: "mock-api-key-" + Date.now(), orgId };
    }

    async getApiKey({ orgId }: { orgId: string }) {
        console.log("Mock ClerkService.getApiKey called with:", { orgId });
        return { apiKey: "mock-api-key", orgId };
    }

    async getPublicMetadata({ orgId, userId }: { orgId?: string, userId?: string }) {
        console.log("Mock ClerkService.getPublicMetadata called with:", { orgId, userId });
        return { stripeCustomerId: "mock-customer-id", freeTestsLeft: 5, freeObservabilityCallsLeft: 5 };
    }

    async updatePublicMetadata({ orgId, userId, metadata }: { orgId?: string, userId?: string, metadata: any }) {
        console.log("Mock ClerkService.updatePublicMetadata called with:", { orgId, userId, metadata });
        return { id: orgId || userId, ...metadata };
    }

    async updatePrivateMetadata({ orgId, userId, metadata }: { orgId?: string, userId?: string, metadata: any }) {
        console.log("Mock ClerkService.updatePrivateMetadata called with:", { orgId, userId, metadata });
        return { id: orgId || userId, ...metadata };
    }

    async decrementFreeTestsLeft({ orgId }: { orgId: string }) {
        console.log("Mock ClerkService.decrementFreeTestsLeft called with:", { orgId });
        return;
    }

    async decrementFreeObservabilityCallsLeft({ orgId }: { orgId: string }) {
        console.log("Mock ClerkService.decrementFreeObservabilityCallsLeft called with:", { orgId });
        return;
    }
}