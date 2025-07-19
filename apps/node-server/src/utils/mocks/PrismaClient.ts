// /mnt/e/10xR/playground/fixa-observe/apps/node-server/src/utils/mocks/PrismaClient.ts

// Create a global storage for mock data
const mockStorage = {
    // Add some initial mock data for calls
    calls: Array(20).fill(0).map((_, i) => ({
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
    }))
};

export class MockPrismaClient {
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
        findMany: async (params: any) => {
            console.log("=== MOCK CALL.FINDMANY CALLED ===");
            console.log("Params:", JSON.stringify(params, null, 2));

            let results = mockStorage.calls.slice();
            console.log(`Starting with ${results.length} calls`);

            // Print all calls with their metadata and timestamps
            console.log("All calls before filtering:",
                results.map(call => ({
                    id: call.id,
                    createdAt: new Date(call.createdAt).toISOString(),
                    metadata: call.metadata,
                    agentId: call.agentId
                }))
            );

            // Apply filters if provided
            if (params?.where) {
                console.log("Applying filters:", JSON.stringify(params.where, null, 2));

                // Filter by time range if specified
                if (params.where.createdAt) {
                    if (params.where.createdAt.gte) {
                        const minDate = new Date(params.where.createdAt.gte);
                        console.log(`Filtering by createdAt >= ${minDate.toISOString()}`);

                        const beforeCount = results.length;
                        results = results.filter(call => {
                            const callDate = new Date(call.createdAt);
                            const passes = callDate >= minDate;
                            if (!passes) {
                                console.log(`EXCLUDED: Call ${call.id} createdAt: ${callDate.toISOString()} is before ${minDate.toISOString()}`);
                            }
                            return passes;
                        });

                        console.log(`After gte filter: ${results.length} calls remaining (removed ${beforeCount - results.length})`);
                    }

                    if (params.where.createdAt.lte) {
                        const maxDate = new Date(params.where.createdAt.lte);
                        console.log(`Filtering by createdAt <= ${maxDate.toISOString()}`);

                        const beforeCount = results.length;
                        results = results.filter(call => {
                            const callDate = new Date(call.createdAt);
                            const passes = callDate <= maxDate;
                            if (!passes) {
                                console.log(`EXCLUDED: Call ${call.id} createdAt: ${callDate.toISOString()} is after ${maxDate.toISOString()}`);
                            }
                            return passes;
                        });

                        console.log(`After lte filter: ${results.length} calls remaining (removed ${beforeCount - results.length})`);
                    }
                }

                // Filter by agentId if specified
                if (params.where.agentId) {
                    console.log(`Filtering by agentId: ${JSON.stringify(params.where.agentId)}`);

                    const beforeCount = results.length;

                    // Handle array of agentIds (IN filter)
                    if (Array.isArray(params.where.agentId) && params.where.agentId.some((id: any) => id?.in)) {
                        const agentIds = params.where.agentId.find((id: any) => id?.in)?.in || [];
                        console.log(`Filtering by agentId IN [${agentIds.join(', ')}]`);

                        if (agentIds.length > 0) {
                            results = results.filter(call => {
                                const passes = agentIds.includes(call.agentId);
                                if (!passes) {
                                    console.log(`EXCLUDED: Call ${call.id} agentId: ${call.agentId} not in [${agentIds.join(', ')}]`);
                                }
                                return passes;
                            });
                        }
                    } else {
                        // Handle exact match
                        results = results.filter(call => {
                            const passes = call.agentId === params.where.agentId;
                            if (!passes) {
                                console.log(`EXCLUDED: Call ${call.id} agentId: ${call.agentId} !== ${params.where.agentId}`);
                            }
                            return passes;
                        });
                    }

                    console.log(`After agentId filter: ${results.length} calls remaining (removed ${beforeCount - results.length})`);
                }

                // Filter by metadata if specified
                if (params.where.metadata) {
                    console.log("Filtering by metadata:", JSON.stringify(params.where.metadata, null, 2));

                    Object.entries(params.where.metadata).forEach(([key, value]) => {
                        const beforeCount = results.length;

                        console.log(`Checking metadata.${key} = ${JSON.stringify(value)}`);

                        results = results.filter(call => {
                            const hasMetadata = call.metadata && typeof call.metadata === 'object';
                            const metadataValue = hasMetadata ? call.metadata[key] : undefined;
                            const passes = hasMetadata && String(metadataValue) === String(value);

                            if (!passes) {
                                console.log(`EXCLUDED: Call ${call.id} metadata.${key}: ${JSON.stringify(metadataValue)} !== ${JSON.stringify(value)}`);
                            }
                            return passes;
                        });

                        console.log(`After metadata.${key} filter: ${results.length} calls remaining (removed ${beforeCount - results.length})`);
                    });
                }

                // Add any other necessary filters...
            }

            // Apply ordering if specified
            if (params?.orderBy) {
                console.log("Applying orderBy:", JSON.stringify(params.orderBy, null, 2));

                const { orderBy } = params;
                const field = typeof orderBy === 'object' ? Object.keys(orderBy)[0] : null;
                const direction = field ? orderBy[field] : null;

                if (field && direction) {
                    results.sort((a, b) => {
                        const valueA = a[field];
                        const valueB = b[field];

                        if (direction === 'asc') {
                            return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
                        } else {
                            return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
                        }
                    });

                    console.log(`Sorted by ${field} ${direction}`);
                }
            }

            // Apply pagination if specified
            if (params?.skip || params?.take) {
                console.log(`Applying pagination: skip=${params?.skip || 0}, take=${params?.take || 'all'}`);

                if (params?.skip) {
                    results = results.slice(params.skip);
                }
                if (params?.take) {
                    results = results.slice(0, params.take);
                }
            }

            console.log(`Final results: ${results.length} calls after all filters`);

            // Log the first few results for debugging
            const numToShow = Math.min(results.length, 5);
            if (numToShow > 0) {
                console.log(`First ${numToShow} results:`,
                    results.slice(0, numToShow).map(call => ({
                        id: call.id,
                        createdAt: new Date(call.createdAt).toISOString(),
                        metadata: call.metadata,
                        agentId: call.agentId
                    }))
                );
            } else {
                console.log("No results after filtering");
            }

            return results;
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

    // Fixed call mock with proper methods
    call = {
        create: async (params: any) => {
            console.log("Mock PrismaClient.call.create called with:", JSON.stringify(params, null, 2));
            const newCall = { ...params.data };
            mockStorage.calls.push(newCall);
            console.log(`Added call to mockStorage. Total calls: ${mockStorage.calls.length}`);
            return newCall;
        },

        findFirst: async (params: any) => {
            console.log("Mock PrismaClient.call.findFirst called with:", params);

            // Apply the same filtering logic as findMany
            let results = mockStorage.calls.slice();

            // Apply filters if provided
            if (params?.where) {
                if (params.where.createdAt) {
                    if (params.where.createdAt.gte) {
                        const minDate = new Date(params.where.createdAt.gte);
                        results = results.filter(call => new Date(call.createdAt) >= minDate);
                    }
                    if (params.where.createdAt.lte) {
                        const maxDate = new Date(params.where.createdAt.lte);
                        results = results.filter(call => new Date(call.createdAt) <= maxDate);
                    }
                }

                if (params.where.metadata) {
                    Object.entries(params.where.metadata).forEach(([key, value]) => {
                        results = results.filter(call => {
                            const hasMetadata = call.metadata && typeof call.metadata === 'object';
                            const metadataValue = hasMetadata ? call.metadata[key] : undefined;
                            return hasMetadata && metadataValue === value;
                        });
                    });
                }

                // Add other filters as needed
            }

            return results.length > 0 ? results[0] : null;
        },

        findMany: async (params: any) => {
            console.log("Mock PrismaClient.call.findMany called with:", JSON.stringify(params, null, 2));

            let results = mockStorage.calls.slice();
            console.log(`Starting with ${results.length} calls`);

            // Print all calls with their metadata
            console.log("All calls before filtering:",
                results.map(call => ({
                    id: call.id,
                    createdAt: new Date(call.createdAt).toISOString(),
                    metadata: call.metadata
                }))
            );

            // Apply filters if provided
            if (params?.where) {
                // Filter by time range if specified
                if (params.where.createdAt) {
                    if (params.where.createdAt.gte) {
                        const minDate = new Date(params.where.createdAt.gte);
                        console.log(`Filtering by createdAt >= ${minDate.toISOString()}`);

                        const beforeCount = results.length;
                        results = results.filter(call => {
                            const callDate = new Date(call.createdAt);
                            const passes = callDate >= minDate;
                            console.log(`Call ${call.id} createdAt: ${callDate.toISOString()}, passes gte: ${passes}`);
                            return passes;
                        });

                        console.log(`After gte filter: ${results.length} calls remaining`);
                    }

                    if (params.where.createdAt.lte) {
                        const maxDate = new Date(params.where.createdAt.lte);
                        console.log(`Filtering by createdAt <= ${maxDate.toISOString()}`);

                        const beforeCount = results.length;
                        results = results.filter(call => {
                            const callDate = new Date(call.createdAt);
                            const passes = callDate <= maxDate;
                            console.log(`Call ${call.id} createdAt: ${callDate.toISOString()}, passes lte: ${passes}`);
                            return passes;
                        });

                        console.log(`After lte filter: ${results.length} calls remaining`);
                    }
                }

                // Filter by metadata if specified
                if (params.where.metadata) {
                    console.log("Filtering by metadata:", params.where.metadata);

                    Object.entries(params.where.metadata).forEach(([key, value]) => {
                        const beforeCount = results.length;

                        console.log(`Checking metadata.${key} = ${value}`);

                        results = results.filter(call => {
                            const hasMetadata = call.metadata && typeof call.metadata === 'object';
                            const metadataValue = hasMetadata ? call.metadata[key] : undefined;
                            const passes = hasMetadata && metadataValue === value;

                            console.log(`Call ${call.id} metadata.${key}: ${metadataValue}, expected: ${value}, passes: ${passes}`);
                            return passes;
                        });

                        console.log(`After metadata.${key} filter: ${results.length} calls remaining`);
                    });
                }

                // Add other filters as needed (agentId, orgId, etc.)
            }

            // Apply ordering if specified
            if (params?.orderBy) {
                const { orderBy } = params;
                const field = typeof orderBy === 'object' ? Object.keys(orderBy)[0] : null;
                const direction = field ? orderBy[field] : null;

                if (field && direction) {
                    results.sort((a, b) => {
                        const valueA = a[field];
                        const valueB = b[field];

                        if (direction === 'asc') {
                            return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
                        } else {
                            return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
                        }
                    });

                    console.log(`Sorted by ${field} ${direction}`);
                }
            }

            // Apply pagination if specified
            if (params?.skip) {
                results = results.slice(params.skip);
            }
            if (params?.take) {
                results = results.slice(0, params.take);
            }

            console.log("Final results after all filters:",
                results.map(call => ({
                    id: call.id,
                    createdAt: new Date(call.createdAt).toISOString(),
                    metadata: call.metadata
                }))
            );

            return results;
        },

        count: async (params: any) => {
            console.log("Mock PrismaClient.call.count called with:", JSON.stringify(params, null, 2));

            let results = mockStorage.calls.slice();

            // Apply the same filtering logic as findMany
            if (params?.where) {
                // Apply the same filters as findMany
                // (this is abbreviated for brevity, you should copy the same logic)
                if (params.where.createdAt) {
                    if (params.where.createdAt.gte) {
                        const minDate = new Date(params.where.createdAt.gte);
                        results = results.filter(call => new Date(call.createdAt) >= minDate);
                    }
                    if (params.where.createdAt.lte) {
                        const maxDate = new Date(params.where.createdAt.lte);
                        results = results.filter(call => new Date(call.createdAt) <= maxDate);
                    }
                }

                if (params.where.metadata) {
                    Object.entries(params.where.metadata).forEach(([key, value]) => {
                        results = results.filter(call => {
                            const hasMetadata = call.metadata && typeof call.metadata === 'object';
                            const metadataValue = hasMetadata ? call.metadata[key] : undefined;
                            return hasMetadata && metadataValue === value;
                        });
                    });
                }
            }

            return results.length;
        },

        update: async (params: any) => {
            console.log("Mock PrismaClient.call.update called with:", JSON.stringify(params, null, 2));

            const { where, data } = params;
            const callIndex = mockStorage.calls.findIndex(call => call.id === where.id);

            if (callIndex >= 0) {
                // Update the call
                mockStorage.calls[callIndex] = {
                    ...mockStorage.calls[callIndex],
                    ...data,
                    updatedAt: new Date()
                };

                return mockStorage.calls[callIndex];
            }

            throw new Error(`Call with id ${where.id} not found`);
        },

        delete: async (params: any) => {
            console.log("Mock PrismaClient.call.delete called with:", JSON.stringify(params, null, 2));

            const { where } = params;
            const callIndex = mockStorage.calls.findIndex(call => call.id === where.id);

            if (callIndex >= 0) {
                // Remove the call
                const deletedCall = mockStorage.calls[callIndex];
                mockStorage.calls.splice(callIndex, 1);

                return deletedCall;
            }

            throw new Error(`Call with id ${where.id} not found`);
        }
    };

    // Add other models as needed
    agent = {
        findMany: async () => {
            return [
                { id: "agent-avi", name: "Agent Avi", systemPrompt: "You are Agent Avi", ownerId: "dev-org-id" }
            ];
        },
        // Add other methods as needed
    };

    // Add mock transaction
    $transaction = async (operations: any) => {
        console.log("Mock PrismaClient.$transaction called");
        if (Array.isArray(operations)) {
            return Promise.all(operations);
        }
        return operations();
    };

    // Debug method to inspect storage
    $debugStorage() {
        return {
            calls: mockStorage.calls.length,
            callDetails: mockStorage.calls.map(call => ({
                id: call.id,
                createdAt: call.createdAt,
                metadata: call.metadata
            }))
        };
    }

    // Reset storage method
    async $reset() {
        mockStorage.calls = [];
        console.log("Mock storage reset");
    }

    // No-op methods to match PrismaClient API
    async $connect() {
        return this;
    }

    async $disconnect() {
        // No-op
    }
}

// Create a singleton instance
const globalForPrisma = global as unknown as { mockPrisma: MockPrismaClient };
export const mockPrisma = globalForPrisma.mockPrisma || new MockPrismaClient();

// Only in development, keep reference in global object to prevent instantiation on hot reloads
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.mockPrisma = mockPrisma;
}