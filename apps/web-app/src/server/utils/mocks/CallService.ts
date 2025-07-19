// /mnt/e/10xR/playground/fixa-observe/apps/web-app/src/server/utils/mocks/CallService.ts

export class CallService {
    constructor(private db: any) {
        console.log("Running CallService in mock mode");
    }

    async getCall(id: string, ownerId: string) {
        console.log("Mock CallService.getCall called with:", { id, ownerId });
        return this.db.call.findUnique({ where: { id } });
    }

    async getCalls({ ownerId, limit, filter, orderBy, cursor, testId, scenarioId }: any) {
        console.log("Mock CallService.getCalls called with:", { ownerId, limit, filter, orderBy, cursor, testId, scenarioId });

        // Build where condition
        const where: any = {
            ownerId,
            deleted: false,
            customerCallId: { not: null }
        };

        // Apply filters
        if (filter) {
            // Handle date ranges
            if (filter.lookbackPeriod) {
                const lookbackMs = typeof filter.lookbackPeriod.value === 'number'
                    ? filter.lookbackPeriod.value
                    : 24 * 60 * 60 * 1000; // Default to 24h

                where.startedAt = {
                    gte: new Date(Date.now() - lookbackMs)
                };
            }

            // Handle agent filter
            if (filter.agentId && filter.agentId.length > 0) {
                where.agentId = { in: filter.agentId };
            }

            // Handle metadata filter
            if (filter.metadata && Object.keys(filter.metadata).length > 0) {
                // For simplicity in the mock, we'll just add it directly
                where.metadata = filter.metadata;
            }

            // Handle customer call ID filter
            if (filter.customerCallId) {
                where.customerCallId = filter.customerCallId;
            }
        }

        // Add test or scenario filters if provided
        if (testId) {
            where.testId = testId;
        }

        if (scenarioId) {
            where.scenarioId = scenarioId;
        }

        // Define the order
        const orderByClause = orderBy ?
            { [orderBy.field]: orderBy.direction } :
            { startedAt: 'desc' };

        // Query with pagination
        const calls = await this.db.call.findMany({
            where,
            orderBy: orderByClause,
            take: limit || 10,
            skip: cursor ? 1 : 0, // Skip the cursor item if provided
            cursor: cursor ? { id: cursor } : undefined
        });

        // Determine the next cursor
        const nextCursor = calls.length === limit ? calls[calls.length - 1]?.id : null;

        return {
            items: calls,
            nextCursor
        };
    }

    async getCallByCustomerCallId({ customerCallId, ownerId }: { customerCallId: string, ownerId: string }) {
        console.log("Mock CallService.getCallByCustomerCallId called with:", { customerCallId, ownerId });
        return this.db.call.findUnique({
            where: { customerCallId_ownerId: { customerCallId, ownerId } }
        });
    }

    async getCallsByCustomerCallId({ customerCallId, orgId }: { customerCallId: string, orgId: string }) {
        console.log("Mock CallService.getCallsByCustomerCallId called with:", { customerCallId, orgId });
        return this.db.call.findMany({
            where: {
                customerCallId,
                ownerId: orgId
            }
        });
    }

    async updateIsRead({ callId, orgId, userId, isRead }: { callId: string, orgId: string, userId: string, isRead: boolean }) {
        console.log("Mock CallService.updateIsRead called with:", { callId, orgId, userId, isRead });
        return this.db.callRead.upsert({
            where: {
                callId_userId: {
                    callId,
                    userId
                }
            },
            create: {
                callId,
                userId,
                isRead
            },
            update: {
                isRead
            }
        });
    }

    async updateNotes({ callId, orgId, notes }: { callId: string, orgId: string, notes: string }) {
        console.log("Mock CallService.updateNotes called with:", { callId, orgId, notes });
        return this.db.call.update({
            where: { id: callId },
            data: { notes }
        });
    }

    async checkIfACallExists(orgId: string) {
        console.log("Mock CallService.checkIfACallExists called with:", { orgId });
        const call = await this.db.call.findFirst({
            where: {
                ownerId: orgId,
                customerCallId: { not: null }
            }
        });
        return !!call;
    }

    async getLatencyInterruptionPercentiles({ filter, ownerId }: { filter: any, ownerId: string }) {
        console.log("Mock CallService.getLatencyInterruptionPercentiles called with:", { filter, ownerId });

        // Generate mock percentile data for the requested time period
        const lookbackMs = filter?.lookbackPeriod?.value || 24 * 60 * 60 * 1000; // Default to 24h
        const chartPeriod = filter?.chartPeriod || 3600000; // Default to 1h intervals
        const numDataPoints = Math.ceil(lookbackMs / chartPeriod);

        const percentiles = Array(numDataPoints).fill(0).map((_, i) => ({
            date: new Date(Date.now() - (numDataPoints - 1 - i) * chartPeriod),
            latencyP50: 1.2 + Math.random() * 0.5,
            latencyP90: 2.5 + Math.random() * 0.5,
            latencyP95: 3.0 + Math.random() * 0.5,
            interruptionsP50: 1 + Math.floor(Math.random() * 2),
            interruptionsP90: 3 + Math.floor(Math.random() * 2),
            interruptionsP95: 5 + Math.floor(Math.random() * 2),
        }));

        return {
            latencyP50: 1.2,
            latencyP90: 2.5,
            latencyP95: 3.0,
            latencyAvg: 1.5,
            timeToFirstWordP50: 0.8,
            timeToFirstWordP90: 1.5,
            timeToFirstWordP95: 2.0,
            timeToFirstWordAvg: 1.0,
            interruptionsP50: 1,
            interruptionsP90: 3,
            interruptionsP95: 5,
            interruptionsAvg: 2,
            percentiles
        };
    }

    async updateBlocks({ callId, blocks, ownerId }: { callId: string, blocks: any[], ownerId: string }) {
        console.log("Mock CallService.updateBlocks called with:", { callId, blocks, ownerId });
        return {
            id: callId,
            blocks
        };
    }

    async getMetadata(orgId: string) {
        console.log("Mock CallService.getMetadata called with:", { orgId });
        return {
            keys: ["intent", "category", "agent", "test"],
            values: {
                intent: ["booking", "support", "inquiry"],
                category: ["sales", "customer service", "technical"],
                agent: ["agent1", "agent2", "agent3"],
                test: ["true", "false"]
            }
        };
    }
}