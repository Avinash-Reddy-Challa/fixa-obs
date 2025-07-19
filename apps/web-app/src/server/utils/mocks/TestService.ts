// /mnt/e/10xR/playground/fixa-observe/apps/web-app/src/server/utils/mocks/TestService.ts
import { PrismaClient } from "@repo/db/src/index";

export class TestService {
    constructor(private db: PrismaClient, private posthogClient: any) { }

    async get(id: string, ownerId: string) {
        console.log("Mock TestService.get called with:", { id, ownerId });
        return {
            id,
            name: "Mock Test " + id,
            agentId: "mock-agent-id",
            ownerId,
            status: "completed",
            createdAt: new Date(),
            updatedAt: new Date(),
            calls: []
        };
    }

    async getAll(agentId: string, ownerId: string) {
        console.log("Mock TestService.getAll called with:", { agentId, ownerId });
        return Array(3).fill(0).map((_, i) => ({
            id: `mock-test-${i}`,
            name: `Mock Test ${i}`,
            agentId,
            ownerId,
            status: "completed",
            createdAt: new Date(),
            updatedAt: new Date(),
            calls: []
        }));
    }

    async run({ ownerId, agentId, scenarioIds, testAgentIds }: { ownerId: string, agentId: string, scenarioIds: string[], testAgentIds: string[] }) {
        console.log("Mock TestService.run called with:", { ownerId, agentId, scenarioIds, testAgentIds });
        return {
            id: "mock-test-id-" + Date.now(),
            name: "Mock Test",
            agentId,
            ownerId,
            status: "queued",
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }

    async getLastTest(agentId: string, ownerId: string) {
        console.log("Mock TestService.getLastTest called with:", { agentId, ownerId });
        return {
            id: "mock-test-id",
            name: "Mock Test",
            agentId,
            ownerId,
            status: "completed",
            createdAt: new Date(),
            updatedAt: new Date(),
            calls: []
        };
    }
}