// /mnt/e/10xR/playground/fixa-observe/apps/web-app/src/server/utils/mocks/ScenarioService.ts
import { PrismaClient } from "@repo/db/src/index";

export class ScenarioService {
    constructor(private db: PrismaClient) { }

    async createScenario({ agentId, scenario, ownerId }: { agentId: string, scenario: any, ownerId: string }) {
        console.log("Mock ScenarioService.createScenario called with:", { agentId, scenario, ownerId });
        return {
            ...scenario,
            id: scenario.id || "mock-scenario-id-" + Date.now(),
            agentId,
            ownerId,
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }

    async updateScenario({ scenario, ownerId }: { scenario: any, ownerId: string }) {
        console.log("Mock ScenarioService.updateScenario called with:", { scenario, ownerId });
        return {
            ...scenario,
            ownerId,
            updatedAt: new Date()
        };
    }

    async deleteScenario({ id, ownerId }: { id: string, ownerId: string }) {
        console.log("Mock ScenarioService.deleteScenario called with:", { id, ownerId });
        return { id };
    }
}