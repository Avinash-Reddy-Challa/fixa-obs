// /mnt/e/10xR/playground/fixa-observe/apps/web-app/src/server/utils/mocks/PrismaClient.ts

// Add some mock data for calls
const mockCalls = Array(20).fill(0).map((_, i) => ({
    id: `mock-call-${i}`,
    createdAt: new Date(Date.now() - i * 3600000), // Each call 1 hour apart
    ownerId: "org_2zjBE8eyBmo4zZXnXyfWgFOTMWT",
    deleted: false,
    vapiCallId: `vapi-${i}`,
    customerCallId: `customer-call-${i}`,
    ofOneDeviceId: null,
    status: "completed",
    result: "success",
    failureReason: null,
    stereoRecordingUrl: `https://example.com/recordings/stereo-${i}.wav`,
    monoRecordingUrl: `https://example.com/recordings/mono-${i}.wav`,
    startedAt: new Date(Date.now() - i * 3600000),
    endedAt: new Date(Date.now() - i * 3600000 + 300000), // 5 minute calls
    regionId: "us-west-1",
    metadata: { test: "false" },
    timeToFirstWord: 0.8 + Math.random() * 0.5,
    latencyP50: 1.2 + Math.random() * 0.5,
    latencyP90: 2.5 + Math.random() * 0.5,
    latencyP95: 3.0 + Math.random() * 0.5,
    interruptionP50: 1,
    interruptionP90: 3,
    interruptionP95: 5,
    numInterruptions: Math.floor(Math.random() * 5),
    duration: 300, // 5 minutes in seconds
    notes: i % 3 === 0 ? `Note for call ${i}` : null,
    isRead: i % 2 === 0,
    readBy: i % 2 === 0 ? ["user-1"] : [],
    agentId: "mock-agent-id",
    testId: i % 3 === 0 ? `mock-test-${i}` : null,
    testAgentId: i % 3 === 0 ? `mock-test-agent-${i}` : null,
    scenarioId: i % 3 === 0 ? `mock-scenario-${i}` : null,
    evalSetToSuccess: Math.random() > 0.5
}));

export class MockPrismaClient {
    // Add a property to track if destroyed
    private _destroyed = false;

    // Create mock tables
    savedSearch = {
        findFirst: async () => {
            console.log("Mock PrismaClient.savedSearch.findFirst called");
            return {
                id: "default-search",
                name: "Default Search",
                filter: {},
                ownerId: "mock-owner-id",
                createdAt: new Date(),
                updatedAt: new Date(),
                isDefault: true,
                agentId: null,
                lookbackPeriod: "24h",
                timeRange: null,
                chartPeriod: 30,
                customerCallId: null,
                metadata: {}
            };
        },
        findMany: async () => {
            console.log("Mock PrismaClient.savedSearch.findMany called");
            return [{
                id: "default-search",
                name: "Default Search",
                filter: {},
                ownerId: "mock-owner-id",
                createdAt: new Date(),
                updatedAt: new Date(),
                isDefault: true,
                agentId: null,
                lookbackPeriod: "24h",
                timeRange: null,
                chartPeriod: 30,
                customerCallId: null,
                metadata: {}
            }];
        },
        create: async (data: any) => {
            console.log("Mock PrismaClient.savedSearch.create called with:", data);
            return {
                id: "mock-saved-search-" + Date.now(),
                ...data.data,
                createdAt: new Date(),
                updatedAt: new Date()
            };
        },
        update: async (data: any) => {
            console.log("Mock PrismaClient.savedSearch.update called with:", data);
            return {
                id: data.where.id,
                ...data.data,
                updatedAt: new Date()
            };
        },
        delete: async (data: any) => {
            console.log("Mock PrismaClient.savedSearch.delete called with:", data);
            return { id: data.where.id };
        }
    };

