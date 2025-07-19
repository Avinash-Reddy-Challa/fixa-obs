// /mnt/e/10xR/playground/fixa-observe/apps/node-server/src/utils/mocks/ClerkService.ts

export class ClerkService {
    readonly clerkClient: any;

    constructor(private db: any) {
        console.log("Running Clerk service in mock mode");
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

    // Add other methods that might be used in node-server
}