    // Enhanced call mock with filtering logic
    call = {
        findFirst: async (params: any) => {
            console.log("Mock PrismaClient.call.findFirst called with:", params);
            // For checkIfACallExists
            return mockCalls[0]; // Always return a call to indicate calls exist
        },
        findMany: async (params: any) => {
            console.log("Mock PrismaClient.call.findMany called with:", params);
            let filteredCalls = [...mockCalls];

            // Apply any where conditions
            if (params?.where) {
                if (params.where.ownerId) {
                    filteredCalls = filteredCalls.filter(call => call.ownerId === params.where.ownerId);
                }
                if (params.where.deleted !== undefined) {
                    filteredCalls = filteredCalls.filter(call => call.deleted === params.where.deleted);
                }
                if (params.where.startedAt) {
                    if (params.where.startedAt['gte']) {
                        const startDate = new Date(params.where.startedAt['gte']);
                        filteredCalls = filteredCalls.filter(call =>
                            call.startedAt >= startDate
                        );
                    }
                }
                if (params.where.customerCallId !== undefined) {
                    if (params.where.customerCallId === null) {
                        filteredCalls = filteredCalls.filter(call => call.customerCallId === null);
                    } else {
                        filteredCalls = filteredCalls.filter(call => call.customerCallId === params.where.customerCallId);
                    }
                }
            }

            // Apply ordering
            if (params?.orderBy) {
                const field = Object.keys(params.orderBy)[0];
                if (field !== undefined) {
                    const direction = params.orderBy[field];

                    filteredCalls.sort((a, b) => {
                        if (direction === 'asc') {
                            return a[field] < b[field] ? -1 : 1;
                        } else {
                            return a[field] > b[field] ? -1 : 1;
                        }
                    });
                }
            }

            // Apply pagination
            if (params?.take) {
                const skip = params.skip || 0;
                filteredCalls = filteredCalls.slice(skip, skip + params.take);
            }

            return filteredCalls;
        },
        findUnique: async (params: any) => {
            console.log("Mock PrismaClient.call.findUnique called with:", params);
            if (params?.where?.id) {
                return mockCalls.find(call => call.id === params.where.id) || null;
            }
            if (params?.where?.customerCallId) {
                return mockCalls.find(call => call.customerCallId === params.where.customerCallId) || null;
            }
            return null;
        },
        create: async (params: any) => {
            console.log("Mock PrismaClient.call.create called with:", params);
            const newCall = {
                id: `mock-call-${Date.now()}`,
                createdAt: new Date(),
                ...params.data
            };
            mockCalls.unshift(newCall);
            return newCall;
        },
        update: async (params: any) => {
            console.log("Mock PrismaClient.call.update called with:", params);
            const callIndex = mockCalls.findIndex(call => call.id === params.where.id);
            if (callIndex !== -1) {
                mockCalls[callIndex] = {
                    ...mockCalls[callIndex],
                    ...params.data,
                    updatedAt: new Date()
                };
                return mockCalls[callIndex];
            }
            return { id: params.where.id, ...params.data };
        },
        count: async () => {
            return mockCalls.length;
        },
        groupBy: async () => {
            // Mock for percentile calculations
            return [];
        }
    };

    // Add mock for callRead table
    callRead = {
        upsert: async (params: any) => {
            console.log("Mock PrismaClient.callRead.upsert called with:", params);
            return {
                id: "mock-call-read-id",
                callId: params.where.callId,
                userId: params.create.userId,
                isRead: params.create.isRead
            };
        }
    };

    agent = {
        findUnique: async (params: any) => {
            console.log("Mock PrismaClient.agent.findUnique called with:", params);
            return {
                id: params?.where?.id || "mock-agent-id",
                name: "Mock Agent",
                phoneNumber: "+1234567890",
                systemPrompt: "Mock system prompt",
                ownerId: "org_2zjBE8eyBmo4zZXnXyfWgFOTMWT",
                createdAt: new Date(),
                updatedAt: new Date()
            };
        },
        findMany: async () => {
            console.log("Mock PrismaClient.agent.findMany called");
            return [
                {
                    id: "mock-agent-id",
                    name: "Mock Agent",
                    phoneNumber: "+1234567890",
                    systemPrompt: "Mock system prompt",
                    ownerId: "org_2zjBE8eyBmo4zZXnXyfWgFOTMWT",
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            ];
        },
        create: async (params: any) => {
            console.log("Mock PrismaClient.agent.create called with:", params);
            return {
                id: "mock-agent-id-" + Date.now(),
                ...params.data,
                createdAt: new Date(),
                updatedAt: new Date()
            };
        },
        update: async (params: any) => {
            console.log("Mock PrismaClient.agent.update called with:", params);
            return {
                id: params.where.id,
                ...params.data,
                updatedAt: new Date()
            };
        }
    };

    // Add mock transaction
    async $transaction(operations: any) {
        console.log("Mock PrismaClient.$transaction called");
        if (Array.isArray(operations)) {
            return Promise.all(operations);
        }
        return operations();
    }

    async $connect() {
        console.log("Mock PrismaClient.$connect called");
        return this;
    }

    async $disconnect() {
        console.log("Mock PrismaClient.$disconnect called");
        this._destroyed = true;
        return this;
    }

    // FIXED: Proper destroy method that returns void (not a function)
    destroy = () => {
        console.log("Mock PrismaClient.destroy called");
        this._destroyed = true;
        // No return value - this is the key fix
    };

    // These additional methods might be needed
    $on() {
        return this;
    }

    $use() {
        return this;
    }

    $extends() {
        return this;
    }

    // Getter to check if destroyed
    get isDestroyed() {
        return this._destroyed;
    }
}

// Create a singleton instance
export const mockPrismaClient = new MockPrismaClient();